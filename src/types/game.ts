import { Question } from './aptitude';

export type WorldId = 'math-adventure' | 'logic-quest' | 'space-mission';

export type ObstacleType =
  | 'bridge'
  | 'gate'
  | 'machine'
  | 'chest'
  | 'cauldron'
  | 'terminal'
  | 'barrier'
  | 'portal';

export type CollectibleType = 'gem' | 'star' | 'energy_cell';

export interface GameObstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  hitRadius: number;
  label: string;
  challengeTitle: string;
  requiredTopic: string;
  narrative: string;
  question: Question;
  isSolved: boolean;
  animationProgress: number; // 0 to 1
  blocksMovement: boolean;
  barrierBox?: { x: number; y: number; width: number; height: number };
}

export interface GameCollectible {
  id: string;
  x: number;
  y: number;
  type: CollectibleType;
  value: number;
  isCollected: boolean;
  animationAngle: number;
}

export interface GameBoss {
  id: string;
  name: string;
  title: string;
  avatar: string;
  x: number;
  y: number;
  maxHp: number;
  currentHp: number;
  questions: Question[];
  currentQuestionIndex: number;
  isDefeated: boolean;
  dialogueIntro: string;
  dialogueDefeated: string;
}

export interface GameLevel {
  id: string;
  worldId: WorldId;
  name: string;
  subtitle: string;
  description: string;
  worldWidth: number;
  worldHeight: number;
  theme: {
    groundColor: string;
    pathColor: string;
    accentColor: string;
    waterOrVoidColor?: string;
    ambientEffect: 'leaves' | 'matrix' | 'stars';
  };
  playerStart: { x: number; y: number };
  obstacles: GameObstacle[];
  collectibles: GameCollectible[];
  boss?: GameBoss;
  exitPortal: { x: number; y: number; unlocked: boolean; label: string };
}

export interface GameSaveRecord {
  worldId: WorldId;
  levelId: string;
  completed: boolean;
  highScore: number;
  accuracy: number;
  bestTimeSeconds: number;
  starsEarned: number;
  lastPlayed: number;
}
