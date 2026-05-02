import type { User } from '@/types/harmony';
import { Heart } from 'lucide-react';

interface EmotionRadarProps {
  users: User[];
}

export function EmotionRadar({ users }: EmotionRadarProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center">
        <Heart className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
        情绪监测
      </h3>
      <div className="space-y-3">
        {users.map((user) => {
          const score = user.emotionScore;
          const normalized = Math.round(((score + 1) / 2) * 100);
          const color = normalized > 60 ? 'bg-emerald-400' : normalized > 30 ? 'bg-amber-400' : 'bg-rose-400';
          const label = normalized > 60 ? '积极' : normalized > 30 ? '中性' : '需要关注';

          return (
            <div key={user.id} className="bg-white/50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-700">{user.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  normalized > 60 ? 'bg-emerald-50 text-emerald-600' :
                  normalized > 30 ? 'bg-amber-50 text-amber-600' :
                  'bg-rose-50 text-rose-600'
                }`}>
                  {label}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-700 rounded-full`}
                  style={{ width: `${Math.max(5, normalized)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">情绪值</span>
                <span className="text-[10px] text-slate-500">{normalized}%</span>
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="text-xs text-slate-400 text-center py-4">
            等待用户加入...
          </div>
        )}
      </div>
    </div>
  );
}
