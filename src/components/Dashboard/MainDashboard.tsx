import React, { useState } from 'react';
import {
  Briefcase,
  Flame,
  Award,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Gamepad2,
} from 'lucide-react';
import { PlaceTrackStorage } from '../../services/storage';
import { VERIFIED_QUESTION_BANK } from '../../data/questionBank';
import {
  Question,
  StudyDuration,
  NextBestMove,
  QuestMission,
  WeaknessInsight,
  SkillTrackMetrics,
} from '../../types/aptitude';
import {
  calculatePlacementDNA,
  getWeaknessHunterInsights,
  getYourNextBestMove,
} from '../../services/intelligenceService';
import {
  getDailyQuestPlan,
  claimMissionXp,
  getAchievementsList,
} from '../../services/gamificationService';
import { YourNextBestMoveCard } from './YourNextBestMoveCard';
import { PlacementQuestCard } from './PlacementQuestCard';
import { PlacementDNAMap } from './PlacementDNAMap';
import { WeaknessHunterPanel } from './WeaknessHunterPanel';
import { MistakeComebackQueue } from './MistakeComebackQueue';
import { AchievementsShowcase } from './AchievementsShowcase';
import { DailyChallengeCard } from '../DailyChallenge/DailyChallengeCard';
import { CompanyPatternsModal } from '../CompanyPatterns/CompanyPatternsModal';

interface MainDashboardProps {
  onNavigateTab: (tab: string) => void;
  onStartLearnMode: (topicTitle: string, questions: Question[]) => void;
  onStartPracticeMode: (topicTitle: string, questions: Question[]) => void;
  onStartMockTest: () => void;
  onStartDailyChallenge: (questions: Question[]) => void;
  onLaunchMove: (move: NextBestMove) => void;
  onStartMission: (mission: QuestMission) => void;
  onStartComebackDrill: (questions: Question[]) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigateTab,
  onStartLearnMode,
  onStartPracticeMode,
  onStartMockTest,
  onStartDailyChallenge,
  onLaunchMove,
  onStartMission,
  onStartComebackDrill,
}) => {
  const profile = PlaceTrackStorage.getProfile();
  const analytics = PlaceTrackStorage.getAnalyticsSummary();
  const wrongAnswers = PlaceTrackStorage.getWrongAnswers();

  const [studyDuration, setStudyDuration] = useState<StudyDuration>(
    profile.preferredStudyDuration || 30
  );
  const [questPlan, setQuestPlan] = useState(() => getDailyQuestPlan(profile.preferredStudyDuration || 30));
  const [totalXp, setTotalXp] = useState(profile.totalXp || 140);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Compute live intelligence
  const dna = calculatePlacementDNA();
  const insights = getWeaknessHunterInsights();
  const nextMove = getYourNextBestMove(studyDuration);
  const achievements = getAchievementsList();

  const handleChangeDuration = (dur: StudyDuration) => {
    setStudyDuration(dur);
    PlaceTrackStorage.updateProfile({ preferredStudyDuration: dur });
    setQuestPlan(getDailyQuestPlan(dur));
  };

  const handleClaimXp = (missionId: string) => {
    const res = claimMissionXp(missionId);
    if (res.success) {
      setTotalXp(res.newTotalXp);
      setQuestPlan(getDailyQuestPlan(studyDuration));
    }
  };

  const handlePracticeSkillTrack = (skill: SkillTrackMetrics) => {
    const matchingQuestions = VERIFIED_QUESTION_BANK.filter(
      (q) => q.category === skill.category
    );
    if (matchingQuestions.length > 0) {
      onStartPracticeMode(skill.name, matchingQuestions);
    } else {
      onNavigateTab('aptitude');
    }
  };

  const handleStartRemediation = (insight: WeaknessInsight) => {
    const matchingQuestions = VERIFIED_QUESTION_BANK.filter(
      (q) => q.topic === insight.topic
    );
    if (matchingQuestions.length > 0) {
      if (insight.recommendedActivity.mode === 'learn') {
        onStartLearnMode(insight.topic, matchingQuestions);
      } else {
        onStartPracticeMode(insight.topic, matchingQuestions);
      }
    } else {
      onNavigateTab('aptitude');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 2D ANIMATED EDUCATIONAL GAME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border border-indigo-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Interactive 2D Placement Game</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Learn & Solve Aptitude via Interactive 2D Worlds
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Move a walking character across dynamic levels. Lower wooden bridges with percentage calculations, activate steam gears with work math, and defeat the Stone Golem!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('game')}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Launch 2D Game Quest</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FEATURE 6: YOUR NEXT BEST MOVE (Top Priority Activity) */}
      <YourNextBestMoveCard move={nextMove} onLaunchMove={onLaunchMove} />

      {/* FEATURE 3 & 4: PLACEMENT QUEST & XP LEVELS (Duration Switcher & Daily Missions) */}
      <PlacementQuestCard
        questPlan={questPlan}
        onChangeDuration={handleChangeDuration}
        onStartMission={onStartMission}
        onClaimXp={handleClaimXp}
        totalXp={totalXp}
      />

      {/* FEATURE 1: PERSONAL PLACEMENT DNA (7 Skill Areas Map & Classifications) */}
      <PlacementDNAMap skills={dna.skills} onPracticeSkill={handlePracticeSkillTrack} />

      {/* FEATURE 2: WEAKNESS HUNTER (Diagnosed Gaps, Evidence & Remediation Activities) */}
      <WeaknessHunterPanel insights={insights} onStartRemediation={handleStartRemediation} />

      {/* 2-Column Split: Mistake Comeback Queue (Left) + Daily Challenge & Readiness Overview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: FEATURE 5 MISTAKE COMEBACK */}
        <div className="lg:col-span-6 space-y-6">
          <MistakeComebackQueue
            wrongAnswers={wrongAnswers}
            onStartComebackDrill={onStartComebackDrill}
            onOpenNotebook={() => onNavigateTab('wrong-answers')}
          />
        </div>

        {/* Right: Daily Challenge & Placement Readiness */}
        <div className="lg:col-span-6 space-y-6">
          <DailyChallengeCard onStartDailyChallenge={onStartDailyChallenge} />
        </div>
      </div>

      {/* Connected Aptitude & Placement Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Aptitude Questions</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {analytics.totalAttempted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total completed</div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Overall Accuracy</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono tabular-nums mt-1">
            {analytics.overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {analytics.totalCorrect} correct answers
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Readiness Score</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {dna.overallReadinessScore}
            <span className="text-sm text-slate-400 font-normal">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across 7 DNA skills</div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Average Speed</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {analytics.avgTimePerQuestion}s
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Benchmark: &lt; 75s</div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="text-xs font-medium text-amber-600 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>Practice Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {profile.streakCount} Days
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active daily streak</div>
        </div>
      </div>

      {/* FEATURE 4: ACHIEVEMENTS SHOWCASE */}
      <AchievementsShowcase achievements={achievements} />

      {/* Target Companies & Recent Assessment History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Company Syllabus Targets */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Target Companies</h2>
            </div>
            <button
              onClick={() => setIsCompanyModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View All Patterns
            </button>
          </div>

          <div className="space-y-2.5">
            {profile.targetCompanies.map((c, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-slate-900">{c}</span>
                <button
                  onClick={() => setIsCompanyModalOpen(true)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Syllabus Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Assessment Ledger */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Recent Assessment History</h2>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View Ledger
            </button>
          </div>

          {analytics.recentSessions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No assessments completed yet. Try a 5-question practice module to populate your history!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {analytics.recentSessions.slice(0, 4).map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{session.title}</td>
                      <td className="py-2.5 px-3 capitalize">{session.mode}</td>
                      <td className="py-2.5 px-3 font-mono font-bold tabular-nums">
                        {session.score} / {session.maxScore}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span
                          className={
                            session.accuracyPercentage >= 70
                              ? 'text-emerald-600'
                              : session.accuracyPercentage >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }
                        >
                          {session.accuracyPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Company Patterns Modal */}
      {isCompanyModalOpen && (
        <CompanyPatternsModal isOpen={true} onClose={() => setIsCompanyModalOpen(false)} />
      )}
    </div>
  );
};
