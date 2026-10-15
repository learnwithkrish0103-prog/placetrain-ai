import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookmarkCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { UserQuestionState } from '../../types/aptitude';

interface TestNavigationPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  userStates: UserQuestionState[];
  onPrev: () => void;
  onNext: () => void;
  onToggleMarkReview: () => void;
  onClearAnswer: () => void;
  onSubmit: () => void;
  isPracticeMode?: boolean;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

export const TestNavigationPalette: React.FC<TestNavigationPaletteProps> = ({
  totalQuestions,
  currentIndex,
  onSelectIndex,
  userStates,
  onPrev,
  onNext,
  onToggleMarkReview,
  onClearAnswer,
  onSubmit,
  isPracticeMode = false,
  isPaused = false,
  onTogglePause,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const answeredCount = userStates.filter((s) => s.selectedOption !== null).length;
  const markedCount = userStates.filter((s) => s.isMarkedForReview).length;
  const unansweredCount = totalQuestions - answeredCount;

  const currentState = userStates[currentIndex] || {
    selectedOption: null,
    isMarkedForReview: false,
    timeSpentSeconds: 0,
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-5">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMarkReview}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                currentState.isMarkedForReview
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>{currentState.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>

            <button
              onClick={onClearAnswer}
              disabled={currentState.selectedOption === null}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Answer</span>
            </button>
          </div>

          {/* Pause (Practice Mode only) */}
          {isPracticeMode && onTogglePause && (
            <button
              onClick={onTogglePause}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isPaused
                  ? 'bg-amber-100 border-amber-300 text-amber-800 font-semibold'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isPaused ? 'Resume Practice' : 'Pause Practice'}
            </button>
          )}

          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Palette Grid */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-3">
            <span>Question Palette ({totalQuestions})</span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-normal">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block" />
                Marked ({markedCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block" />
                Unanswered ({unansweredCount})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const state = userStates[idx] || { selectedOption: null, isMarkedForReview: false };
              const isCurrent = idx === currentIndex;
              const hasAnswered = state.selectedOption !== null;
              const isMarked = state.isMarkedForReview;

              let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';

              if (hasAnswered && isMarked) {
                btnClass = 'bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-400';
              } else if (hasAnswered) {
                btnClass = 'bg-emerald-600 text-white border-emerald-700';
              } else if (isMarked) {
                btnClass = 'bg-purple-600 text-white border-purple-700';
              }

              if (isCurrent) {
                btnClass += ' ring-2 ring-indigo-600 ring-offset-1 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => onSelectIndex(idx)}
                  className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all border cursor-pointer ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Test Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Submit Assessment
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Test Submission</h3>
                <p className="text-xs text-slate-500">Are you sure you want to finish this assessment?</p>
              </div>
            </div>

            {/* Test summary counts */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">{totalQuestions}</div>
                <div className="text-[11px] text-slate-500 font-medium">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600 tabular-nums">{answeredCount}</div>
                <div className="text-[11px] text-slate-500 font-medium">Answered</div>
              </div>
              <div>
                <div className="text-lg font-bold text-rose-600 tabular-nums">{unansweredCount}</div>
                <div className="text-[11px] text-slate-500 font-medium">Unanswered</div>
              </div>
            </div>

            {markedCount > 0 && (
              <p className="text-xs text-purple-700 bg-purple-50 p-2.5 rounded border border-purple-200">
                You still have <strong>{markedCount} question(s)</strong> marked for review.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Continue Solving
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmit();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
