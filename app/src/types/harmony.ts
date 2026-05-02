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

export type SessionStage = 'waiting' | 'intake' | 'analysis' | 'empathy' | 'diplomacy' | 'resolution' | 'closed';

export interface SessionState {
  id: string;
  users: User[];
  messages: Message[];
  stage: SessionStage;
  turn: number;
  detectedNeeds: string[];
  conflictTopics: string[];
}

export type WSBroadcast =
  | { type: 'user_joined'; user: User; sessionState: SessionState }
  | { type: 'message'; message: Message }
  | { type: 'agent_thinking'; agent: AgentType; steps: CoTStep[] }
  | { type: 'agent_complete'; result: { agent: AgentType; output: string; cotSteps: CoTStep[]; emotionData?: EmotionData; breakthroughSuggestion?: string } }
  | { type: 'emotion_update'; userId: string; emotionData: EmotionData }
  | { type: 'stage_change'; stage: SessionStage }
  | { type: 'typing_indicator'; userId: string; isTyping: boolean }
  | { type: 'session_state'; state: SessionState }
  | { type: 'error'; message: string };
