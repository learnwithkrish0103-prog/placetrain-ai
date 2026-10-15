import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sparkles,
  Play,
  Trophy,
  Star,
  Shield,
  Gem,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  Flame,
  Volume2,
  Cpu,
  Rocket,
  TreePine,
} from 'lucide-react';
import { GAME_LEVELS } from '../../data/gameLevels';
import { GameLevel } from '../../types/game';
import { PlaceTrackStorage } from '../../services/storage';

interface GameHubProps {
  onStartLevel: (level: GameLevel) => void;
  onBackToDashboard: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  onStartLevel,
  onBackToDashboard,
}) => {
  const [progress, setProgress] = useState(() => PlaceTrackStorage.getGameProgress());

  useEffect(() => {
    setProgress(PlaceTrackStorage.getGameProgress());
  }, []);

  const totalCompleted = Object.values(progress).filter((p) => p.completed).length;
  const totalStars = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);

  const worldIcons: Record<string, any> = {
    'math-adventure': TreePine,
    'logic-quest': Cpu,
    'space-mission': Rocket,
  };

  const worldGradients: Record<string, string> = {
    'math-adventure': 'from-emerald-900 via-teal-950 to-slate-900 border-emerald-500/40',
    'logic-quest': 'from-blue-950 via-indigo-950 to-slate-900 border-sky-500/40',
    'space-mission': 'from-purple-950 via-slate-950 to-indigo-950 border-purple-500/40',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-900/60 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Interactive 2D Educational Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            PlaceTrack 2D Aptitude Arcade
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Move beyond static multiple-choice questionnaires! Guide your adventurer through physical 2D worlds where real placement aptitude problems repair bridges, spin steam machines, unlock ancient portcullises, and defeat guardian Bosses.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onStartLevel(GAME_LEVELS[0])}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Math Adventure (Level 1)</span>
            </button>

            <button
              onClick={onBackToDashboard}
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              Return to Standard Dashboard
            </button>
          </div>
        </div>

        {/* Hero Quick Stats */}
        <div className="mt-8 pt-6 border-t border-indigo-900/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-900/40">
            <div className="text-xs text-slate-400 font-medium">Worlds Cleared</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {totalCompleted} / {GAME_LEVELS.length}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-900/40">
            <div className="text-xs text-slate-400 font-medium">Clearance Stars</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1 flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400" />
              <span>{totalStars}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-900/40">
            <div className="text-xs text-slate-400 font-medium">Controls</div>
            <div className="text-sm font-bold text-slate-200 mt-1">
              WASD · Mouse · [E]
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-900/40">
            <div className="text-xs text-slate-400 font-medium">Learning Integrity</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              Verified Solutions
            </div>
          </div>
        </div>
      </div>

      {/* World Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Select Your 2D Game World
            </h2>
            <p className="text-xs text-slate-500">
              Each world features animated mechanisms, placement obstacles, collectibles, and boss encounters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {GAME_LEVELS.map((lvl) => {
            const Icon = worldIcons[lvl.worldId] || Gamepad2;
            const lvlProgress = progress[lvl.id] || {
              completed: false,
              stars: 0,
              highScore: 0,
            };

            return (
              <div
                key={lvl.id}
                className={`relative rounded-3xl bg-gradient-to-b ${
                  worldGradients[lvl.worldId]
                } p-6 text-white border shadow-xl flex flex-col justify-between transition-all hover:scale-[1.01]`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (lvlProgress.stars || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {lvl.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {lvl.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lvl.description}
                  </p>

                  {/* Obstacles & Topics */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Integrated Placement Puzzles:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {lvl.obstacles.map((obs) => (
                        <span
                          key={obs.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/10 text-slate-200 border border-white/10"
                        >
                          {obs.requiredTopic}
                        </span>
                      ))}
                      {lvl.boss && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Boss: {lvl.boss.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {lvlProgress.completed ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sector Cleared</span>
                      </span>
                    ) : (
                      <span>5 Challenges + Boss</span>
                    )}
                  </div>

                  <button
                    onClick={() => onStartLevel(lvl)}
                    className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{lvlProgress.completed ? 'Play Again' : 'Enter World'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide & Learning Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Compass className="w-5 h-5" />
            <span>Interactive Obstacles</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Move up to broken bridges, steam machines, and portcullises. Solving aptitude problems physically changes the environment so you can cross.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <Shield className="w-5 h-5" />
            <span>Gentle Learning Feedback</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            No punitive game overs! Missed answers reveal mathematical explanations, formula notes, and unlimited re-attempts.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
            <Trophy className="w-5 h-5" />
            <span>Syncs with Placement DNA</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every question solved inside the 2D game awards real PlaceTrack XP, updates your Placement DNA accuracy, and tracks streak activity.
          </p>
        </div>
      </div>
    </div>
  );
};
