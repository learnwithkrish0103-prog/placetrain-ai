export type CategoryId = 'quant' | 'logical' | 'verbal' | 'di' | 'coding' | 'technical';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type PracticeMode = 'learn' | 'practice' | 'mock';

export type SkillClassification =
  | 'Insufficient Data'
  | 'Beginner'
  | 'Developing'
  | 'Consistent'
  | 'Strong';

export interface DataVisual {
  type: 'table' | 'bar' | 'pie' | 'line';
  title: string;
  subtitle?: string;
  headers?: string[];
  rows?: (string | number)[][];
  items?: { label: string; value: number; color?: string }[];
}

export interface Question {
  id: string;
  category: CategoryId;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  stepByStepSolution: string[];
  formulaNotes?: string;
  marks: number;
  timeLimitSeconds?: number;
  hint: string;
  dataVisual?: DataVisual;
  codeSnippet?: string; // For Coding / Tech questions
}

export interface QuestionPaletteItem {
  questionNumber: number;
  questionId: string;
  status: 'unvisited' | 'unanswered' | 'answered' | 'marked_for_review' | 'answered_and_marked';
}

export interface UserQuestionState {
  selectedOption: number | null;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
  checkedInLearnMode?: boolean;
}

export interface PracticeSessionResult {
  id: string;
  title: string;
  mode: PracticeMode;
  category?: CategoryId;
  topic?: string;
  difficulty?: Difficulty | 'Mixed';
  timestamp: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number;
  maxScore: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  topicBreakdown: Record<string, { attempted: number; correct: number }>;
  answers: {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }[];
}

export interface WrongAnswerRecord {
  questionId: string;
  question: Question;
  lastSelectedOption: number;
  correctOption: number;
  timestamp: number;
  mistakeCount: number;
  isUnderstood: boolean;
  dueDate: string; // YYYY-MM-DD
  stage: 'due_today' | 'spaced_review' | 'mastered';
  successfulReattempts: number;
}

export interface BookmarkRecord {
  questionId: string;
  timestamp: number;
  notes?: string;
}

export interface TopicCatalogItem {
  id: string;
  category: CategoryId;
  title: string;
  description: string;
  isAvailable: boolean;
  keyFormulas?: string[];
  frequentInCompanies: string[];
}

// ----------------------------------------
// FEATURE 1: PERSONAL PLACEMENT DNA
// ----------------------------------------
export interface SkillTrackMetrics {
  id: string;
  name: string;
  category: CategoryId | 'mock';
  description: string;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgTimeSeconds: number;
  classification: SkillClassification;
  classificationReason: string;
  weakTopics: string[];
  strongTopics: string[];
}

export interface PlacementDNAProfile {
  studentId: string;
  lastCalculated: number;
  skills: SkillTrackMetrics[];
  overallReadinessScore: number;
  topStrengths: string[];
  priorityGaps: string[];
}

// ----------------------------------------
// FEATURE 2: WEAKNESS HUNTER
// ----------------------------------------
export interface WeaknessInsight {
  id: string;
  topic: string;
  category: CategoryId;
  severity: 'confirmed' | 'emerging';
  evidence: string;
  likelyGap: string;
  recommendedActivity: {
    title: string;
    mode: PracticeMode;
    topic: string;
    difficulty: Difficulty;
    questionCount: number;
  };
  improvementMetric: string;
}

// ----------------------------------------
// FEATURE 3 & 4: PLACEMENT QUEST, XP & ACHIEVEMENTS
// ----------------------------------------
export type StudyDuration = 15 | 30 | 60;

export interface QuestMission {
  id: string;
  title: string;
  description: string;
  category: CategoryId | 'mixed' | 'revision';
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionPayload: {
    mode: PracticeMode;
    topic?: string;
    category?: CategoryId;
    isRevision?: boolean;
    count?: number;
  };
}

export interface DailyQuestPlan {
  date: string;
  durationMinutes: StudyDuration;
  missions: QuestMission[];
  totalXpAvailable: number;
  earnedXp: number;
}

export interface LevelThreshold {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'practice' | 'accuracy' | 'streak' | 'comeback' | 'mastery';
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: {
    current: number;
    target: number;
    unit: string;
  };
}

// ----------------------------------------
// FEATURE 6: YOUR NEXT BEST MOVE
// ----------------------------------------
export interface NextBestMove {
  headline: string;
  topic: string;
  category: CategoryId | 'mock' | 'revision';
  reason: string;
  actionText: string;
  practicePayload: {
    mode: PracticeMode;
    topic?: string;
    category?: CategoryId;
    difficulty: Difficulty | 'All';
    count: number;
    isRevision?: boolean;
  };
}

export interface StudentPlacementProfile {
  name: string;
  targetCompanies: string[];
  graduatingYear: number;
  overallReadinessScore: number;
  streakCount: number;
  lastActiveDate: string;
  totalXp: number;
  level: number;
  levelTitle: string;
  preferredStudyDuration: StudyDuration;
  claimedXpEventIds: string[];
}
