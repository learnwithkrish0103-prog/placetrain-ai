import React from 'react';
import { Bookmark, Sparkles, Lightbulb, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Question } from '../../types/aptitude';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  showExplanation?: boolean; // In Learn Mode or Review mode
  onOpenHint?: () => void;
  onOpenExplain?: () => void;
  onOpenAiTutor?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  isBookmarked,
  onToggleBookmark,
  showExplanation = false,
  onOpenHint,
  onOpenExplain,
  onOpenAiTutor,
}) => {
  const optionLabels = ['A', 'B', 'C', 'D'];

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Hard':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* Header Metadata (Anti-slop clean typography with separators) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-indigo-600 font-semibold">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span aria-hidden="true">·</span>
          <span>{question.topic}</span>
          <span aria-hidden="true">·</span>
          <span>{question.subtopic}</span>
          <span aria-hidden="true">·</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getDifficultyBadge(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">+{question.marks} Marks</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Toggle */}
          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Bookmark this question for revision"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mt-6">
        <h2 className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed whitespace-pre-line">
          {question.question}
        </h2>

        {/* Code Snippet for Coding/Tech problems */}
        {question.codeSnippet && (
          <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
            <pre className="leading-relaxed">{question.codeSnippet}</pre>
          </div>
        )}

        {/* Data Visual for DI questions */}
        {question.dataVisual && (
          <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-800">{question.dataVisual.title}</h4>
              {question.dataVisual.subtitle && (
                <p className="text-xs text-slate-500">{question.dataVisual.subtitle}</p>
              )}
            </div>

            {/* Table Type */}
            {question.dataVisual.type === 'table' && question.dataVisual.headers && question.dataVisual.rows && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left divide-y divide-slate-200 bg-white rounded border border-slate-200">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      {question.dataVisual.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 border-b border-slate-200">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                    {question.dataVisual.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 tabular-nums">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bar Type */}
            {question.dataVisual.type === 'bar' && question.dataVisual.items && (
              <div className="space-y-3 pt-2">
                {question.dataVisual.items.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono tabular-nums">{item.value} hires</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${(item.value / 200) * 100}%`,
                          backgroundColor: item.color || '#4f46e5',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pie Type */}
            {question.dataVisual.type === 'pie' && question.dataVisual.items && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {question.dataVisual.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                    <span
                      className="w-3.5 h-3.5 rounded shrink-0"
                      style={{ backgroundColor: item.color || '#4f46e5' }}
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-medium text-slate-800">{item.label}</div>
                      <div className="text-slate-500 font-mono tabular-nums">{item.value}% of batch</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Four Selectable Answer Options */}
      <div className="mt-6 space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = question.correctAnswer === idx;

          // State styling depending on whether answers are revealed
          let stateStyle = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800';

          if (showExplanation) {
            if (isCorrect) {
              stateStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-medium';
            } else if (isSelected && !isCorrect) {
              stateStyle = 'border-rose-500 bg-rose-50/70 text-rose-900 line-through';
            } else {
              stateStyle = 'border-slate-200 bg-slate-50/40 text-slate-500';
            }
          } else if (isSelected) {
            stateStyle = 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-medium ring-1 ring-indigo-600';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full min-h-[48px] px-4 py-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${stateStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    showExplanation && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : showExplanation && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {optionLabels[idx]}
                </span>
                <span className="text-sm leading-snug">{option}</span>
              </div>

              {showExplanation && (
                <div className="shrink-0">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Learning Affordances: Hint, Explain, AI Tutor */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {onOpenHint && (
            <button
              type="button"
              onClick={onOpenHint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Get a Hint</span>
            </button>
          )}

          {onOpenExplain && (
            <button
              type="button"
              onClick={onOpenExplain}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explain Problem</span>
            </button>
          )}
        </div>

        {onOpenAiTutor && (
          <button
            type="button"
            onClick={onOpenAiTutor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ask Placement Tutor</span>
          </button>
        )}
      </div>

      {/* Step-by-Step Explanation Box (shown in Learn Mode or after submission) */}
      {showExplanation && (
        <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Explanation & Solution</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Correct: Option {optionLabels[question.correctAnswer]} ({question.options[question.correctAnswer]})
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>

          {/* Step-by-step calculations */}
          {question.stepByStepSolution && question.stepByStepSolution.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Step-by-Step Calculation:
              </span>
              <ul className="space-y-1 text-xs text-slate-700 font-mono">
                {question.stepByStepSolution.map((step, sIdx) => (
                  <li key={sIdx} className="bg-white p-2 rounded border border-slate-200/60">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {question.formulaNotes && (
            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded text-xs text-indigo-900">
              <span className="font-semibold">Core Formula / Shortcut: </span>
              <span className="font-mono">{question.formulaNotes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
