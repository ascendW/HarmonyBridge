import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/types/harmony';
import { Brain, Heart, Shield, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showCoT, setShowCoT] = useState(false);

  const isSystem = message.type === 'system';
  const isAgent = message.type === 'agent_response';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-slate-100/80 text-slate-500 text-xs px-4 py-2 rounded-full max-w-md text-center">
          <Sparkles className="w-3 h-3 inline mr-1" />
          {message.content}
        </div>
      </div>
    );
  }

  if (isAgent) {
    const agentColors = {
      psychDetector: 'border-l-4 border-violet-400 bg-violet-50/50',
      empathySoother: 'border-l-4 border-emerald-400 bg-emerald-50/50',
      diplomat: 'border-l-4 border-blue-400 bg-blue-50/50',
    };
    const agentIcons = {
      psychDetector: <Brain className="w-3.5 h-3.5 text-violet-500" />,
      empathySoother: <Heart className="w-3.5 h-3.5 text-emerald-500" />,
      diplomat: <Shield className="w-3.5 h-3.5 text-blue-500" />,
    };
    const agentNames = {
      psychDetector: '心理侦测 Agent',
      empathySoother: '共情疏解 Agent',
      diplomat: '外交官 Agent',
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`rounded-xl p-3 ${agentColors[message.agentType || 'psychDetector']} max-w-lg`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {agentIcons[message.agentType || 'psychDetector']}
          <span className="text-xs font-medium text-slate-600">
            {agentNames[message.agentType || 'psychDetector']}
          </span>
        </div>
        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {message.content}
        </div>

        {/* CoT Steps */}
        {message.cotSteps && message.cotSteps.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowCoT(!showCoT)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center transition-colors"
            >
              {showCoT ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
              {showCoT ? '隐藏思维链' : '查看思维链'}
            </button>
            {showCoT && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1.5"
              >
                {message.cotSteps.map((step, i) => (
                  <div key={i} className="text-xs text-slate-500 bg-white/40 rounded-lg p-2">
                    <span className="font-medium">Step {step.step}:</span> {step.thought}
                    <div className="text-slate-400 mt-0.5">→ {step.action}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-md px-4 py-2.5 rounded-2xl ${
        isOwn
          ? 'bg-gradient-to-br from-rose-400 to-violet-500 text-white rounded-br-md'
          : 'bg-white/80 text-slate-700 border border-slate-200/60 rounded-bl-md'
      }`}>
        <div className={`text-xs mb-1 ${isOwn ? 'text-white/70' : 'text-slate-400'}`}>
          {message.senderName}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-line">{message.content}</div>
        <div className={`text-[10px] mt-1 text-right ${isOwn ? 'text-white/50' : 'text-slate-300'}`}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
