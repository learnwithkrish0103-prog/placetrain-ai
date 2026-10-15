import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Timer,
  Award,
  ArrowRight,
  Sparkles,
  BookMarked,
  RotateCcw,
} from 'lucide-react';
import { PracticeSessionResult, Question } from '../../types/aptitude';
import { VERIFIED_QUESTION_BANK } from '../../data/questionBank';
import { PlaceTrackStorage } from '../../services/storage';
import { AiTutorModal } from './AiTutorModal';

interface ScorecardModalProps {
  result: PracticeSessionResult;
  onClose: () => void;
  onReattempt?: () => void;
  onGoToWrongAnswers?: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  result,
  onClose,
  onReattempt,
  onGoToWrongAnswers,
}) => {
  const [selectedTutorQuestion, setSelectedTutorQuestion] = useState<Question | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct' | 'unanswered'>('all');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  // Filter reviewed answers
  const reviewedAnswers = result.answers.filter((ans) => {
    if (filterMode === 'correct') return ans.isCorrect;
    if (filterMode === 'incorrect') return !ans.isCorrect && ans.selectedOption !== null;
    if (filterMode === 'unanswered') return ans.selectedOption === null;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
                Assessment Scorecard · {result.mode.toUpperCase()} MODE
              </span>
              <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">{result.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Completed on {new Date(result.timestamp).toLocaleDateString()} at{' '}
                {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono tabular-nums">
                {result.score} / {result.maxScore}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {result.accuracyPercentage}% Accuracy
              </div>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-center">
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-xs text-slate-400">Total Questions</div>
              <div className="text-lg font-bold text-white tabular-nums mt-0.5">{result.totalQuestions}</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-xs text-emerald-400">Correct Answers</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                {result.correctCount}
              </div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-xs text-rose-400">Incorrect Answers</div>
              <div className="text-lg font-bold text-rose-400 tabular-nums mt-0.5">
                {result.incorrectCount}
              </div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-xs text-amber-400">Time Taken</div>
              <div className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">
                {formatTime(result.totalTimeSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        {result.topicBreakdown && Object.keys(result.topicBreakdown).length > 0 && (
          <div className="p-6 border-b border-slate-200 bg-slate-50/70">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Topic-Wise Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(result.topicBreakdown).map(([topic, stats]) => {
                const acc =
                  stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
                return (
                  <div key={topic} className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs font-semibold text-slate-800 truncate">{topic}</div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>
                        {stats.correct} / {stats.attempted} Correct
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          acc >= 70 ? 'text-emerald-600' : acc >= 50 ? 'text-amber-600' : 'text-rose-600'
                        }`}
                      >
                        {acc}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions Detailed Review Header & Filter */}
        <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              Question-by-Question Verified Solutions ({reviewedAnswers.length})
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  filterMode === 'all' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
                }`}
              >
                All ({result.answers.length})
              </button>
              <button
                onClick={() => setFilterMode('correct')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  filterMode === 'correct' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
                }`}
              >
                Correct ({result.correctCount})
              </button>
              <button
                onClick={() => setFilterMode('incorrect')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  filterMode === 'incorrect' ? 'bg-white shadow-xs text-rose-700 font-semibold' : 'text-slate-600'
                }`}
              >
                Incorrect ({result.incorrectCount})
              </button>
            </div>
          </div>

          {/* List of reviewed questions */}
          <div className="space-y-4">
            {reviewedAnswers.map((ans, idx) => {
              const question = VERIFIED_QUESTION_BANK.find((q) => q.id === ans.questionId);
              if (!question) return null;

              const isCorrect = ans.isCorrect;
              const isUnanswered = ans.selectedOption === null;

              return (
                <div
                  key={ans.questionId}
                  className={`p-5 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/20 border-emerald-200'
                      : isUnanswered
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-rose-50/20 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="font-bold text-slate-900">Question #{idx + 1}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">{question.topic}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-mono">{question.difficulty}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </span>
                      ) : isUnanswered ? (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Unanswered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                    {question.question}
                  </p>

                  {/* Options review */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {question.options.map((opt, oIdx) => {
                      const isOptionCorrect = question.correctAnswer === oIdx;
                      const isOptionSelected = ans.selectedOption === oIdx;

                      let style = 'bg-white border-slate-200 text-slate-700';
                      if (isOptionCorrect) {
                        style = 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-semibold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = 'bg-rose-100/70 border-rose-300 text-rose-950 line-through';
                      }

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-lg border flex items-center gap-2 ${style}`}>
                          <span className="font-bold">{optionLabels[oIdx]}.</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step-by-step solution */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Solution & Mathematical Verification:</span>
                      <button
                        onClick={() => setSelectedTutorQuestion(question)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Ask AI Tutor</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>

                    {question.stepByStepSolution && question.stepByStepSolution.length > 0 && (
                      <div className="space-y-1 pt-1 font-mono text-[11px] text-slate-600">
                        {question.stepByStepSolution.map((s, si) => (
                          <div key={si} className="bg-slate-50 p-1.5 rounded">
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onGoToWrongAnswers && result.incorrectCount > 0 && (
              <button
                onClick={onGoToWrongAnswers}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Review {result.incorrectCount} Wrong Answers</span>
              </button>
            )}

            {onReattempt && (
              <button
                onClick={onReattempt}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reattempt Assessment</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Done & Return to Dashboard
          </button>
        </div>
      </div>

      {/* Embedded AI Tutor for follow-up doubts on specific reviewed question */}
      {selectedTutorQuestion && (
        <AiTutorModal
          isOpen={true}
          onClose={() => setSelectedTutorQuestion(null)}
          question={selectedTutorQuestion}
          initialMode="doubt"
        />
      )}
    </div>
  );
};
