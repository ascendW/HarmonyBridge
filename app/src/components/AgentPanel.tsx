import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@/types/harmony';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AgentPanelProps {
  agentType: string;
  title: string;
  icon: React.ReactNode;
  color: 'violet' | 'emerald' | 'blue';
  isThinking: boolean;
  messages: Message[];
}

const colorMap = {
  violet: {
    border: 'border-violet-200',
    bg: 'bg-violet-50/30',
    badge: 'bg-violet-100 text-violet-700',
    pulse: 'bg-violet-400',
  },
  emerald: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/30',
    badge: 'bg-emerald-100 text-emerald-700',
    pulse: 'bg-emerald-400',
  },
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50/30',
    badge: 'bg-blue-100 text-blue-700',
    pulse: 'bg-blue-400',
  },
};

export function AgentPanel({ title, icon, color, isThinking, messages }: AgentPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const colors = colorMap[color];
  const latestMessage = messages[messages.length - 1];

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/30 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-lg ${colors.badge} flex items-center justify-center`}>
            {icon}
          </div>
          <span className="text-xs font-medium text-slate-700">{title}</span>
          {isThinking && (
            <span className={`w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
          )}
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {latestMessage ? (
                <div className="text-xs text-slate-600 bg-white/50 rounded-lg p-2.5 leading-relaxed">
                  {latestMessage.content.slice(0, 120)}
                  {latestMessage.content.length > 120 && '...'}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic p-2">
                  等待用户输入以开始分析...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
