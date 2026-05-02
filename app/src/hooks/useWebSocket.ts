import { useState, useEffect, useRef, useCallback } from 'react';
import type { WSBroadcast, SessionState, Message } from '@/types/harmony';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingAgents, setThinkingAgents] = useState<Set<string>>(new Set());
  const [agentResults, setAgentResults] = useState<Map<string, WSBroadcast & { type: 'agent_complete' }>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data: WSBroadcast = JSON.parse(event.data);

        switch (data.type) {
          case 'session_state':
            setSessionState(data.state);
            setMessages(data.state.messages);
            break;

          case 'user_joined':
            setSessionState(data.sessionState);
            break;

          case 'message':
            setMessages(prev => {
              if (prev.some(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
            break;

          case 'agent_thinking':
            setThinkingAgents(prev => new Set([...prev, data.agent]));
            break;

          case 'agent_complete':
            setThinkingAgents(prev => {
              const next = new Set(prev);
              next.delete(data.result.agent);
              return next;
            });
            setAgentResults(prev => new Map([...prev, [data.result.agent, data]]));
            break;

          case 'emotion_update':
            setSessionState(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                users: prev.users.map(u =>
                  u.id === data.userId
                    ? { ...u, emotionScore: data.emotionData.valence }
                    : u
                ),
              };
            });
            break;

          case 'stage_change':
            setSessionState(prev => prev ? { ...prev, stage: data.stage } : prev);
            break;

          case 'typing_indicator':
            setTypingUsers(prev => {
              const next = new Set(prev);
              if (data.isTyping) next.add(data.userId);
              else next.delete(data.userId);
              return next;
            });
            break;

          case 'error':
            setError(data.message);
            break;
        }
      } catch {
        // ignore malformed
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setError('WebSocket connection error');
      setConnected(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const join = useCallback((role: 'partnerA' | 'partnerB', name: string) => {
    send({ type: 'join', role, name });
  }, [send]);

  const sendMessage = useCallback((content: string) => {
    send({ type: 'chat', content });
  }, [send]);

  const setTyping = useCallback((isTyping: boolean) => {
    send({ type: 'typing', isTyping });
  }, [send]);

  const endSession = useCallback(() => {
    send({ type: 'session_end' });
  }, [send]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    connect,
    disconnect,
    join,
    sendMessage,
    setTyping,
    endSession,
    sessionState,
    messages,
    thinkingAgents,
    agentResults,
    typingUsers,
    error,
  };
}
