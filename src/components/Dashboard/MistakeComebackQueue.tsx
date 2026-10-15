import React from 'react';
import { History, RotateCcw, CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { WrongAnswerRecord, Question } from '../../types/aptitude';

interface MistakeComebackQueueProps {
  wrongAnswers: WrongAnswerRecord[];
  onStartComebackDrill: (questions: Question[]) => void;
  onOpenNotebook: () => void;
}

export const MistakeComebackQueue: React.FC<MistakeComebackQueueProps> = ({
  wrongAnswers,
  onStartComebackDrill,
  onOpenNotebook,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const dueQuestions = wrongAnswers.filter(
    (w) => !w.isUnderstood || w.dueDate <= todayStr
  );
  const masteredCount = wrongAnswers.filter((w) => w.isUnderstood && w.stage === 'mastered').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Mistake Comeback Queue</h2>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Spaced Revision
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled revision designed to turn past misconceptions into permanent strengths.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNotebook}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          Open Full Notebook
        </button>
      </div>

      {/* Tally strip */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {dueQuestions.length}
          </div>
          <div className="text-[11px] text-slate-500">Due for Review Today</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-lg font-bold text-amber-600 font-mono tabular-nums">
            {wrongAnswers.filter((w) => w.stage === 'spaced_review').length}
          </div>
          <div className="text-[11px] text-slate-500">In Spaced Interval</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-lg font-bold text-emerald-600 font-mono tabular-nums">
            {masteredCount}
          </div>
          <div className="text-[11px] text-slate-500">Concepts Mastered</div>
        </div>
      </div>

      {/* Due Items or Clean State */}
      {dueQuestions.length === 0 ? (
        <div className="p-6 text-center bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-800">No Mistakes Due for Revision Today</h4>
          <p className="text-[11px] text-slate-500">
            All past errors have either been addressed or are scheduled for future spaced intervals.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-700">Top Priority Reattempts:</div>
          <div className="space-y-2">
            {dueQuestions.slice(0, 3).map((item) => (
              <div
                key={item.questionId}
                className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{item.question.topic}</div>
                  <div className="text-[11px] text-slate-500 truncate">{item.question.subtopic}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                    {item.mistakeCount} Mistake{item.mistakeCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Earn +30 Comeback XP per solved mistake</span>
            </span>

            <button
              onClick={() => onStartComebackDrill(dueQuestions.map((w) => w.question))}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Launch Comeback Session ({dueQuestions.length})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
