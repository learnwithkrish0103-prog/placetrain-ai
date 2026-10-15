import React, { useState } from 'react';
import { Flame, CheckCircle2, Award, ArrowRight, Play, Timer } from 'lucide-react';
import { VERIFIED_QUESTION_BANK } from '../../data/questionBank';
import { PlaceTrackStorage } from '../../services/storage';
import { Question } from '../../types/aptitude';

interface DailyChallengeCardProps {
  onStartDailyChallenge: (questions: Question[]) => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ onStartDailyChallenge }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyRecord = PlaceTrackStorage.getDailyChallenge(todayStr);

  // Deterministic daily question selection (5 questions) based on date hash
  const getTodayQuestions = (): Question[] => {
    // Pick 5 distinct questions from verified bank across categories
    const quantQ = VERIFIED_QUESTION_BANK.filter((q) => q.category === 'quant');
    const logQ = VERIFIED_QUESTION_BANK.filter((q) => q.category === 'logical');
    const verbQ = VERIFIED_QUESTION_BANK.filter((q) => q.category === 'verbal');
    const diQ = VERIFIED_QUESTION_BANK.filter((q) => q.category === 'di');

    return [
      quantQ[0] || VERIFIED_QUESTION_BANK[0],
      quantQ[1] || VERIFIED_QUESTION_BANK[1],
      logQ[0] || VERIFIED_QUESTION_BANK[2],
      verbQ[0] || VERIFIED_QUESTION_BANK[3],
      diQ[0] || VERIFIED_QUESTION_BANK[4],
    ].filter((q): q is Question => q !== undefined);
  };

  const todayQuestions = getTodayQuestions();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Daily Aptitude Drill · {todayStr}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Today's 5-Question Challenge</h2>
          </div>
        </div>

        {dailyRecord ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Completed Today ({dailyRecord.score}/{dailyRecord.total} Score)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Timer className="w-3.5 h-3.5" />
            <span>Estimated time: 6 mins</span>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        Sharpen your reflexes daily. Solve 5 curated questions covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Data Interpretation to keep your streak active.
      </p>

      {/* Preview of 5 questions metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {todayQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col justify-between space-y-1"
          >
            <div className="text-slate-400 font-bold">#0{idx + 1}</div>
            <div className="font-semibold text-slate-800 truncate">{q.topic}</div>
            <div className="text-[11px] text-slate-500">{q.difficulty}</div>
          </div>
        ))}
      </div>

      {/* Action CTA */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {dailyRecord ? (
            <span>Great work! Tomorrow's challenge unlocks at midnight.</span>
          ) : (
            <span>Completing today's challenge will increment your active practice streak.</span>
          )}
        </div>

        <button
          onClick={() => onStartDailyChallenge(todayQuestions)}
          className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2 ${
            dailyRecord
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{dailyRecord ? 'Practice Again for Review' : 'Start Today\'s Challenge'}</span>
        </button>
      </div>
    </div>
  );
};
