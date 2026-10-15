import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  XCircle,
} from 'lucide-react';
import { PlaceTrackStorage } from '../../services/storage';
import { WrongAnswerRecord, Question } from '../../types/aptitude';
import { AiTutorModal } from '../Aptitude/AiTutorModal';

interface WrongAnswersNotebookProps {
  onReattemptList?: (questions: Question[]) => void;
}

export const WrongAnswersNotebook: React.FC<WrongAnswersNotebookProps> = ({ onReattemptList }) => {
  const [records, setRecords] = useState<WrongAnswerRecord[]>(() =>
    PlaceTrackStorage.getWrongAnswers()
  );
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedTutorQuestion, setSelectedTutorQuestion] = useState<Question | null>(null);

  // Reattempt state per question inside notebook
  const [reattemptSelections, setReattemptSelections] = useState<Record<string, number | null>>({});
  const [reattemptVerified, setReattemptVerified] = useState<Record<string, boolean>>({});

  const refreshList = () => {
    setRecords(PlaceTrackStorage.getWrongAnswers());
  };

  const handleToggleUnderstood = (questionId: string) => {
    PlaceTrackStorage.toggleWrongAnswerUnderstood(questionId);
    refreshList();
  };

  const handleRemove = (questionId: string) => {
    PlaceTrackStorage.removeWrongAnswer(questionId);
    refreshList();
  };

  const handleReattemptOption = (questionId: string, optionIdx: number, q: Question) => {
    setReattemptSelections((prev) => ({ ...prev, [questionId]: optionIdx }));
    setReattemptVerified((prev) => ({ ...prev, [questionId]: true }));

    if (optionIdx === q.correctAnswer) {
      PlaceTrackStorage.recordMistakeReattemptSuccess(questionId);
      refreshList();
    }
  };

  const availableTopics = Array.from(new Set(records.map((r) => r.question.topic)));

  const filteredRecords = records.filter((r) => {
    if (selectedTopic === 'All') return true;
    return r.question.topic === selectedTopic;
  });

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Wrong Answer Notebook</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Questions answered incorrectly during practice are automatically saved here for targeted revision.
          </p>
        </div>

        {records.length > 0 && onReattemptList && (
          <button
            onClick={() => onReattemptList(filteredRecords.map((r) => r.question))}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice These {filteredRecords.length} Questions</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      {records.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Topic:
          </span>
          <button
            onClick={() => setSelectedTopic('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedTopic === 'All'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Topics ({records.length})
          </button>
          {availableTopics.map((topic) => {
            const count = records.filter((r) => r.question.topic === topic).length;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {topic} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {records.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Your Notebook is Clean!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't recorded any wrong answers yet. Solve questions in Practice or Mock mode, and any mistakes will automatically be collected here for spaced review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((item) => {
            const q = item.question;
            const reattemptChosen = reattemptSelections[q.id];
            const isVerified = reattemptVerified[q.id];
            const isReattemptCorrect = isVerified && reattemptChosen === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-5 sm:p-6 transition-all ${
                  item.isUnderstood ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="font-bold text-indigo-600">{q.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.subtopic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-600">{q.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-600 font-semibold tabular-nums">
                      {item.mistakeCount} Previous Mistake{item.mistakeCount > 1 ? 's' : ''}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">
                      Attempted {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.stage === 'mastered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.stage === 'spaced_review'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.stage === 'mastered'
                        ? 'Mastered'
                        : item.stage === 'spaced_review'
                        ? `Spaced Review (Due ${item.dueDate || 'Soon'})`
                        : 'Due Today'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mark Understood */}
                    <button
                      onClick={() => handleToggleUnderstood(q.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        item.isUnderstood
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Mark concept as understood"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{item.isUnderstood ? 'Concept Understood' : 'Mark Understood'}</span>
                    </button>

                    {/* Ask Tutor */}
                    <button
                      onClick={() => setSelectedTutorQuestion(q)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Ask AI Placement Tutor"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemove(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove from notebook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                    {q.question}
                  </h3>
                  {q.codeSnippet && (
                    <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                      <pre className="leading-relaxed">{q.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Interactive Reattempt Options */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isLastWrong = item.lastSelectedOption === oIdx;
                    const isCorrect = q.correctAnswer === oIdx;
                    const isChosenInReattempt = reattemptChosen === oIdx;

                    let optClass = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800';

                    if (isVerified) {
                      if (isCorrect) {
                        optClass = 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-bold';
                      } else if (isChosenInReattempt && !isCorrect) {
                        optClass = 'bg-rose-100/70 border-rose-300 text-rose-950 line-through';
                      }
                    } else if (isLastWrong) {
                      optClass = 'bg-rose-50/50 border-rose-200 text-rose-900';
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleReattemptOption(q.id, oIdx, q)}
                        className={`p-3 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${optClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{optionLabels[oIdx]}.</span>
                          <span>{opt}</span>
                        </div>
                        {isLastWrong && !isVerified && (
                          <span className="text-[10px] text-rose-600 font-semibold px-1.5 py-0.5 rounded bg-rose-100">
                            Your past pick
                          </span>
                        )}
                        {isVerified && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isVerified && isChosenInReattempt && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>Verified Solution & Math:</span>
                    <span className="text-emerald-700">
                      Correct: Option {optionLabels[q.correctAnswer]} ({q.options[q.correctAnswer]})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{q.explanation}</p>

                  {q.stepByStepSolution && q.stepByStepSolution.length > 0 && (
                    <div className="space-y-1 pt-1 font-mono text-[11px] text-slate-600">
                      {q.stepByStepSolution.map((s, si) => (
                        <div key={si} className="bg-white p-1.5 rounded border border-slate-200/60">
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
      )}

      {/* AI Tutor Modal */}
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
