export type UserRole = 'partnerA' | 'partnerB';

export type AgentType = 'psychDetector' | 'empathySoother' | 'diplomat';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  emotionScore: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderRole: UserRole | 'system' | AgentType;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'user' | 'agent_thought' | 'agent_response' | 'system' | 'breakthrough';
  agentType?: AgentType;
  emotionData?: EmotionData;
  cotSteps?: CoTStep[];
}

export interface EmotionData {
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
  dominantEmotion: string;
  needs: string[];
  triggers: string[];
}

export interface CoTStep {
  agent: AgentType;
  step: number;
  thought: string;
  action: string;
}

export interface AgentResult {
  agent: AgentType;
  output: string;
  cotSteps: CoTStep[];
  emotionData?: EmotionData;
  breakthroughSuggestion?: string;
}

export interface SessionState {
  id: string;
  users: User[];
  messages: Message[];
  stage: 'waiting' | 'intake' | 'analysis' | 'empathy' | 'diplomacy' | 'resolution' | 'closed';
  turn: number;
  detectedNeeds: string[];
  conflictTopics: string[];
}

export type WSMessage =
  | { type: 'join'; role: UserRole; name: string }
  | { type: 'chat'; content: string }
  | { type: 'typing'; isTyping: boolean }
  | { type: 'ack_agent'; agentType: AgentType }
  | { type: 'request_breakthrough' }
  | { type: 'session_end' };

export type WSBroadcast =
  | { type: 'user_joined'; user: User; sessionState: SessionState }
  | { type: 'message'; message: Message }
  | { type: 'agent_thinking'; agent: AgentType; steps: CoTStep[] }
  | { type: 'agent_complete'; result: AgentResult }
  | { type: 'emotion_update'; userId: string; emotionData: EmotionData }
  | { type: 'stage_change'; stage: SessionState['stage'] }
  | { type: 'typing_indicator'; userId: string; isTyping: boolean }
  | { type: 'session_state'; state: SessionState }
  | { type: 'error'; message: string };
