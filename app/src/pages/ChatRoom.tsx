import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AgentPanel } from '@/components/AgentPanel';
import { MessageBubble } from '@/components/MessageBubble';
import { EmotionRadar } from '@/components/EmotionRadar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, LogOut, Brain, Heart, Shield, Users } from 'lucide-react';

export default function ChatRoom() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'partnerA' | 'partnerB' | null;
  const name = searchParams.get('name') || '匿名';

  const {
    connected,
    connect,
    join,
    sendMessage,
    setTyping,
    endSession,
    sessionState,
    messages,
    thinkingAgents,
    typingUsers,
    error,
  } = useWebSocket();

  const [input, setInput] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (connected && role && !hasJoined) {
      join(role, name);
      setHasJoined(true);
    }
  }, [connected, role, name, hasJoined, join]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinkingAgents]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    setTyping(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 1000);
  };

  const handleEnd = () => {
    endSession();
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      waiting: '等待中',
      intake: '诉求收录',
      analysis: '心理侦测中',
      empathy: '共情疏解中',
      diplomacy: '外交调解中',
      resolution: '方案生成',
      closed: '已结束',
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      waiting: 'bg-slate-100 text-slate-600',
      intake: 'bg-amber-100 text-amber-700',
      analysis: 'bg-violet-100 text-violet-700',
      empathy: 'bg-emerald-100 text-emerald-700',
      diplomacy: 'bg-blue-100 text-blue-700',
      resolution: 'bg-rose-100 text-rose-700',
      closed: 'bg-gray-100 text-gray-600',
    };
    return colors[stage] || 'bg-slate-100 text-slate-600';
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">角色参数缺失，请先选择角色</p>
          <Button onClick={() => window.location.href = '/select'}>前往选择</Button>
        </div>
      </div>
    );
  }

  const currentUserId = sessionState?.users.find(u => u.role === role)?.id;
  const otherTyping = Array.from(typingUsers).some(id => id !== currentUserId);

  return (
    <div className="h-screen bg-gradient-to-br from-rose-50/30 via-slate-50 to-indigo-50/30 flex flex-col">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-violet-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">HarmonyBridge</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`text-xs ${getStageColor(sessionState?.stage || 'waiting')}`}>
                {getStageLabel(sessionState?.stage || 'waiting')}
              </Badge>
              {connected ? (
                <span className="text-xs text-emerald-500 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                  已连接
                </span>
              ) : (
                <span className="text-xs text-amber-500">连接中...</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center text-xs text-slate-500 mr-2">
            <Users className="w-3.5 h-3.5 mr-1" />
            {sessionState?.users.length || 0}/2
          </div>
          <Button variant="ghost" size="sm" onClick={handleEnd} className="text-slate-500 hover:text-rose-500">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="p-4">
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === currentUserId} />
                ))}

              {/* Thinking indicators */}
              {Array.from(thinkingAgents).map((agent) => (
                <div key={agent} className="flex items-center space-x-2 text-sm text-slate-400 py-2">
                  {agent === 'psychDetector' && <Brain className="w-4 h-4 animate-pulse text-violet-400" />}
                  {agent === 'empathySoother' && <Heart className="w-4 h-4 animate-pulse text-emerald-400" />}
                  {agent === 'diplomat' && <Shield className="w-4 h-4 animate-pulse text-blue-400" />}
                  <span>
                    {agent === 'psychDetector' && '心理侦测 Agent 正在分析...'}
                    {agent === 'empathySoother' && '共情疏解 Agent 正在生成...'}
                    {agent === 'diplomat' && '外交官 Agent 正在翻译...'}
                  </span>
                </div>
              ))}

              {otherTyping && (
                <div className="flex items-center space-x-2 text-sm text-slate-400 py-1">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>对方正在输入...</span>
                </div>
              )}
              </div>
            </div>
          </ScrollArea>

          {/* Input */}
          {sessionState?.stage !== 'closed' && (
            <div className="bg-white/60 backdrop-blur-sm border-t border-slate-200/60 p-4">
              <div className="max-w-3xl mx-auto flex space-x-3">
                <Input
                  placeholder="表达你的感受和诉求..."
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 bg-white/80 border-slate-200 focus:border-rose-300 focus:ring-rose-200"
                  disabled={!connected || sessionState?.stage === 'analysis'}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !connected || sessionState?.stage === 'analysis'}
                  className="bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 text-white px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {error && <p className="text-xs text-red-500 mt-2 max-w-3xl mx-auto">{error}</p>}
            </div>
          )}
        </div>

        {/* Sidebar: Agent Panel + Emotion Radar */}
        <div className="w-80 bg-white/40 backdrop-blur-sm border-l border-slate-200/60 flex flex-col overflow-hidden hidden lg:flex">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AgentPanel
              agentType="psychDetector"
              title="心理侦测 Agent"
              icon={<Brain className="w-4 h-4" />}
              color="violet"
              isThinking={thinkingAgents.has('psychDetector')}
              messages={messages.filter(m => m.agentType === 'psychDetector')}
            />
            <AgentPanel
              agentType="empathySoother"
              title="共情疏解 Agent"
              icon={<Heart className="w-4 h-4" />}
              color="emerald"
              isThinking={thinkingAgents.has('empathySoother')}
              messages={messages.filter(m => m.agentType === 'empathySoother')}
            />
            <AgentPanel
              agentType="diplomat"
              title="外交官 Agent"
              icon={<Shield className="w-4 h-4" />}
              color="blue"
              isThinking={thinkingAgents.has('diplomat')}
              messages={messages.filter(m => m.agentType === 'diplomat')}
            />
          </div>

          {/* Emotion Radar */}
          <div className="border-t border-slate-200/60 p-4">
            <EmotionRadar users={sessionState?.users || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
