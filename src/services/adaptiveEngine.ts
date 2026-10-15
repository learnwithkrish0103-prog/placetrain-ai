import { Difficulty } from '../types/aptitude';
import { PlaceTrackStorage } from './storage';

export interface AdaptiveRecommendation {
  recommendedDifficulty: Difficulty;
  basisAccuracy: number | null;
  totalAttempts: number;
  explanation: string;
  actionGuidance: string;
}

export function getAdaptiveRecommendationForTopic(topicTitle: string): AdaptiveRecommendation {
  const analytics = PlaceTrackStorage.getAnalyticsSummary();
  const stat = analytics.topicStats[topicTitle];

  if (!stat || stat.attempted === 0) {
    return {
      recommendedDifficulty: 'Easy',
      basisAccuracy: null,
      totalAttempts: 0,
      explanation: 'No prior attempts recorded for this topic yet.',
      actionGuidance: 'Starting with Easy difficulty to establish foundational formulas and speed.',
    };
  }

  const accuracy = stat.accuracy;
  const attempts = stat.attempted;

  if (accuracy < 50) {
    return {
      recommendedDifficulty: 'Easy',
      basisAccuracy: accuracy,
      totalAttempts: attempts,
      explanation: `Current accuracy is ${accuracy}% across ${attempts} question attempts.`,
      actionGuidance:
        'Accuracy is below 50%. We recommend practicing foundational Easy questions and reviewing core formulas before attempting multi-step problems.',
    };
  }

  if (accuracy >= 50 && accuracy < 75) {
    return {
      recommendedDifficulty: 'Medium',
      basisAccuracy: accuracy,
      totalAttempts: attempts,
      explanation: `Current accuracy is ${accuracy}% across ${attempts} question attempts.`,
      actionGuidance:
        'Moderate accuracy achieved. Ready for Medium questions to strengthen calculation speed and multi-step reasoning.',
    };
  }

  return {
    recommendedDifficulty: 'Hard',
    basisAccuracy: accuracy,
    totalAttempts: attempts,
    explanation: `Consistently high accuracy of ${accuracy}% across ${attempts} question attempts.`,
    actionGuidance:
      'High accuracy achieved! Recommended to practice Hard difficulty questions to simulate top tier campus placement screening (e.g. TCS Digital, Amazon, Infosys SP).',
  };
}
