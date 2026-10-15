import React from 'react';
import { Award, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { Achievement } from '../../types/aptitude';

interface AchievementsShowcaseProps {
  achievements: Achievement[];
}

export const AchievementsShowcase: React.FC<AchievementsShowcaseProps> = ({
  achievements,
}) => {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Placement Achievements</h2>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {unlockedCount} / {achievements.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Badges and XP awarded for demonstrating disciplined placement preparation.
            </p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {achievements.map((ach) => {
          const progressPercent = Math.min(
            100,
            Math.round((ach.progress.current / ach.progress.target) * 100)
          );

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                ach.isUnlocked
                  ? 'bg-purple-50/20 border-purple-200 shadow-xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-75'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      ach.isUnlocked
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {ach.isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    +{ach.xpReward} XP
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {ach.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{ach.description}</p>
              </div>

              {/* Progress Bar / Unlocked tag */}
              <div className="pt-2 border-t border-slate-100">
                {ach.isUnlocked ? (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlocked & Claimed</span>
                  </span>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Progress:</span>
                      <span>
                        {ach.progress.current} / {ach.progress.target} {ach.progress.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
