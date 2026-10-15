import {
  PlacementDNAProfile,
  SkillTrackMetrics,
  SkillClassification,
  WeaknessInsight,
  NextBestMove,
  CategoryId,
  PracticeMode,
  Difficulty,
  Question,
} from '../types/aptitude';
import { PlaceTrackStorage } from './storage';
import { VERIFIED_QUESTION_BANK } from '../data/questionBank';

const SKILL_TRACKS_CONFIG: {
  id: string;
  name: string;
  category: CategoryId | 'mock';
  description: string;
}[] = [
  {
    id: 'track-quant',
    name: 'Quantitative Aptitude',
    category: 'quant',
    description: 'Arithmetic, commercial math, number theory, permutations & probability.',
  },
  {
    id: 'track-logical',
    name: 'Logical Reasoning',
    category: 'logical',
    description: 'Deductive logic, series, directional mapping, puzzles, and arrangements.',
  },
  {
    id: 'track-verbal',
    name: 'Verbal Ability',
    category: 'verbal',
    description: 'Sentence correction, error spotting, vocabulary in context, and comprehension.',
  },
  {
    id: 'track-di',
    name: 'Data Interpretation',
    category: 'di',
    description: 'Tabular datasets, comparative bar charts, and sectoral pie distributions.',
  },
  {
    id: 'track-coding',
    name: 'Coding & Problem Solving',
    category: 'coding',
    description: 'Data structures, algorithm complexity, two pointers, and code output tracing.',
  },
  {
    id: 'track-technical',
    name: 'Technical Knowledge',
    category: 'technical',
    description: 'Computer Science core: DBMS (SQL/ACID), OS, Computer Networks & OOP.',
  },
  {
    id: 'track-mock',
    name: 'Mock Test Performance',
    category: 'mock',
    description: 'Full-length timed assessment scores and exam stamina under countdown limits.',
  },
];

export function getClassification(
  attempted: number,
  accuracy: number
): { classification: SkillClassification; reason: string } {
  if (attempted < 3) {
    return {
      classification: 'Insufficient Data',
      reason: `Requires at least 3 question attempts to benchmark skill classification (currently ${attempted} attempted).`,
    };
  }

  if (accuracy < 45) {
    return {
      classification: 'Beginner',
      reason: `Accuracy is ${accuracy}%. Focus on foundational formulas and basic drill solving.`,
    };
  }

  if (accuracy >= 45 && accuracy < 65) {
    return {
      classification: 'Developing',
      reason: `Accuracy is ${accuracy}%. Conceptual base is emerging; work on time management and eliminating distractors.`,
    };
  }

  if (accuracy >= 65 && accuracy < 80) {
    return {
      classification: 'Consistent',
      reason: `Accuracy is ${accuracy}%. Reliable problem solving demonstrated across standard test sets.`,
    };
  }

  // accuracy >= 80
  if (attempted >= 5) {
    return {
      classification: 'Strong',
      reason: `High accuracy of ${accuracy}% across ${attempted} attempts. Placement ready for top-tier recruiters!`,
    };
  }

  return {
    classification: 'Consistent',
    reason: `Accuracy is ${accuracy}% (${attempted} attempts). Attempt 5+ questions to reach 'Strong' benchmark.`,
  };
}

export function calculatePlacementDNA(): PlacementDNAProfile {
  const sessions = PlaceTrackStorage.getSessions();
  const wrongAnswers = PlaceTrackStorage.getWrongAnswers();

  // Aggregate questions by category / mock
  const trackMap = new Map<
    string,
    {
      attempted: number;
      correct: number;
      totalTime: number;
      topicStats: Record<string, { attempted: number; correct: number }>;
    }
  >();

  SKILL_TRACKS_CONFIG.forEach((t) => {
    trackMap.set(t.id, { attempted: 0, correct: 0, totalTime: 0, topicStats: {} });
  });

  sessions.forEach((s) => {
    // If it's a mock test session, also record in mock track
    if (s.mode === 'mock') {
      const mockData = trackMap.get('track-mock')!;
      mockData.attempted += s.totalQuestions;
      mockData.correct += s.correctCount;
      mockData.totalTime += s.totalTimeSeconds;
      if (!mockData.topicStats['Full Placement Mock']) {
        mockData.topicStats['Full Placement Mock'] = { attempted: 0, correct: 0 };
      }
      mockData.topicStats['Full Placement Mock'].attempted += s.totalQuestions;
      mockData.topicStats['Full Placement Mock'].correct += s.correctCount;
    }

    s.answers.forEach((ans) => {
      const q = VERIFIED_QUESTION_BANK.find((item) => item.id === ans.questionId);
      if (!q) return;

      const trackId = `track-${q.category}`;
      const data = trackMap.get(trackId);
      if (data) {
        data.attempted += 1;
        if (ans.isCorrect) data.correct += 1;
        data.totalTime += ans.timeSpentSeconds || 60;

        if (!data.topicStats[q.topic]) {
          data.topicStats[q.topic] = { attempted: 0, correct: 0 };
        }
        data.topicStats[q.topic].attempted += 1;
        if (ans.isCorrect) data.topicStats[q.topic].correct += 1;
      }
    });
  });

  const skills: SkillTrackMetrics[] = SKILL_TRACKS_CONFIG.map((conf) => {
    const raw = trackMap.get(conf.id)!;
    const attempted = raw.attempted;
    const correct = raw.correct;
    const incorrect = Math.max(0, attempted - correct);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const avgTimeSeconds = attempted > 0 ? Math.round(raw.totalTime / attempted) : 0;

    const { classification, reason } = getClassification(attempted, accuracy);

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    Object.entries(raw.topicStats).forEach(([top, stat]) => {
      const topAcc = stat.attempted > 0 ? (stat.correct / stat.attempted) * 100 : 0;
      if (stat.attempted >= 2 && topAcc < 60) {
        weakTopics.push(top);
      } else if (stat.attempted >= 3 && topAcc >= 75) {
        strongTopics.push(top);
      }
    });

    return {
      id: conf.id,
      name: conf.name,
      category: conf.category,
      description: conf.description,
      attempted,
      correct,
      incorrect,
      accuracy,
      avgTimeSeconds,
      classification,
      classificationReason: reason,
      weakTopics,
      strongTopics,
    };
  });

  const topStrengths = skills
    .filter((s) => s.classification === 'Strong' || s.classification === 'Consistent')
    .map((s) => s.name);

  const priorityGaps = skills
    .filter((s) => s.classification === 'Beginner' || s.classification === 'Developing')
    .map((s) => s.name);

  // Overall readiness
  const totalAttempted = skills.reduce((acc, s) => acc + s.attempted, 0);
  const totalCorrect = skills.reduce((acc, s) => acc + s.correct, 0);
  const overallAcc = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return {
    studentId: 'student_current',
    lastCalculated: Date.now(),
    skills,
    overallReadinessScore: Math.min(95, Math.max(45, Math.round(40 + overallAcc * 0.45 + (topStrengths.length * 4)))),
    topStrengths,
    priorityGaps,
  };
}

export function getWeaknessHunterInsights(): WeaknessInsight[] {
  const sessions = PlaceTrackStorage.getSessions();
  const wrongAnswers = PlaceTrackStorage.getWrongAnswers();
  const insights: WeaknessInsight[] = [];

  // Group performance by topic
  const topicStats: Record<
    string,
    { attempted: number; correct: number; totalTime: number; category: CategoryId }
  > = {};

  sessions.forEach((s) => {
    s.answers.forEach((ans) => {
      const q = VERIFIED_QUESTION_BANK.find((item) => item.id === ans.questionId);
      if (!q) return;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = {
          attempted: 0,
          correct: 0,
          totalTime: 0,
          category: q.category,
        };
      }
      topicStats[q.topic].attempted += 1;
      if (ans.isCorrect) topicStats[q.topic].correct += 1;
      topicStats[q.topic].totalTime += ans.timeSpentSeconds || 60;
    });
  });

  // Check 1: Topics with low accuracy (< 50% with at least 2 attempts)
  Object.entries(topicStats).forEach(([topic, stat]) => {
    const accuracy = Math.round((stat.correct / stat.attempted) * 100);
    const avgTime = Math.round(stat.totalTime / stat.attempted);

    if (stat.attempted >= 2 && accuracy < 50) {
      let likelyGap = 'Misidentifying baseline variables or using lengthy algebraic trial-and-error.';
      if (topic === 'Percentages') {
        likelyGap = 'Confusion regarding base value in successive percentage variation and consumption-expenditure formulas.';
      } else if (topic === 'Time and Work') {
        likelyGap = 'Algebraic fraction bottlenecks instead of using the LCM work-unit method.';
      } else if (topic === 'Time, Speed and Distance' || topic === 'Trains') {
        likelyGap = 'Relative speed vector addition/subtraction or units conversion (km/h to m/s) oversights.';
      } else if (topic === 'Arrays and Hashing' || topic === 'Coding & Problem Solving') {
        likelyGap = 'Defaulting to O(N²) nested loops rather than using hash map complement lookup.';
      }

      insights.push({
        id: `weak_${topic.toLowerCase().replace(/\s+/g, '_')}`,
        topic,
        category: stat.category,
        severity: stat.attempted >= 3 ? 'confirmed' : 'emerging',
        evidence: `${stat.attempted - stat.correct} incorrect out of ${stat.attempted} attempts (${accuracy}% accuracy recorded).`,
        likelyGap,
        recommendedActivity: {
          title: `Reinforce ${topic} Foundations`,
          mode: 'learn',
          topic,
          difficulty: 'Easy',
          questionCount: 5,
        },
        improvementMetric: `Achieve >= 70% accuracy on next 5 attempts with verified solutions.`,
      });
    } else if (stat.attempted >= 2 && avgTime > 90) {
      // Check 2: High time latency (takes too long even if correct)
      insights.push({
        id: `time_${topic.toLowerCase().replace(/\s+/g, '_')}`,
        topic,
        category: stat.category,
        severity: 'emerging',
        evidence: `Average response time of ${avgTime}s per question exceeds the standard campus placement benchmark of 75s.`,
        likelyGap: 'Using longhand manual computation rather than standard shortcut formulas or option elimination.',
        recommendedActivity: {
          title: `Timed Speed Drill: ${topic}`,
          mode: 'practice',
          topic,
          difficulty: 'Medium',
          questionCount: 5,
        },
        improvementMetric: `Reduce average time per question to under 75s across a 5-question timed session.`,
      });
    }
  });

  // Check 3: Recurring mistakes in Wrong Answers notebook
  wrongAnswers.forEach((w) => {
    if (w.mistakeCount >= 2 && !insights.some((i) => i.topic === w.question.topic)) {
      insights.push({
        id: `repeat_mistake_${w.question.id}`,
        topic: w.question.topic,
        category: w.question.category,
        severity: 'confirmed',
        evidence: `${w.mistakeCount} repeated mistakes recorded for "${w.question.subtopic}".`,
        likelyGap: 'Persistent conceptual confusion on this subtopic; needs structured step-by-step review.',
        recommendedActivity: {
          title: `Mistake Comeback: ${w.question.topic}`,
          mode: 'learn',
          topic: w.question.topic,
          difficulty: w.question.difficulty,
          questionCount: 3,
        },
        improvementMetric: `Successfully reattempt and mark understood in Mistake Notebook (+30 Comeback XP).`,
      });
    }
  });

  return insights;
}

export function getYourNextBestMove(preferredDuration: 15 | 30 | 60 = 30): NextBestMove {
  const insights = getWeaknessHunterInsights();
  const dna = calculatePlacementDNA();
  const wrongAnswers = PlaceTrackStorage.getWrongAnswers();
  const unmasteredMistakes = wrongAnswers.filter((w) => !w.isUnderstood);

  // Priority 1: If there are unmastered mistakes in Wrong Answers Notebook
  if (unmasteredMistakes.length >= 2) {
    const firstWrong = unmasteredMistakes[0];
    return {
      headline: `YOUR NEXT BEST MOVE: Mistake Comeback in ${firstWrong.question.topic}`,
      topic: firstWrong.question.topic,
      category: 'revision',
      reason: `You have ${unmasteredMistakes.length} unmastered mistakes in your Notebook. Re-solving them now reinforces memory and earns +30 Comeback XP.`,
      actionText: `Reattempt ${firstWrong.question.topic} Mistakes`,
      practicePayload: {
        mode: 'practice',
        topic: firstWrong.question.topic,
        difficulty: 'Easy',
        count: preferredDuration === 15 ? 3 : 5,
        isRevision: true,
      },
    };
  }

  // Priority 2: Confirmed weakness from Weakness Hunter
  const confirmedWeakness = insights.find((i) => i.severity === 'confirmed');
  if (confirmedWeakness) {
    return {
      headline: `YOUR NEXT BEST MOVE: Address Learning Gap in ${confirmedWeakness.topic}`,
      topic: confirmedWeakness.topic,
      category: confirmedWeakness.category,
      reason: `Practice ${confirmedWeakness.topic} today because your recent accuracy in this topic is lower than your performance in other areas (${confirmedWeakness.evidence}).`,
      actionText: `Start ${confirmedWeakness.recommendedActivity.difficulty} ${confirmedWeakness.topic} Drill`,
      practicePayload: {
        mode: confirmedWeakness.recommendedActivity.mode,
        topic: confirmedWeakness.topic,
        category: confirmedWeakness.category,
        difficulty: confirmedWeakness.recommendedActivity.difficulty,
        count: preferredDuration === 15 ? 3 : 5,
      },
    };
  }

  // Priority 3: Emerging weakness or weak skill track
  const weakSkill = dna.skills.find((s) => s.classification === 'Beginner' || s.classification === 'Developing');
  if (weakSkill && weakSkill.weakTopics.length > 0) {
    const targetTopic = weakSkill.weakTopics[0];
    return {
      headline: `YOUR NEXT BEST MOVE: Strengthen ${targetTopic}`,
      topic: targetTopic,
      category: weakSkill.category,
      reason: `Your ${weakSkill.name} is currently classified as '${weakSkill.classification}'. Practicing ${targetTopic} will boost this track toward Consistent.`,
      actionText: `Practice ${targetTopic} Now`,
      practicePayload: {
        mode: 'practice',
        topic: targetTopic,
        category: weakSkill.category === 'mock' ? undefined : weakSkill.category,
        difficulty: 'Medium',
        count: 5,
      },
    };
  }

  // Priority 4: If insufficient data overall
  const totalAttempted = dna.skills.reduce((acc, s) => acc + s.attempted, 0);
  if (totalAttempted < 5) {
    return {
      headline: `YOUR NEXT BEST MOVE: Complete Placement Diagnostic Drill`,
      topic: 'Percentages',
      category: 'quant',
      reason: `Your placement profile is still developing with ${totalAttempted} recorded attempts. Complete this 5-question foundational drill to calibrate your Personal Placement DNA and unlock personalized insights.`,
      actionText: `Start 5-Question Diagnostic`,
      practicePayload: {
        mode: 'practice',
        topic: 'Percentages',
        category: 'quant',
        difficulty: 'Easy',
        count: 5,
      },
    };
  }

  // Default: Challenge in Coding or Mock Test
  return {
    headline: `YOUR NEXT BEST MOVE: Placement Speed Simulation`,
    topic: 'Coding & Problem Solving',
    category: 'coding',
    reason: `All core topics show steady accuracy! Advance your profile by tackling Coding Problem Solving and algorithm complexity questions.`,
    actionText: `Launch Coding & Algorithms Practice`,
    practicePayload: {
      mode: 'practice',
      topic: 'Arrays and Hashing',
      category: 'coding',
      difficulty: 'Medium',
      count: 5,
    },
  };
}
