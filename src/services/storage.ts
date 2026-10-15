import {
  PracticeSessionResult,
  WrongAnswerRecord,
  BookmarkRecord,
  Question,
  StudentPlacementProfile,
  Difficulty,
} from '../types/aptitude';
import { VERIFIED_QUESTION_BANK } from '../data/questionBank';

const STORAGE_KEYS = {
  SESSIONS: 'placetrack_aptitude_sessions_v1',
  WRONG_ANSWERS: 'placetrack_wrong_answers_v1',
  BOOKMARKS: 'placetrack_bookmarks_v1',
  ATTEMPTS: 'placetrack_question_attempts_v1',
  DAILY_CHALLENGES: 'placetrack_daily_challenges_v1',
  PROFILE: 'placetrack_student_profile_v1',
  DAILY_QUEST: 'placetrack_daily_quest_v1',
  GAME_PROGRESS: 'placetrack_game_progress_v1',
};

// Safe LocalStorage helpers
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to localStorage:`, e);
  }
}

// Student Profile
export const DEFAULT_PROFILE: StudentPlacementProfile = {
  name: 'Placement Aspirant',
  targetCompanies: ['TCS NQT', 'Infosys', 'Accenture'],
  graduatingYear: 2026,
  overallReadinessScore: 68,
  streakCount: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalXp: 140,
  level: 2,
  levelTitle: 'Problem Solver',
  preferredStudyDuration: 30,
  claimedXpEventIds: [],
};

export const LEVEL_TIERS = [
  { level: 1, title: 'Explorer', minXp: 0, maxXp: 99 },
  { level: 2, title: 'Problem Solver', minXp: 100, maxXp: 249 },
  { level: 3, title: 'Skill Builder', minXp: 250, maxXp: 499 },
  { level: 4, title: 'Challenge Master', minXp: 500, maxXp: 899 },
  { level: 5, title: 'Placement Strategist', minXp: 900, maxXp: 99999 },
];

export function calculateLevelFromXp(xp: number): { level: number; title: string; minXp: number; maxXp: number } {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      return LEVEL_TIERS[i];
    }
  }
  return LEVEL_TIERS[0];
}

export const PlaceTrackStorage = {
  getProfile(): StudentPlacementProfile {
    return safeGet<StudentPlacementProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },

  updateProfile(updates: Partial<StudentPlacementProfile>): StudentPlacementProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    safeSet(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },

  getSessions(): PracticeSessionResult[] {
    return safeGet<PracticeSessionResult[]>(STORAGE_KEYS.SESSIONS, []);
  },

  saveSession(session: PracticeSessionResult): void {
    const sessions = this.getSessions();
    sessions.unshift(session);
    safeSet(STORAGE_KEYS.SESSIONS, sessions);

    // Update attempts & wrong answers
    const attempts = safeGet<Record<string, { total: number; correct: number; lastDate: number }>>(
      STORAGE_KEYS.ATTEMPTS,
      {}
    );

    session.answers.forEach((ans) => {
      if (!attempts[ans.questionId]) {
        attempts[ans.questionId] = { total: 0, correct: 0, lastDate: Date.now() };
      }
      attempts[ans.questionId].total += 1;
      if (ans.isCorrect) {
        attempts[ans.questionId].correct += 1;
      }
      attempts[ans.questionId].lastDate = Date.now();

      // If answered incorrectly, register in Wrong Answers Notebook
      if (!ans.isCorrect && ans.selectedOption !== null) {
        const questionObj = VERIFIED_QUESTION_BANK.find((q) => q.id === ans.questionId);
        if (questionObj) {
          this.recordWrongAnswer(questionObj, ans.selectedOption);
        }
      }
    });

    safeSet(STORAGE_KEYS.ATTEMPTS, attempts);

    // Update activity streak
    this.updateStreak();
  },

  getWrongAnswers(): WrongAnswerRecord[] {
    return safeGet<WrongAnswerRecord[]>(STORAGE_KEYS.WRONG_ANSWERS, []);
  },

  recordWrongAnswer(question: Question, selectedOption: number): void {
    const current = this.getWrongAnswers();
    const existingIndex = current.findIndex((item) => item.questionId === question.id);
    const todayStr = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      current[existingIndex].mistakeCount += 1;
      current[existingIndex].lastSelectedOption = selectedOption;
      current[existingIndex].timestamp = Date.now();
      current[existingIndex].isUnderstood = false;
      current[existingIndex].stage = 'due_today';
      current[existingIndex].dueDate = todayStr;
    } else {
      current.unshift({
        questionId: question.id,
        question,
        lastSelectedOption: selectedOption,
        correctOption: question.correctAnswer,
        timestamp: Date.now(),
        mistakeCount: 1,
        isUnderstood: false,
        dueDate: todayStr,
        stage: 'due_today',
        successfulReattempts: 0,
      });
    }

    safeSet(STORAGE_KEYS.WRONG_ANSWERS, current);
  },

  recordMistakeReattemptSuccess(questionId: string): { rewarded: boolean; stage: 'spaced_review' | 'mastered' } {
    const current = this.getWrongAnswers();
    const item = current.find((i) => i.questionId === questionId);
    if (!item) return { rewarded: false, stage: 'spaced_review' };

    item.successfulReattempts = (item.successfulReattempts || 0) + 1;
    item.isUnderstood = true;

    // Spaced repetition schedule
    const futureDate = new Date();
    if (item.successfulReattempts >= 2) {
      item.stage = 'mastered';
      futureDate.setDate(futureDate.getDate() + 14); // 2 weeks review
    } else {
      item.stage = 'spaced_review';
      futureDate.setDate(futureDate.getDate() + 2); // 2 days review
    }
    item.dueDate = futureDate.toISOString().split('T')[0];
    safeSet(STORAGE_KEYS.WRONG_ANSWERS, current);

    // Award Comeback XP (+30 XP)
    this.addXp(30, `comeback_${questionId}_${Date.now()}`);
    return { rewarded: true, stage: item.stage };
  },

  toggleWrongAnswerUnderstood(questionId: string): void {
    const current = this.getWrongAnswers();
    const item = current.find((i) => i.questionId === questionId);
    if (item) {
      item.isUnderstood = !item.isUnderstood;
      if (item.isUnderstood && item.stage === 'due_today') {
        item.stage = 'spaced_review';
        const d = new Date();
        d.setDate(d.getDate() + 2);
        item.dueDate = d.toISOString().split('T')[0];
      }
      safeSet(STORAGE_KEYS.WRONG_ANSWERS, current);
    }
  },

  removeWrongAnswer(questionId: string): void {
    const current = this.getWrongAnswers().filter((i) => i.questionId !== questionId);
    safeSet(STORAGE_KEYS.WRONG_ANSWERS, current);
  },

  addXp(
    amount: number,
    eventId?: string
  ): { added: boolean; newTotal: number; newLevel: number; newTitle: string; leveledUp: boolean } {
    const profile = this.getProfile();
    const claimedIds = profile.claimedXpEventIds || [];

    if (eventId && claimedIds.includes(eventId)) {
      return {
        added: false,
        newTotal: profile.totalXp,
        newLevel: profile.level,
        newTitle: profile.levelTitle,
        leveledUp: false,
      };
    }

    const newTotalXp = (profile.totalXp || 0) + amount;
    const tierInfo = calculateLevelFromXp(newTotalXp);
    const leveledUp = tierInfo.level > (profile.level || 1);

    const updatedClaimed = eventId ? [...claimedIds, eventId] : claimedIds;

    this.updateProfile({
      totalXp: newTotalXp,
      level: tierInfo.level,
      levelTitle: tierInfo.title,
      claimedXpEventIds: updatedClaimed,
    });

    return {
      added: true,
      newTotal: newTotalXp,
      newLevel: tierInfo.level,
      newTitle: tierInfo.title,
      leveledUp,
    };
  },

  getDailyQuestPlan(dateKey: string): any | null {
    const plans = safeGet<Record<string, any>>(STORAGE_KEYS.DAILY_QUEST, {});
    return plans[dateKey] || null;
  },

  saveDailyQuestPlan(dateKey: string, plan: any): void {
    const plans = safeGet<Record<string, any>>(STORAGE_KEYS.DAILY_QUEST, {});
    plans[dateKey] = plan;
    safeSet(STORAGE_KEYS.DAILY_QUEST, plans);
  },

  getBookmarks(): BookmarkRecord[] {
    return safeGet<BookmarkRecord[]>(STORAGE_KEYS.BOOKMARKS, []);
  },

  isBookmarked(questionId: string): boolean {
    const list = this.getBookmarks();
    return list.some((b) => b.questionId === questionId);
  },

  toggleBookmark(questionId: string, notes?: string): boolean {
    const current = this.getBookmarks();
    const index = current.findIndex((b) => b.questionId === questionId);
    let bookmarked = false;

    if (index >= 0) {
      current.splice(index, 1);
      bookmarked = false;
    } else {
      current.unshift({
        questionId,
        timestamp: Date.now(),
        notes,
      });
      bookmarked = true;
    }

    safeSet(STORAGE_KEYS.BOOKMARKS, current);
    return bookmarked;
  },

  getDailyChallenge(dateKey: string): { completed: boolean; score: number; total: number; timestamp: number } | null {
    const record = safeGet<Record<string, { completed: boolean; score: number; total: number; timestamp: number }>>(
      STORAGE_KEYS.DAILY_CHALLENGES,
      {}
    );
    return record[dateKey] || null;
  },

  recordDailyChallenge(dateKey: string, score: number, total: number): void {
    const records = safeGet<Record<string, { completed: boolean; score: number; total: number; timestamp: number }>>(
      STORAGE_KEYS.DAILY_CHALLENGES,
      {}
    );
    // Prevent duplicate score increments on the same day
    if (!records[dateKey]) {
      records[dateKey] = {
        completed: true,
        score,
        total,
        timestamp: Date.now(),
      };
      safeSet(STORAGE_KEYS.DAILY_CHALLENGES, records);
      this.updateStreak();
    }
  },

  updateStreak(): number {
    const todayStr = new Date().toISOString().split('T')[0];
    const profile = this.getProfile();

    if (profile.lastActiveDate === todayStr) {
      return profile.streakCount;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = profile.streakCount;
    if (profile.lastActiveDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    this.updateProfile({
      streakCount: newStreak,
      lastActiveDate: todayStr,
    });

    return newStreak;
  },

  getAnalyticsSummary() {
    const sessions = this.getSessions();
    const attempts = safeGet<Record<string, { total: number; correct: number; lastDate: number }>>(
      STORAGE_KEYS.ATTEMPTS,
      {}
    );

    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalTimeSpentSeconds = 0;

    sessions.forEach((s) => {
      totalAttempted += s.totalQuestions;
      totalCorrect += s.correctCount;
      totalTimeSpentSeconds += s.totalTimeSeconds;
    });

    const overallAccuracy =
      totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const avgTimePerQuestion =
      totalAttempted > 0 ? Math.round(totalTimeSpentSeconds / totalAttempted) : 0;

    // Topic stats
    const topicStats: Record<string, { attempted: number; correct: number; accuracy: number }> = {};
    sessions.forEach((s) => {
      Object.entries(s.topicBreakdown || {}).forEach(([topic, stats]) => {
        if (!topicStats[topic]) {
          topicStats[topic] = { attempted: 0, correct: 0, accuracy: 0 };
        }
        topicStats[topic].attempted += stats.attempted;
        topicStats[topic].correct += stats.correct;
      });
    });

    Object.keys(topicStats).forEach((topic) => {
      const t = topicStats[topic];
      t.accuracy = t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0;
    });

    // Difficulty breakdown
    const difficultyStats: Record<Difficulty, { attempted: number; correct: number; accuracy: number }> = {
      Easy: { attempted: 0, correct: 0, accuracy: 0 },
      Medium: { attempted: 0, correct: 0, accuracy: 0 },
      Hard: { attempted: 0, correct: 0, accuracy: 0 },
    };

    sessions.forEach((s) => {
      s.answers.forEach((ans) => {
        const q = VERIFIED_QUESTION_BANK.find((item) => item.id === ans.questionId);
        if (q && difficultyStats[q.difficulty]) {
          difficultyStats[q.difficulty].attempted += 1;
          if (ans.isCorrect) {
            difficultyStats[q.difficulty].correct += 1;
          }
        }
      });
    });

    (['Easy', 'Medium', 'Hard'] as Difficulty[]).forEach((diff) => {
      const d = difficultyStats[diff];
      d.accuracy = d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0;
    });

    // Identify weak and ready topics
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    Object.entries(topicStats).forEach(([topic, stat]) => {
      if (stat.attempted >= 2 && stat.accuracy < 60) {
        weakTopics.push(topic);
      } else if (stat.attempted >= 3 && stat.accuracy >= 75) {
        strongTopics.push(topic);
      }
    });

    // Number of completed topics (attempted >= 5 and accuracy >= 60%)
    const completedTopicsCount = Object.values(topicStats).filter(
      (s) => s.attempted >= 5 && s.accuracy >= 60
    ).length;

    return {
      totalAttempted,
      totalCorrect,
      overallAccuracy,
      avgTimePerQuestion,
      sessionsCompleted: sessions.length,
      topicStats,
      difficultyStats,
      weakTopics,
      strongTopics,
      completedTopicsCount,
      recentSessions: sessions.slice(0, 5),
    };
  },

  getGameProgress(): Record<string, { completed: boolean; stars: number; highScore: number; accuracy: number }> {
    return safeGet<Record<string, { completed: boolean; stars: number; highScore: number; accuracy: number }>>(
      STORAGE_KEYS.GAME_PROGRESS,
      {
        'level-math-1': { completed: false, stars: 0, highScore: 0, accuracy: 0 },
        'level-logic-2': { completed: false, stars: 0, highScore: 0, accuracy: 0 },
        'level-space-3': { completed: false, stars: 0, highScore: 0, accuracy: 0 },
      }
    );
  },

  saveGameProgress(
    levelId: string,
    record: { completed: boolean; stars: number; highScore: number; accuracy: number }
  ): void {
    const current = this.getGameProgress();
    const existing = current[levelId] || { completed: false, stars: 0, highScore: 0, accuracy: 0 };
    current[levelId] = {
      completed: existing.completed || record.completed,
      stars: Math.max(existing.stars || 0, record.stars || 0),
      highScore: Math.max(existing.highScore || 0, record.highScore || 0),
      accuracy: Math.max(existing.accuracy || 0, record.accuracy || 0),
    };
    safeSet(STORAGE_KEYS.GAME_PROGRESS, current);
    this.updateStreak();
  },

  recordGameQuestionSolved(
    question: Question,
    isCorrect: boolean,
    selectedOption: number,
    timeSpentSeconds: number
  ): void {
    // Record into attempts
    const attempts = safeGet<Record<string, { total: number; correct: number; lastDate: number }>>(
      STORAGE_KEYS.ATTEMPTS,
      {}
    );
    if (!attempts[question.id]) {
      attempts[question.id] = { total: 0, correct: 0, lastDate: Date.now() };
    }
    attempts[question.id].total += 1;
    if (isCorrect) {
      attempts[question.id].correct += 1;
    }
    attempts[question.id].lastDate = Date.now();
    safeSet(STORAGE_KEYS.ATTEMPTS, attempts);

    // If incorrect, add to WrongAnswersNotebook so player can practice later!
    if (!isCorrect) {
      this.recordWrongAnswer(question, selectedOption);
    }

    // Award XP
    if (isCorrect) {
      this.addXp(25, `game_q_${question.id}_${Date.now()}`);
    }
  },
};

