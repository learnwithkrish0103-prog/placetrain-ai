import React, { useState } from 'react';
import {
  Compass,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Flame,
} from 'lucide-react';
import { DailyQuestPlan, QuestMission, StudyDuration } from '../../types/aptitude';
import { calculateLevelFromXp, LEVEL_TIERS } from '../../services/storage';

interface PlacementQuestCardProps {
  questPlan: DailyQuestPlan;
  onChangeDuration: (duration: StudyDuration) => void;
  onStartMission: (mission: QuestMission) => void;
  onClaimXp: (missionId: string) => void;
  totalXp: number;
}

export const PlacementQuestCard: React.FC<PlacementQuestCardProps> = ({
  questPlan,
  onChangeDuration,
  onStartMission,
  onClaimXp,
  totalXp,
}) => {
  const currentLevelInfo = calculateLevelFromXp(totalXp);
  const nextLevelInfo =
    LEVEL_TIERS.find((t) => t.level === currentLevelInfo.level + 1) || currentLevelInfo;

  const xpInCurrentLevel = totalXp - currentLevelInfo.minXp;
  const xpNeededForLevel = Math.max(1, nextLevelInfo.minXp - currentLevelInfo.minXp);
  const progressPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Top Strip: Level, XP Progress & Study Duration Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        {/* Level & Rank Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex flex-col items-center justify-center shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">LVL</span>
            <span className="text-base font-extrabold leading-none">{currentLevelInfo.level}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{currentLevelInfo.title}</h3>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {totalXp} XP
              </span>
            </div>

            {/* Level Progress Bar */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-32 sm:w-48 bg-slate-100 rounded-full h-2 border border-slate-200/60 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {totalXp} / {nextLevelInfo.minXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Daily Study Duration Selector (15 / 30 / 60 Mins) */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 pl-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Target:</span>
          </span>
          {([15, 30, 60] as StudyDuration[]).map((dur) => (
            <button
              key={dur}
              onClick={() => onChangeDuration(dur)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                questPlan.durationMinutes === dur
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {dur} Mins
            </button>
          ))}
        </div>
      </div>

      {/* Quest Missions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Today's Placement Quest ({questPlan.durationMinutes} Min Plan)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete daily missions using real practice activities to earn XP and level up.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            {questPlan.earnedXp} / {questPlan.totalXpAvailable} XP Earned Today
          </span>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questPlan.missions.map((mission) => {
          const progressPercent = Math.min(
            100,
            Math.round((mission.currentCount / mission.targetCount) * 100)
          );

          return (
            <div
              key={mission.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                mission.isCompleted
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {mission.title}
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    +{mission.xpReward} XP
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{mission.description}</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Progress:</span>
                    <span>
                      {mission.currentCount} / {mission.targetCount}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200/50">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        mission.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100">
                {mission.isCompleted ? (
                  mission.isClaimed ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>XP Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onClaimXp(mission.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer animate-bounce"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim +{mission.xpReward} XP</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onStartMission(mission)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Start Mission</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
