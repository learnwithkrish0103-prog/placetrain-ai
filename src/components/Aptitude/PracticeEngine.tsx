import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Pause,
  Play,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Award,
} from 'lucide-react';
import { Question, PracticeMode, UserQuestionState, PracticeSessionResult } from '../../types/aptitude';
import { PlaceTrackStorage } from '../../services/storage';
import { QuestionCard } from './QuestionCard';
import { TestNavigationPalette } from './TestNavigationPalette';
import { ScorecardModal } from './ScorecardModal';
import { AiTutorModal } from './AiTutorModal';

interface PracticeEngineProps {
  questions: Question[];
  mode: PracticeMode;
  title: string;
  categoryTitle?: string;
  topicTitle?: string;
  allocatedTimeSeconds?: number;
  onExit: () => void;
  onGoToWrongAnswers?: () => void;
}

export const PracticeEngine: React.FC<PracticeEngineProps> = ({
  questions,
  mode,
  title,
  categoryTitle,
  topicTitle,
  allocatedTimeSeconds = 0,
  onExit,
  onGoToWrongAnswers,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userStates, setUserStates] = useState<UserQuestionState[]>(() =>
    questions.map(() => ({
      selectedOption: null,
      isMarkedForReview: false,
      timeSpentSeconds: 0,
      checkedInLearnMode: false,
    }))
  );

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState<number>(allocatedTimeSeconds);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  // Modals & Tutor
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [lastResult, setLastResult] = useState<PracticeSessionResult | null>(null);
  const [tutorState, setTutorState] = useState<{
    isOpen: boolean;
    mode: 'hint' | 'simplify' | 'doubt';
  }>({ isOpen: false, mode: 'hint' });

  // Bookmarking
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    const list = PlaceTrackStorage.getBookmarks();
    return new Set(list.map((b) => b.questionId));
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isPaused || isScorecardOpen) return;

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);

      // Track time on current question
      setUserStates((prev) => {
        const copy = [...prev];
        if (copy[currentIndex]) {
          copy[currentIndex].timeSpentSeconds += 1;
        }
        return copy;
      });

      // Timed tests countdown
      if (allocatedTimeSeconds > 0) {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, isScorecardOpen, allocatedTimeSeconds]);

  const handleAutoSubmit = () => {
    finishAssessment();
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isPaused) return;

    setUserStates((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...copy[currentIndex],
        selectedOption: optionIndex,
      };
      return copy;
    });
  };

  const handleToggleMarkReview = () => {
    setUserStates((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...copy[currentIndex],
        isMarkedForReview: !copy[currentIndex].isMarkedForReview,
      };
      return copy;
    });
  };

  const handleClearAnswer = () => {
    setUserStates((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...copy[currentIndex],
        selectedOption: null,
        checkedInLearnMode: false,
      };
      return copy;
    });
  };

  const handleCheckAnswerInLearnMode = () => {
    setUserStates((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...copy[currentIndex],
        checkedInLearnMode: true,
      };
      return copy;
    });
  };

  const handleToggleBookmark = (questionId: string) => {
    const updatedStatus = PlaceTrackStorage.toggleBookmark(questionId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (updatedStatus) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
  };

  const finishAssessment = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let score = 0;
    let maxScore = 0;

    const topicBreakdown: Record<string, { attempted: number; correct: number }> = {};

    const sessionAnswers = questions.map((q, idx) => {
      maxScore += q.marks;
      const state = userStates[idx];
      const isAnswered = state.selectedOption !== null;
      const isCorrect = isAnswered && state.selectedOption === q.correctAnswer;

      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { attempted: 0, correct: 0 };
      }

      if (isAnswered) {
        topicBreakdown[q.topic].attempted += 1;
        if (isCorrect) {
          correctCount += 1;
          score += q.marks;
          topicBreakdown[q.topic].correct += 1;
        } else {
          incorrectCount += 1;
        }
      } else {
        unansweredCount += 1;
      }

      return {
        questionId: q.id,
        selectedOption: state.selectedOption,
        isCorrect,
        timeSpentSeconds: state.timeSpentSeconds,
      };
    });

    const accuracyPercentage =
      correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;

    const result: PracticeSessionResult = {
      id: `session_${Date.now()}`,
      title,
      mode,
      category: questions[0]?.category,
      topic: topicTitle || questions[0]?.topic,
      timestamp: Date.now(),
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      unansweredCount,
      score,
      maxScore,
      accuracyPercentage,
      totalTimeSeconds: elapsedTime,
      topicBreakdown,
      answers: sessionAnswers,
    };

    // Save session in localStorage
    PlaceTrackStorage.saveSession(result);

    // Award transparent XP
    if (mode === 'mock') {
      PlaceTrackStorage.addXp(40, `xp_${result.id}_mock`);
    } else {
      PlaceTrackStorage.addXp(20, `xp_${result.id}_practice`);
    }
    // High accuracy bonus (+30 XP for demonstrating improvement)
    if (accuracyPercentage >= 80 && questions.length >= 5) {
      PlaceTrackStorage.addXp(30, `xp_${result.id}_accuracy_bonus`);
    }

    setLastResult(result);
    setIsScorecardOpen(true);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const currentState = userStates[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600">No questions available for this module.</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          Return to Aptitude Practice
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Test Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Exit assessment"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider font-bold text-indigo-600">
                {mode === 'learn' ? 'Learn Mode' : mode === 'mock' ? 'Mock Test' : 'Practice Mode'}
              </span>
              {categoryTitle && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{categoryTitle}</span>
                </>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          </div>
        </div>

        {/* Timers & Controls */}
        <div className="flex items-center gap-3">
          {allocatedTimeSeconds > 0 ? (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${
                timeRemaining <= 120
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Timer className="w-4 h-4 text-slate-600" />
              <span>Time Left: {formatTimer(timeRemaining)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs font-semibold">
              <Timer className="w-4 h-4 text-slate-500" />
              <span>Elapsed: {formatTimer(elapsedTime)}</span>
            </div>
          )}

          {/* Pause / Resume for Practice Mode */}
          {mode === 'practice' && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          {mode !== 'learn' && (
            <button
              onClick={finishAssessment}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Finish Test
            </button>
          )}
        </div>
      </div>

      {/* Paused Screen Overlay if Paused */}
      {isPaused && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <Pause className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Practice Session Paused</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Take a breath! Your progress is saved. When you're ready to resume problem solving, click below.
          </p>
          <button
            onClick={() => setIsPaused(false)}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
          >
            Resume Practice
          </button>
        </div>
      )}

      {/* Main Solver Grid */}
      {!isPaused && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question Area */}
          <div className="lg:col-span-8 space-y-6">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedOption={currentState.selectedOption}
              onSelectOption={handleSelectOption}
              isBookmarked={bookmarkedIds.has(currentQuestion.id)}
              onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
              showExplanation={mode === 'learn' && currentState.checkedInLearnMode}
              onOpenHint={() => setTutorState({ isOpen: true, mode: 'hint' })}
              onOpenExplain={() => setTutorState({ isOpen: true, mode: 'simplify' })}
              onOpenAiTutor={() => setTutorState({ isOpen: true, mode: 'doubt' })}
            />

            {/* In Learn Mode: Action bar to "Check Answer" or "Next Question" */}
            {mode === 'learn' && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous Question
                </button>

                <div className="flex items-center gap-2">
                  {!currentState.checkedInLearnMode ? (
                    <button
                      onClick={handleCheckAnswerInLearnMode}
                      disabled={currentState.selectedOption === null}
                      className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg shadow-sm cursor-pointer"
                    >
                      Check Answer & Explanation
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (currentIndex < questions.length - 1) {
                          setCurrentIndex(currentIndex + 1);
                        } else {
                          finishAssessment();
                        }
                      }}
                      className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                    >
                      {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Topic Learning'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Palette & Quick Access */}
          <div className="lg:col-span-4 space-y-6">
            <TestNavigationPalette
              totalQuestions={questions.length}
              currentIndex={currentIndex}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
              userStates={userStates}
              onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              onToggleMarkReview={handleToggleMarkReview}
              onClearAnswer={handleClearAnswer}
              onSubmit={finishAssessment}
              isPracticeMode={mode === 'practice'}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused(!isPaused)}
            />

            {/* Quick Pedagogy Tips */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Placement Strategy Tip</span>
              </div>
              <p className="leading-relaxed">
                In major placement drives (TCS, Infosys, Cognizant), speed matters: aim for under 75 seconds per question. Eliminate two obviously wrong options first before performing detailed algebra.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Tutor Drawer/Modal */}
      {tutorState.isOpen && (
        <AiTutorModal
          isOpen={tutorState.isOpen}
          onClose={() => setTutorState({ ...tutorState, isOpen: false })}
          question={currentQuestion}
          initialMode={tutorState.mode}
        />
      )}

      {/* Comprehensive Scorecard Modal */}
      {isScorecardOpen && lastResult && (
        <ScorecardModal
          result={lastResult}
          onClose={() => {
            setIsScorecardOpen(false);
            onExit();
          }}
          onReattempt={() => {
            setIsScorecardOpen(false);
            setCurrentIndex(0);
            setUserStates(
              questions.map(() => ({
                selectedOption: null,
                isMarkedForReview: false,
                timeSpentSeconds: 0,
                checkedInLearnMode: false,
              }))
            );
            setElapsedTime(0);
            setTimeRemaining(allocatedTimeSeconds);
          }}
          onGoToWrongAnswers={onGoToWrongAnswers}
        />
      )}
    </div>
  );
};
