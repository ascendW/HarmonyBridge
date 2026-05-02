import { useNavigate } from 'react-router';
import { Heart, MessageCircle, Shield, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-indigo-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-violet-500 shadow-lg shadow-rose-200 mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-rose-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent mb-4"
        >
          HarmonyBridge
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mb-4"
        >
          情侣争端解决与情绪价值 Agent 系统
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-sm text-slate-500 max-w-lg mb-10"
        >
          当情绪占据上风，我们为你搭建一座桥梁。通过三位 AI Agent 的协作——
          心理侦测、共情疏解、外交官调解——将冲突转化为建设性对话。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            size="lg"
            onClick={() => navigate('/select')}
            className="bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-rose-200 transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            开始调解
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full"
        >
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="心理侦测 Agent"
            desc="去情绪化提取，洞察言语背后的深层心理动机"
            color="from-amber-400 to-orange-500"
          />
          <FeatureCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="共情疏解 Agent"
            desc="即时心理按摩，防止矛盾即时爆发"
            color="from-emerald-400 to-teal-500"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="外交官 Agent"
            desc="非暴力沟通转化，定制化破冰建议"
            color="from-blue-400 to-indigo-500"
          />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-400">
        WS 架构 · WebSocket 实时通讯 · Multi-Agent CoT 推理
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
