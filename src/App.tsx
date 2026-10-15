import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MainDashboard } from './components/Dashboard/MainDashboard';
import { AptitudeDashboard } from './components/Aptitude/AptitudeDashboard';
import { PracticeEngine } from './components/Aptitude/PracticeEngine';
import { WrongAnswersNotebook } from './components/WrongAnswers/WrongAnswersNotebook';
import { RevisionHub } from './components/Revision/RevisionHub';
import { PersonalizedAnalytics } from './components/Analytics/PersonalizedAnalytics';
import { DailyChallengeCard } from './components/DailyChallenge/DailyChallengeCard';
import { GameHub } from './components/Game/GameHub';
import { GameCanvas } from './components/Game/GameCanvas';
import { PlaceTrackStorage } from './services/storage';
import { VERIFIED_QUESTION_BANK } from './data/questionBank';
import { GAME_LEVELS } from './data/gameLevels';
import { Question, PracticeMode, Difficulty } from './types/aptitude';
import { GameLevel } from './types/game';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState(() => PlaceTrackStorage.getProfile());

  // Active Practice Engine session
  const [activeSession, setActiveSession] = useState<{
    questions: Question[];
    mode: PracticeMode;
    title: string;
    categoryTitle?: string;
    topicTitle?: string;
    allocatedTimeSeconds?: number;
    isDailyChallenge?: boolean;
  } | null>(null);

  // Active 2D Game Level
  const [activeGameLevel, setActiveGameLevel] = useState<GameLevel | null>(null);

  const refreshProfile = () => {
    setProfile(PlaceTrackStorage.getProfile());
  };

  // Launch Mode A: Learn Mode
  const handleStartLearnMode = (topicTitle: string, questions: Question[]) => {
    setActiveSession({
      questions,
      mode: 'learn',
      title: `${topicTitle} · Learn Mode`,
      topicTitle,
      allocatedTimeSeconds: 0,
    });
  };

  // Launch Mode B: Practice Mode
  const handleStartPracticeMode = (
    topicTitle: string,
    difficulty: Difficulty | 'All',
    count: number,
    allQuestions: Question[]
  ) => {
    const filtered =
      difficulty === 'All'
        ? allQuestions
        : allQuestions.filter((q) => q.difficulty === difficulty);

    const questionsToUse = filtered.length > 0 ? filtered : allQuestions;
    const finalSet = questionsToUse.slice(0, count || 5);

    setActiveSession({
      questions: finalSet,
      mode: 'practice',
      title: `${topicTitle} (${difficulty}) · Practice`,
      topicTitle,
      allocatedTimeSeconds: finalSet.length * 90, // 90s per question
    });
  };

  // Launch Mode C: Full Placement Mock Test (TCS NQT / Infosys style)
  const handleStartMockTest = () => {
    // Select mixed questions across Quant, Logical, Verbal, DI
    const mockQuestions: Question[] = [
      ...VERIFIED_QUESTION_BANK.filter((q) => q.category === 'quant').slice(0, 4),
      ...VERIFIED_QUESTION_BANK.filter((q) => q.category === 'logical').slice(0, 4),
      ...VERIFIED_QUESTION_BANK.filter((q) => q.category === 'verbal').slice(0, 3),
      ...VERIFIED_QUESTION_BANK.filter((q) => q.category === 'di').slice(0, 2),
    ];

    setActiveSession({
      questions: mockQuestions,
      mode: 'mock',
      title: 'Full Placement Aptitude Simulation Assessment',
      allocatedTimeSeconds: 1200, // 20 minutes countdown
    });
  };

  // Launch Daily Challenge
  const handleStartDailyChallenge = (questions: Question[]) => {
    setActiveSession({
      questions,
      mode: 'practice',
      title: "Today's Placement Aptitude Challenge",
      allocatedTimeSeconds: 360, // 6 minutes for 5 questions
      isDailyChallenge: true,
    });
  };

  // Launch Custom Revision Drill
  const handleStartRevisionDrill = (title: string, questions: Question[]) => {
    setActiveSession({
      questions,
      mode: 'practice',
      title: `Revision Drill: ${title}`,
      allocatedTimeSeconds: questions.length * 90,
    });
  };

  // Launch YOUR NEXT BEST MOVE
  const handleLaunchMove = (move: any) => {
    if (move.practicePayload.isRevision) {
      const wrong = PlaceTrackStorage.getWrongAnswers();
      const questions = wrong.filter((w) => !w.isUnderstood).map((w) => w.question);
      const toPractice = questions.length > 0 ? questions : VERIFIED_QUESTION_BANK.slice(0, 5);
      handleStartRevisionDrill(`Comeback: ${move.topic}`, toPractice);
    } else {
      const matching = VERIFIED_QUESTION_BANK.filter(
        (q) => q.topic === move.topic || q.category === move.category
      );
      const questions = matching.length > 0 ? matching : VERIFIED_QUESTION_BANK.slice(0, 5);
      handleStartPracticeMode(
        move.topic,
        move.practicePayload.difficulty || 'Medium',
        move.practicePayload.count || 5,
        questions
      );
    }
  };

  // Launch Quest Mission
  const handleStartMission = (mission: any) => {
    if (mission.actionPayload.isRevision) {
      const wrong = PlaceTrackStorage.getWrongAnswers();
      const questions = wrong.map((w) => w.question);
      const toPractice = questions.length > 0 ? questions : VERIFIED_QUESTION_BANK.slice(0, 3);
      handleStartRevisionDrill(mission.title, toPractice);
    } else if (mission.actionPayload.mode === 'mock') {
      handleStartMockTest();
    } else {
      const cat = mission.actionPayload.category;
      const top = mission.actionPayload.topic;
      const matching = VERIFIED_QUESTION_BANK.filter(
        (q) => (top ? q.topic === top : true) && (cat ? q.category === cat : true)
      );
      const toPractice = matching.length > 0 ? matching : VERIFIED_QUESTION_BANK.slice(0, 5);
      handleStartPracticeMode(
        top || 'Practice Mission',
        'Medium',
        mission.targetCount || 5,
        toPractice
      );
    }
  };

  // Launch Mistake Comeback Drill
  const handleStartComebackDrill = (questions: Question[]) => {
    handleStartRevisionDrill('Mistake Comeback Drill', questions);
  };

  const handleExitSession = () => {
    setActiveSession(null);
    refreshProfile();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      {!activeGameLevel && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveSession(null);
            setActiveGameLevel(null);
            setActiveTab(tab);
          }}
          onQuickPractice={() => {
            setActiveSession(null);
            setActiveGameLevel(null);
            setActiveTab('aptitude');
          }}
          streakCount={profile.streakCount}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeGameLevel ? (
          <GameCanvas
            initialLevel={activeGameLevel}
            onExitGame={() => {
              setActiveGameLevel(null);
              refreshProfile();
            }}
            onLevelComplete={(stats) => {
              setActiveGameLevel(null);
              refreshProfile();
              setActiveTab('game');
            }}
          />
        ) : activeSession ? (
          <PracticeEngine
            questions={activeSession.questions}
            mode={activeSession.mode}
            title={activeSession.title}
            categoryTitle={activeSession.categoryTitle}
            topicTitle={activeSession.topicTitle}
            allocatedTimeSeconds={activeSession.allocatedTimeSeconds}
            onExit={handleExitSession}
            onGoToWrongAnswers={() => {
              setActiveSession(null);
              setActiveTab('wrong-answers');
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <MainDashboard
                onNavigateTab={(tab) => {
                  if (tab === 'game') {
                    setActiveTab('game');
                  } else {
                    setActiveTab(tab);
                  }
                }}
                onStartLearnMode={handleStartLearnMode}
                onStartPracticeMode={(topic, qList) =>
                  handleStartPracticeMode(topic, 'Medium', 5, qList)
                }
                onStartMockTest={handleStartMockTest}
                onStartDailyChallenge={handleStartDailyChallenge}
                onLaunchMove={handleLaunchMove}
                onStartMission={handleStartMission}
                onStartComebackDrill={handleStartComebackDrill}
              />
            )}

            {activeTab === 'game' && (
              <GameHub
                onStartLevel={(lvl) => setActiveGameLevel(lvl)}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'aptitude' && (
              <AptitudeDashboard
                onStartLearnMode={handleStartLearnMode}
                onStartPracticeMode={handleStartPracticeMode}
                onStartMockTest={handleStartMockTest}
              />
            )}

            {activeTab === 'daily' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <DailyChallengeCard onStartDailyChallenge={handleStartDailyChallenge} />
              </div>
            )}

            {activeTab === 'wrong-answers' && (
              <WrongAnswersNotebook
                onReattemptList={(qList) =>
                  handleStartRevisionDrill('Wrong Answers Drill', qList)
                }
              />
            )}

            {activeTab === 'revision' && (
              <RevisionHub onStartRevisionDrill={handleStartRevisionDrill} />
            )}

            {activeTab === 'analytics' && <PersonalizedAnalytics />}
          </>
        )}
      </main>

      {/* Footer adhering strictly to Universal Frontend Design Constitution */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">PlaceTrack AI</span>
            <span aria-hidden="true">·</span>
            <span>Placement Preparation & Verified Aptitude Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Offline-Ready Local Persistence</span>
            <span aria-hidden="true">·</span>
            <span>Mathematically Verified Explanations</span>
            <span aria-hidden="true">·</span>
            <span>Batch 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
