import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Gem,
  Award,
  Clock,
  Compass,
  Eye,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hand,
} from 'lucide-react';
import { GameAudio } from '../../services/gameAudio';
import { GameLevel } from '../../types/game';

interface GameHUDProps {
  level: GameLevel;
  solvedCount: number;
  totalObstacles: number;
  gemsCount: number;
  elapsedSeconds: number;
  isBossActive: boolean;
  isBossDefeated: boolean;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onExitGame: () => void;
  onVirtualMove: (dir: 'up' | 'down' | 'left' | 'right' | 'stop') => void;
  onVirtualInteract: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  solvedCount,
  totalObstacles,
  gemsCount,
  elapsedSeconds,
  isBossActive,
  isBossDefeated,
  reducedMotion,
  onToggleReducedMotion,
  onExitGame,
  onVirtualMove,
  onVirtualInteract,
}) => {
  const [soundSettings, setSoundSettings] = useState(() => GameAudio.getSettings());
  const [showControlsHelp, setShowControlsHelp] = useState(false);

  const toggleMasterSound = () => {
    const next = !soundSettings.masterMuted;
    GameAudio.setMasterMute(next);
    setSoundSettings(GameAudio.getSettings());
  };

  const toggleMusic = () => {
    const next = !soundSettings.musicMuted;
    GameAudio.setMusicMute(next);
    setSoundSettings(GameAudio.getSettings());
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Top Floating Glass HUD */}
      <div className="absolute top-4 left-4 right-4 z-40 pointer-events-none flex flex-wrap items-center justify-between gap-3">
        {/* Left: World Title & Back */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl backdrop-blur-md border border-slate-700/80 shadow-xl">
          <button
            onClick={onExitGame}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                {level.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                2D Interactive Quest
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {level.subtitle}
            </div>
          </div>
        </div>

        {/* Center: Mission Progress Stats */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl backdrop-blur-md border border-slate-700/80 shadow-xl">
          {/* Obstacles Solved */}
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Puzzles:</span>
            <span className="font-mono font-bold text-white">
              {solvedCount}/{totalObstacles}
            </span>
          </div>

          <div className="w-px h-4 bg-slate-700" />

          {/* Gems */}
          <div className="flex items-center gap-1.5 text-xs">
            <Gem className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Gems:</span>
            <span className="font-mono font-bold text-amber-300">{gemsCount}</span>
          </div>

          <div className="w-px h-4 bg-slate-700" />

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="font-mono font-bold text-slate-200">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Right: Sound, Music, Accessibility, Help */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 text-white p-1.5 rounded-2xl backdrop-blur-md border border-slate-700/80 shadow-xl">
          {/* Master Sound Toggle */}
          <button
            onClick={toggleMasterSound}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              !soundSettings.masterMuted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={soundSettings.masterMuted ? 'Enable Sound & SFX' : 'Mute Master Audio'}
          >
            {!soundSettings.masterMuted ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {!soundSettings.masterMuted ? 'Audio ON' : 'Audio OFF'}
            </span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            disabled={soundSettings.masterMuted}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              !soundSettings.musicMuted && !soundSettings.masterMuted
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title="Toggle Background Music"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Music</span>
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={onToggleReducedMotion}
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
              reducedMotion
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Help Modal Toggle */}
          <button
            onClick={() => setShowControlsHelp(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Controls & Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Virtual D-Pad for Mouse/Touch Accessibility */}
      <div className="absolute bottom-6 left-6 z-40 pointer-events-auto flex items-end gap-3 select-none">
        <div className="bg-slate-900/85 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col items-center">
          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
            Controls
          </div>
          <button
            onMouseDown={() => onVirtualMove('up')}
            onMouseUp={() => onVirtualMove('stop')}
            onTouchStart={() => onVirtualMove('up')}
            onTouchEnd={() => onVirtualMove('stop')}
            className="w-10 h-10 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
            aria-label="Move Up"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 my-1">
            <button
              onMouseDown={() => onVirtualMove('left')}
              onMouseUp={() => onVirtualMove('stop')}
              onTouchStart={() => onVirtualMove('left')}
              onTouchEnd={() => onVirtualMove('stop')}
              className="w-10 h-10 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Move Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-slate-950/60 rounded-lg flex items-center justify-center text-[10px] font-mono text-slate-500 font-bold">
              WASD
            </div>
            <button
              onMouseDown={() => onVirtualMove('right')}
              onMouseUp={() => onVirtualMove('stop')}
              onTouchStart={() => onVirtualMove('right')}
              onTouchEnd={() => onVirtualMove('stop')}
              className="w-10 h-10 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Move Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onMouseDown={() => onVirtualMove('down')}
            onMouseUp={() => onVirtualMove('stop')}
            onTouchStart={() => onVirtualMove('down')}
            onTouchEnd={() => onVirtualMove('stop')}
            className="w-10 h-10 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
            aria-label="Move Down"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Interact [E] */}
        <button
          onClick={onVirtualInteract}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-xl border border-indigo-400/40 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Hand className="w-4 h-4" />
          <span>Interact [E / Space]</span>
        </button>
      </div>

      {/* Bottom Right Prompt Tip */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-none hidden md:block">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 shadow-lg flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Walk near any glowing object or bridge to solve aptitude challenges!</span>
        </div>
      </div>

      {/* Controls Help Modal */}
      {showControlsHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>2D Adventure Guide & Controls</span>
              </h3>
              <button
                onClick={() => setShowControlsHelp(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-600">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Desktop & Keyboard Controls
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono text-indigo-600">WASD / Arrow Keys</span>
                    <p className="text-slate-500 mt-0.5">Walk character in 4 directions</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono text-indigo-600">E / Spacebar</span>
                    <p className="text-slate-500 mt-0.5">Interact with obstacles & gates</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono text-indigo-600">Mouse Click</span>
                    <p className="text-slate-500 mt-0.5">Click ground to pathfind & walk</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono text-indigo-600">1, 2, 3, 4</span>
                    <p className="text-slate-500 mt-0.5">Select multiple-choice answers</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  How Obstacles Work
                </h4>
                <p>
                  Approaching an obstacle triggers a placement aptitude question. Accurate solutions lower bridges, unlock gates, power steam engines, and defeat the guardian Boss!
                </p>
                <p className="text-emerald-700 font-semibold">
                  Zero punishment for errors: review step-by-step math solutions and re-attempt anytime!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowControlsHelp(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Resume Adventure
            </button>
          </div>
        </div>
      )}
    </>
  );
};
