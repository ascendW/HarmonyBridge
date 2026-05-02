import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RoleSelect() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'partnerA' | 'partnerB' | null>(null);
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!name.trim()) {
      setError('请输入你的昵称');
      return;
    }
    if (!role) {
      setError('请选择你的角色');
      return;
    }
    navigate(`/chat?role=${role}&name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-indigo-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </button>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/60">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">进入调解室</h2>
          <p className="text-sm text-slate-500 mb-6">选择你的角色，开始建设性对话</p>

          <div className="space-y-4 mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">你的昵称</label>
            <Input
              placeholder="输入昵称..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/80 border-slate-200 focus:border-rose-300 focus:ring-rose-200"
            />
          </div>

          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">选择角色</label>
            <button
              onClick={() => setRole('partnerA')}
              className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${
                role === 'partnerA'
                  ? 'border-rose-400 bg-rose-50/50 shadow-sm'
                  : 'border-slate-100 bg-white/50 hover:border-slate-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                role === 'partnerA' ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-800">伴侣 A</div>
                <div className="text-xs text-slate-500">先表达的一方</div>
              </div>
            </button>

            <button
              onClick={() => setRole('partnerB')}
              className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${
                role === 'partnerB'
                  ? 'border-indigo-400 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-100 bg-white/50 hover:border-slate-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                role === 'partnerB' ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-100 text-slate-400'
              }`}>
                <Heart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-800">伴侣 B</div>
                <div className="text-xs text-slate-500">回应的一方</div>
              </div>
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-500 mb-4">{error}</div>
          )}

          <Button
            onClick={handleJoin}
            className="w-full bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 text-white rounded-xl py-5 text-base"
          >
            进入调解室
          </Button>
        </div>
      </div>
    </div>
  );
}
