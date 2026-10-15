import {
  Achievement,
  DailyQuestPlan,
  QuestMission,
  StudyDuration,
  StudentPlacementProfile,
  PracticeSessionResult,
} from '../types/aptitude';
import { PlaceTrackStorage, calculateLevelFromXp, LEVEL_TIERS } from './storage';
import { VERIFIED_QUESTION_BANK } from '../data/questionBank';

const ACHIEVEMENTS_CONFIG: {
  id: string;
  title: string;
  description: string;
  category: 'practice' | 'accuracy' | 'streak' | 'comeback' | 'mastery';
  xpReward: number;
  targetCount: number;
  unit: string;
}[] = [
  {
    id: 'ach-first-10',
    title: 'First 10 Questions',
    description: 'Solve your first 10 aptitude or technical questions.',
    category: 'practice',
    xpReward: 30,
    targetCount: 10,
    unit: 'questions',
  },
  {
    id: 'ach-first-coding',
    title: 'First Coding Challenge',
    description: 'Solve at least 1 coding algorithm or complexity question.',
    category: 'mastery',
    xpReward: 25,
    targetCount: 1,
    unit: 'coding questions',
  },
  {
    id: 'ach-five-streak',
    title: 'Five-Day Practice Streak',
    description: 'Maintain an active practice habit for 5 consecutive days.',
    category: 'streak',
    xpReward: 50,
    targetCount: 5,
    unit: 'days',
  },
  {
    id: 'ach-accuracy-improver',
    title: 'Accuracy Improver',
    description: 'Score 80%+ accuracy in any practice session of 5 or more questions.',
    category: 'accuracy',
    xpReward: 35,
    targetCount: 1,
    unit: 'sessions',
  },
  {
    id: 'ach-mistake-comeback',
    title: 'Mistake Comeback',
    description: 'Reattempt and master at least 2 questions in your Wrong Answer Notebook.',
    category: 'comeback',
    xpReward: 40,
    targetCount: 2,
    unit: 'comebacks',
  },
  {
    id: 'ach-first-mock',
    title: 'First Mock Test Completed',
    description: 'Complete a full-length placement mock assessment with timer.',
    category: 'practice',
    xpReward: 50,
    targetCount: 1,
    unit: 'mock tests',
  },
  {
    id: 'ach-speed-demon',
    title: 'Speed Demon',
    description: 'Finish a practice session averaging under 60 seconds per question.',
    category: 'accuracy',
    xpReward: 30,
    targetCount: 1,
    unit: 'speed runs',
  },
  {
    id: 'ach-dna-pioneer',
    title: 'Placement DNA Pioneer',
    description: 'Solve questions across at least 4 different Placement DNA skill tracks.',
    category: 'mastery',
    xpReward: 45,
    targetCount: 4,
    unit: 'tracks explored',
  },
];

export function getAchievementsList(): Achievement[] {
  const sessions = PlaceTrackStorage.getSessions();
  const profile = PlaceTrackStorage.getProfile();
  const wrongAnswers = PlaceTrackStorage.getWrongAnswers();

  let totalQuestionsAttempted = 0;
  let codingQuestionsAttempted = 0;
  let highScoreSessions = 0;
  let mockTestsCompleted = 0;
  let fastSessions = 0;
  const categoriesTouched = new Set<string>();

  sessions.forEach((s) => {
    totalQuestionsAttempted += s.totalQuestions;
    if (s.mode === 'mock') mockTestsCompleted += 1;

    if (s.totalQuestions >= 5 && s.accuracyPercentage >= 80) {
      highScoreSessions += 1;
    }

    const avgTime = s.totalQuestions > 0 ? s.totalTimeSeconds / s.totalQuestions : 999;
    if (s.totalQuestions >= 5 && avgTime < 60) {
      fastSessions += 1;
    }

    s.answers.forEach((ans) => {
      const q = VERIFIED_QUESTION_BANK.find((item) => item.id === ans.questionId);
      if (q) {
        categoriesTouched.add(q.category);
        if (q.category === 'coding') codingQuestionsAttempted += 1;
      }
    });
  });

  const understoodMistakes = wrongAnswers.filter((w) => w.isUnderstood).length;

  return ACHIEVEMENTS_CONFIG.map((conf) => {
    let currentVal = 0;
    switch (conf.id) {
      case 'ach-first-10':
        currentVal = totalQuestionsAttempted;
        break;
      case 'ach-first-coding':
        currentVal = codingQuestionsAttempted;
        break;
      case 'ach-five-streak':
        currentVal = profile.streakCount;
        break;
      case 'ach-accuracy-improver':
        currentVal = highScoreSessions;
        break;
      case 'ach-mistake-comeback':
        currentVal = understoodMistakes;
        break;
      case 'ach-first-mock':
        currentVal = mockTestsCompleted;
        break;
      case 'ach-speed-demon':
        currentVal = fastSessions;
        break;
      case 'ach-dna-pioneer':
        currentVal = categoriesTouched.size;
        break;
      default:
        currentVal = 0;
    }

    const isUnlocked = currentVal >= conf.targetCount;

    return {
      id: conf.id,
      title: conf.title,
      description: conf.description,
      category: conf.category,
      xpReward: conf.xpReward,
      isUnlocked,
      unlockedAt: isUnlocked ? Date.now() - 3600000 : undefined,
      progress: {
        current: Math.min(conf.targetCount, currentVal),
        target: conf.targetCount,
        unit: conf.unit,
      },
    };
  });
}

export function generateDailyMissions(duration: StudyDuration): QuestMission[] {
  if (duration === 15) {
    return [
      {
        id: 'mission-15-apt',
        title: 'Solve 5 Aptitude Questions',
        description: 'Complete 5 questions in Quantitative or Logical Reasoning.',
        category: 'quant',
        targetCount: 5,
        currentCount: 0,
        xpReward: 35,
        isCompleted: false,
        isClaimed: false,
        actionPayload: {
          mode: 'practice',
          topic: 'Percentages',
          category: 'quant',
          count: 5,
        },
      },
      {
        id: 'mission-15-comeback',
        title: 'Revise 2 Notebook Mistakes',
        description: 'Reattempt 2 questions in your Wrong Answer Notebook.',
        category: 'revision',
        targetCount: 2,
        currentCount: 0,
        xpReward: 30,
        isCompleted: false,
        isClaimed: false,
        actionPayload: {
          mode: 'practice',
          isRevision: true,
          count: 2,
        },
      },
    ];
  }

  if (duration === 30) {
    return [
      {
        id: 'mission-30-apt',
        title: 'Solve 5 Quantitative Questions',
        description: 'Practice 5 questions in Percentages or Profit & Loss.',
        category: 'quant',
        targetCount: 5,
        currentCount: 0,
        xpReward: 35,
        isCompleted: false,
        isClaimed: false,
        actionPayload: {
          mode: 'practice',
          topic: 'Percentages',
          category: 'quant',
          count: 5,
        },
      },
      {
        id: 'mission-30-log',
        title: 'Complete 1 Logical Reasoning Set',
        description: 'Solve questions in Number Series or Coding-Decoding.',
        category: 'logical',
        targetCount: 5,
        currentCount: 0,
        xpReward: 40,
        isCompleted: false,
        isClaimed: false,
        actionPayload: {
          mode: 'practice',
          topic: 'Number Series',
          category: 'logical',
          count: 5,
        },
      },
      {
        id: 'mission-30-code',
        title: 'Solve 1 Coding / Algorithm Problem',
        description: 'Test your grasp on time complexity and data structures.',
        category: 'coding',
        targetCount: 1,
        currentCount: 0,
        xpReward: 30,
        isCompleted: false,
        isClaimed: false,
        actionPayload: {
          mode: 'practice',
          topic: 'Arrays and Hashing',
          category: 'coding',
          count: 1,
        },
      },
    ];
  }

  // 60 minutes
  return [
    {
      id: 'mission-60-mock',
      title: 'Full Placement Mock Assessment',
      description: 'Complete a timed mock test spanning Quant, Logic & Verbal.',
      category: 'mixed',
      targetCount: 1,
      currentCount: 0,
      xpReward: 50,
      isCompleted: false,
      isClaimed: false,
      actionPayload: {
        mode: 'mock',
        count: 15,
      },
    },
    {
      id: 'mission-60-code',
      title: 'Solve 3 Coding / Core CS Questions',
      description: 'Strengthen technical rounds with algorithms and DBMS.',
      category: 'coding',
      targetCount: 3,
      currentCount: 0,
      xpReward: 45,
      isCompleted: false,
      isClaimed: false,
      actionPayload: {
        mode: 'practice',
        topic: 'Arrays and Hashing',
        category: 'coding',
        count: 3,
      },
    },
    {
      id: 'mission-60-comeback',
      title: 'Revise 3 Notebook Mistakes',
      description: 'Reattempt and master questions from your Wrong Answer Notebook.',
      category: 'revision',
      targetCount: 3,
      currentCount: 0,
      xpReward: 40,
      isCompleted: false,
      isClaimed: false,
      actionPayload: {
        mode: 'practice',
        isRevision: true,
        count: 3,
      },
    },
    {
      id: 'mission-60-accuracy',
      title: 'High Accuracy Mastery Drill',
      description: 'Complete a 5-question drill with >= 80% accuracy.',
      category: 'quant',
      targetCount: 1,
      currentCount: 0,
      xpReward: 40,
      isCompleted: false,
      isClaimed: false,
      actionPayload: {
        mode: 'practice',
        topic: 'Time and Work',
        category: 'quant',
        count: 5,
      },
    },
  ];
}

export function getDailyQuestPlan(duration: StudyDuration = 30): DailyQuestPlan {
  const todayStr = new Date().toISOString().split('T')[0];
  const saved = PlaceTrackStorage.getDailyQuestPlan(todayStr);

  let missions: QuestMission[];
  if (saved && saved.durationMinutes === duration) {
    missions = saved.missions;
  } else {
    missions = generateDailyMissions(duration);
  }

  // Evaluate mission progress against today's sessions
  const sessions = PlaceTrackStorage.getSessions();
  const todaySessions = sessions.filter(
    (s) => new Date(s.timestamp).toISOString().split('T')[0] === todayStr
  );
  const wrongAnswers = PlaceTrackStorage.getWrongAnswers();
  const understoodCount = wrongAnswers.filter((w) => w.isUnderstood).length;

  missions.forEach((m) => {
    if (m.id.includes('comeback')) {
      m.currentCount = Math.min(m.targetCount, understoodCount);
    } else if (m.id.includes('mock')) {
      const mocksToday = todaySessions.filter((s) => s.mode === 'mock').length;
      m.currentCount = Math.min(m.targetCount, mocksToday);
    } else if (m.id.includes('code')) {
      let codingSolved = 0;
      todaySessions.forEach((s) => {
        s.answers.forEach((ans) => {
          const q = VERIFIED_QUESTION_BANK.find((item) => item.id === ans.questionId);
          if (q && (q.category === 'coding' || q.category === 'technical')) {
            codingSolved += 1;
          }
        });
      });
      m.currentCount = Math.min(m.targetCount, codingSolved);
    } else if (m.id.includes('accuracy')) {
      const highAccuracySessions = todaySessions.filter(
        (s) => s.totalQuestions >= 5 && s.accuracyPercentage >= 80
      ).length;
      m.currentCount = Math.min(m.targetCount, highAccuracySessions);
    } else {
      // General question counter
      let questionsSolved = 0;
      todaySessions.forEach((s) => {
        questionsSolved += s.totalQuestions;
      });
      m.currentCount = Math.min(m.targetCount, questionsSolved);
    }

    if (m.currentCount >= m.targetCount) {
      m.isCompleted = true;
    }
  });

  const totalXpAvailable = missions.reduce((sum, m) => sum + m.xpReward, 0);
  const earnedXp = missions
    .filter((m) => m.isCompleted)
    .reduce((sum, m) => sum + m.xpReward, 0);

  const plan: DailyQuestPlan = {
    date: todayStr,
    durationMinutes: duration,
    missions,
    totalXpAvailable,
    earnedXp,
  };

  PlaceTrackStorage.saveDailyQuestPlan(todayStr, plan);
  return plan;
}

export function claimMissionXp(
  missionId: string
): { success: boolean; xpAwarded: number; newTotalXp: number; levelTitle: string } {
  const todayStr = new Date().toISOString().split('T')[0];
  const plan = getDailyQuestPlan();
  const mission = plan.missions.find((m) => m.id === missionId);

  if (!mission || !mission.isCompleted || mission.isClaimed) {
    const profile = PlaceTrackStorage.getProfile();
    return {
      success: false,
      xpAwarded: 0,
      newTotalXp: profile.totalXp,
      levelTitle: profile.levelTitle,
    };
  }

  mission.isClaimed = true;
  PlaceTrackStorage.saveDailyQuestPlan(todayStr, plan);

  const eventId = `mission_${missionId}_${todayStr}`;
  const res = PlaceTrackStorage.addXp(mission.xpReward, eventId);

  return {
    success: true,
    xpAwarded: mission.xpReward,
    newTotalXp: res.newTotal,
    levelTitle: res.newTitle,
  };
}
