import React from 'react';
import { Compass, ArrowRight, Sparkles, Target, Clock } from 'lucide-react';
import { NextBestMove } from '../../types/aptitude';

interface YourNextBestMoveCardProps {
  move: NextBestMove;
  onLaunchMove: (move: NextBestMove) => void;
}

export const YourNextBestMoveCard: React.FC<YourNextBestMoveCardProps> = ({
  move,
  onLaunchMove,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white border border-indigo-900/60 shadow-lg relative overflow-hidden">
      {/* Background visual motif */}
      <div className="absolute right-0 top-0 w-96 h-full bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <Compass className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Personal Placement Intelligence</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-medium">YOUR NEXT BEST MOVE</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {move.headline}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {move.reason}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-indigo-300 font-semibold">
              <Target className="w-3.5 h-3.5" />
              Focus: {move.topic}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              Estimated: ~{move.practicePayload.count * 1.5} minutes
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Earn +30 XP</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={() => onLaunchMove(move)}
            className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{move.actionText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
