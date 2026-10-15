import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { GameObstacle } from '../../types/game';
import { GameAudio } from '../../services/gameAudio';
import { PlaceTrackStorage } from '../../services/storage';

interface GamePuzzleModalProps {
  obstacle: GameObstacle;
  onSolveSuccess: (obstacleId: string) => void;
  onClose: () => void;
}

export const GamePuzzleModal: React.FC<GamePuzzleModalProps> = ({
  obstacle,
  onSolveSuccess,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchText, setScratchText] = useState<string>('');
  const [startTime] = useState<number>(Date.now());

  const q = obstacle.question;

  // Listen to keyboard 1, 2, 3, 4, Enter, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (!hasSubmitted) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const optIdx = parseInt(e.key, 10) - 1;
          setSelectedOption(optIdx);
        } else if (e.key === 'Enter' && selectedOption !== null) {
          handleCheckAnswer();
        }
      } else if (hasSubmitted && isCorrect && (e.key === 'Enter' || e.key === ' ')) {
        handleProceed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSubmitted, selectedOption, isCorrect]);

  const handleCheckAnswer = () => {
    if (selectedOption === null || hasSubmitted) return;

    const correct = selectedOption === q.correctAnswer;
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setHasSubmitted(true);
    setIsCorrect(correct);

    // Save into storage attempts and wrong answers
    PlaceTrackStorage.recordGameQuestionSolved(q, correct, selectedOption, timeSpentSeconds);

    if (correct) {
      GameAudio.playSuccess();
    } else {
      GameAudio.playGentleError();
    }
  };

  const handleProceed = () => {
    if (isCorrect) {
      if (obstacle.type === 'chest') {
        GameAudio.playChestOpen();
      } else if (obstacle.type === 'gate' || obstacle.type === 'bridge' || obstacle.type === 'barrier') {
        GameAudio.playGateOpen();
      }
      onSolveSuccess(obstacle.id);
    }
    onClose();
  };

  const handleRetry = () => {
    setHasSubmitted(false);
    setSelectedOption(null);
    setIsCorrect(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header with Game Lore */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-900 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                {obstacle.requiredTopic}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                {q.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Reward: +25 XP
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{obstacle.challengeTitle}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed italic">
              "{obstacle.narrative}"
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question & Options Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {/* Question Text */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-base font-medium text-slate-900 leading-relaxed shadow-xs">
            {q.question}
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Select the correct value (Press 1-4)</span>
              <span className="text-[11px] font-normal text-slate-400">Desktop Hotkeys Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === q.correctAnswer;

                let btnStyles =
                  'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800';

                if (hasSubmitted) {
                  if (isCorrectOption) {
                    btnStyles = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-400';
                  } else if (isSelected && !isCorrect) {
                    btnStyles = 'border-rose-400 bg-rose-50/80 text-rose-950 ring-2 ring-rose-300';
                  } else {
                    btnStyles = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyles = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-2 ring-indigo-500';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm transition-all shadow-xs cursor-pointer ${btnStyles}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-medium">{option}</span>
                    {hasSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hint Accordion */}
          {!hasSubmitted && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{showHint ? 'Hide Pedagogical Hint' : 'Need a hint to align the mechanism?'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed animate-in fade-in">
                  <span className="font-bold">Hint: </span>
                  {q.hint}
                </div>
              )}
            </div>
          )}

          {/* Feedback & Step-by-Step Solution after Submission */}
          {hasSubmitted && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in">
              {isCorrect ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">
                      Obstacle Overcome! Mechanism Activated
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Outstanding calculation! The obstacle responds to your accurate answer.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">
                      Mechanism Stalled (Gentle Practice Opportunity)
                    </h4>
                    <p className="text-xs text-amber-800 mt-1">
                      No points lost! Check the verified solution below, understand the core formula, and re-attempt to open the passage.
                    </p>
                  </div>
                </div>
              )}

              {/* Step-by-step mathematical explanation */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Step-by-Step Mathematical Explanation</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {q.explanation}
                </p>
                <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-indigo-200">
                  {q.stepByStepSolution.map((step, sIdx) => (
                    <p key={sIdx} className="text-xs text-slate-600">
                      {step}
                    </p>
                  ))}
                </div>
                {q.formulaNotes && (
                  <div className="mt-3 p-2 bg-indigo-50/70 border border-indigo-100 rounded text-[11px] text-indigo-900 font-mono">
                    Formula: {q.formulaNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Scratchpad for calculations */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowScratchpad(!showScratchpad)}
              className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 cursor-pointer"
            >
              {showScratchpad ? 'Hide Scratchpad' : 'Open Scratchpad for Calculations'}
            </button>
            {showScratchpad && (
              <textarea
                value={scratchText}
                onChange={(e) => setScratchText(e.target.value)}
                placeholder="Use this scratchpad for quick rough steps (e.g. 25/125 * 100 = 20%)..."
                rows={3}
                className="w-full mt-2 p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {!hasSubmitted ? 'Choose an option to unlock' : isCorrect ? 'Pathway cleared' : 'You can re-attempt'}
          </div>

          <div className="flex items-center gap-2">
            {!hasSubmitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleCheckAnswer}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  selectedOption !== null
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Confirm Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : isCorrect ? (
              <button
                type="button"
                onClick={handleProceed}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Close & Explore
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
