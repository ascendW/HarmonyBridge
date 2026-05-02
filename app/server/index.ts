import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  SessionState,
  User,
  UserRole,
  Message,
  WSMessage,
  WSBroadcast,
} from './types';
import { runAgentPipeline, analyzePsychology } from './agents';

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;

const sessions = new Map<string, SessionState>();
const userSockets = new Map<string, WebSocket>();

function createSession(): SessionState {
  return {
    id: uuidv4(),
    users: [],
    messages: [],
    stage: 'waiting',
    turn: 0,
    detectedNeeds: [],
    conflictTopics: [],
  };
}

function broadcast(sessionId: string, message: WSBroadcast) {
  const session = sessions.get(sessionId);
  if (!session) return;
  const data = JSON.stringify(message);
  session.users.forEach(u => {
    const socket = userSockets.get(u.id);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
}

function addSystemMessage(session: SessionState, content: string): Message {
  const msg: Message = {
    id: uuidv4(),
    senderId: 'system',
    senderRole: 'system',
    senderName: 'HarmonyBridge',
    content,
    timestamp: Date.now(),
    type: 'system',
  };
  session.messages.push(msg);
  return msg;
}

function addAgentMessage(
  session: SessionState,
  agentType: 'psychDetector' | 'empathySoother' | 'diplomat',
  content: string,
  cotSteps: any[],
  emotionData?: any
): Message {
  const names = {
    psychDetector: '心理侦测Agent',
    empathySoother: '共情疏解Agent',
    diplomat: '外交官Agent',
  };
  const msg: Message = {
    id: uuidv4(),
    senderId: agentType,
    senderRole: agentType,
    senderName: names[agentType],
    content,
    timestamp: Date.now(),
    type: 'agent_response',
    agentType,
    emotionData,
    cotSteps,
  };
  session.messages.push(msg);
  return msg;
}

async function processMessage(session: SessionState, userMessage: Message) {
  const partnerNeeds = session.detectedNeeds;
  
  // Stage: intake -> analysis
  session.stage = 'analysis';
  broadcast(session.id, { type: 'stage_change', stage: 'analysis' });

  // Run Agent Pipeline
  const results = runAgentPipeline(userMessage.content, partnerNeeds);

  for (const result of results) {
    // Send thinking steps first
    broadcast(session.id, {
      type: 'agent_thinking',
      agent: result.agent,
      steps: result.cotSteps,
    });

    // Small delay for dramatic effect
    await new Promise(r => setTimeout(r, 800));

    // Send complete result
    const msg = addAgentMessage(
      session,
      result.agent,
      result.output,
      result.cotSteps,
      result.emotionData
    );

    broadcast(session.id, { type: 'message', message: msg });
    broadcast(session.id, {
      type: 'agent_complete',
      result: result as any,
    });

    // Update emotion if available
    if (result.emotionData) {
      broadcast(session.id, {
        type: 'emotion_update',
        userId: userMessage.senderId,
        emotionData: result.emotionData,
      });
    }

    // Collect needs
    if (result.emotionData?.needs) {
      session.detectedNeeds.push(...result.emotionData.needs);
    }
  }

  // Stage resolution if both have spoken
  session.turn += 1;
  const uniqueUsers = new Set(session.messages.filter(m => m.type === 'user').map(m => m.senderId));
  
  if (uniqueUsers.size >= 2 && session.turn >= 2) {
    session.stage = 'resolution';
    broadcast(session.id, { type: 'stage_change', stage: 'resolution' });
    
    const breakthroughMsg = addSystemMessage(
      session,
      '双方视角已充分收集。系统已生成个性化破冰方案。请查看外交官Agent的建议，尝试用非暴力沟通的方式重新连接。'
    );
    broadcast(session.id, { type: 'message', message: breakthroughMsg });
  } else {
    session.stage = 'waiting';
    broadcast(session.id, { type: 'stage_change', stage: 'waiting' });
    
    const waitMsg = addSystemMessage(
      session,
      `已收录${session.users.find(u => u.id === userMessage.senderId)?.name || '一方'}的诉求。等待另一方回应以生成完整对话方案...`
    );
    broadcast(session.id, { type: 'message', message: waitMsg });
  }
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  let currentUser: User | null = null;
  let currentSession: SessionState | null = null;

  ws.on('message', (rawData) => {
    try {
      const data: WSMessage = JSON.parse(rawData.toString());

      if (data.type === 'join') {
        // Find or create session
        let session: SessionState | undefined;
        
        // Try to find a waiting session with only 1 user
        for (const s of sessions.values()) {
          if (s.users.length === 1 && s.stage === 'waiting') {
            session = s;
            break;
          }
        }
        
        if (!session) {
          session = createSession();
          sessions.set(session.id, session);
        }

        const user: User = {
          id: uuidv4(),
          role: data.role,
          name: data.name,
          emotionScore: 0,
        };

        currentUser = user;
        currentSession = session;
        session.users.push(user);
        userSockets.set(user.id, ws);

        // Send session state
        const stateMsg: WSBroadcast = {
          type: 'session_state',
          state: session,
        };
        ws.send(JSON.stringify(stateMsg));

        // Broadcast user joined
        broadcast(session.id, {
          type: 'user_joined',
          user,
          sessionState: session,
        });

        // System message
        if (session.users.length === 1) {
          const msg = addSystemMessage(session, `欢迎 ${data.name}。你是第一位进入争端调解室的${data.role === 'partnerA' ? '伴侣A' : '伴侣B'}。等待另一位伴侣加入...`);
          broadcast(session.id, { type: 'message', message: msg });
        } else {
          const msg = addSystemMessage(session, `${data.name} 已进入调解室。双方就位，可以开始表达你的感受和诉求。记住：这里没有对错，只有被理解的需要。`);
          broadcast(session.id, { type: 'message', message: msg });
          session.stage = 'intake';
          broadcast(session.id, { type: 'stage_change', stage: 'intake' });
        }
      }

      if (data.type === 'chat' && currentUser && currentSession) {
        const msg: Message = {
          id: uuidv4(),
          senderId: currentUser.id,
          senderRole: currentUser.role,
          senderName: currentUser.name,
          content: data.content,
          timestamp: Date.now(),
          type: 'user',
        };

        currentSession.messages.push(msg);
        broadcast(currentSession.id, { type: 'message', message: msg });

        // Trigger agent pipeline
        processMessage(currentSession, msg);
      }

      if (data.type === 'typing' && currentUser && currentSession) {
        broadcast(currentSession.id, {
          type: 'typing_indicator',
          userId: currentUser.id,
          isTyping: data.isTyping,
        });
      }

      if (data.type === 'session_end' && currentSession) {
        currentSession.stage = 'closed';
        const msg = addSystemMessage(currentSession, '调解会话已结束。感谢你们的勇气和开放。记住：理解先于解决。');
        broadcast(currentSession.id, { type: 'message', message: msg });
        broadcast(currentSession.id, { type: 'stage_change', stage: 'closed' });
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    if (currentUser && currentSession) {
      userSockets.delete(currentUser.id);
      currentSession.users = currentSession.users.filter(u => u.id !== currentUser!.id);
      
      if (currentSession.users.length === 0) {
        sessions.delete(currentSession.id);
      } else {
        const msg = addSystemMessage(currentSession, `${currentUser.name} 已离开调解室。`);
        broadcast(currentSession.id, { type: 'message', message: msg });
      }
    }
  });
});

console.log(`HarmonyBridge WebSocket Server running on ws://localhost:${PORT}`);
