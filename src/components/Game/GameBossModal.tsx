import React, { useState } from 'react';
import {
  X,
  Swords,
  Shield,
  Heart,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Trophy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { GameBoss } from '../../types/game';
import { GameAudio } from '../../services/gameAudio';
import { PlaceTrackStorage } from '../../services/storage';

interface GameBossModalProps {
  boss: GameBoss;
  onBossDefeated: () => void;
  onClose: () => void;
}

export const GameBossModal: React.FC<GameBossModalProps> = ({
  boss,
  onBossDefeated,
  onClose,
}) => {
  const [currentHp, setCurrentHp] = useState<number>(boss.currentHp);
  const [qIndex, setQIndex] = useState<number>(boss.currentQuestionIndex);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isVictorious, setIsVictorious] = useState<boolean>(boss.isDefeated);
  const [startTime] = useState<number>(Date.now());

  const currentQ = boss.questions[qIndex] || boss.questions[0];

  const handleCheckAnswer = () => {
    if (selectedOption === null || hasSubmitted) return;

    const correct = selectedOption === currentQ.correctAnswer;
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setHasSubmitted(true);
    setIsCorrect(correct);

    // Save into storage
    PlaceTrackStorage.recordGameQuestionSolved(currentQ, correct, selectedOption, timeSpentSeconds);

    if (correct) {
      GameAudio.playBossHit();
      const newHp = Math.max(0, currentHp - 1);
      setCurrentHp(newHp);

      if (newHp === 0) {
        setIsVictorious(true);
        GameAudio.playLevelClear();
        PlaceTrackStorage.addXp(75, `boss_defeat_${boss.id}_${Date.now()}`);
      }
    } else {
      GameAudio.playGentleError();
    }
  };

  const handleNextPhase = () => {
    if (isVictorious) {
      onBossDefeated();
      onClose();
      return;
    }

    if (isCorrect) {
      const nextIdx = qIndex + 1;
      if (nextIdx < boss.questions.length && currentHp > 0) {
        setQIndex(nextIdx);
        setSelectedOption(null);
        setHasSubmitted(false);
        setIsCorrect(false);
        setShowHint(false);
      } else {
        setIsVictorious(true);
        onBossDefeated();
        onClose();
      }
    }
  };

  const handleRetryCurrent = () => {
    setHasSubmitted(false);
    setSelectedOption(null);
    setIsCorrect(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-amber-500/50 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Boss Arena Header */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 text-white p-6 border-b border-purple-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg border-2 border-amber-300">
                {boss.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-500/30 text-red-300 border border-red-500/40">
                    Boss Encounter
                  </span>
                  <span className="text-xs text-purple-300 font-semibold">
                    Phase {qIndex + 1} of {boss.questions.length}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                  {boss.name}
                </h2>
                <p className="text-xs text-slate-300 italic">{boss.title}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Boss Health Bar */}
          <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span>Boss Armor HP</span>
            </div>
            <div className="flex-1 h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-purple-800">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(currentHp / boss.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              {currentHp} / {boss.maxHp} HP
            </span>
          </div>
        </div>

        {/* Boss Dialogue & Challenge Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {/* Boss Narrative Quote */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 italic flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold not-italic text-purple-900">{boss.name}: </span>
              {isVictorious ? boss.dialogueDefeated : boss.dialogueIntro}
            </div>
          </div>

          {isVictorious ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg">
                <Trophy className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Boss Defeated! Sector Cleared!
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  You successfully countered every puzzle phase with precision. The celestial portal has unlocked!
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>+75 Boss XP & Citadel Clearance Star</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Question */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed shadow-xs">
                <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {currentQ.topic} · {currentQ.subtopic}
                </div>
                {currentQ.question}
              </div>

              {/* Options */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target calculation answer:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === currentQ.correctAnswer;

                    let btnStyles =
                      'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800';

                    if (hasSubmitted) {
                      if (isCorrectOption) {
                        btnStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400';
                      } else if (isSelected && !isCorrect) {
                        btnStyles = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-300';
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
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm transition-all cursor-pointer ${btnStyles}`}
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
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hint */}
              {!hasSubmitted && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>{showHint ? 'Hide Boss Hint' : 'Consult tactical formula hint'}</span>
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                      {currentQ.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Submission outcome */}
              {hasSubmitted && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {isCorrect ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="text-xs text-emerald-900 font-semibold">
                        Direct Hit! Boss barrier damaged (-1 HP).
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div className="text-xs text-amber-900">
                        {currentQ.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Leave Arena
          </button>

          {isVictorious ? (
            <button
              type="button"
              onClick={handleNextPhase}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Claim Victory & Unlock Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : !hasSubmitted ? (
            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleCheckAnswer}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                selectedOption !== null
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Strike with Formula</span>
            </button>
          ) : isCorrect ? (
            <button
              type="button"
              onClick={handleNextPhase}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Next Phase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetryCurrent}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-attempt Phase</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
