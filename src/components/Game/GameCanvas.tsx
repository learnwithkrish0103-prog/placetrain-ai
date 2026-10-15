import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameLevel, GameObstacle, GameCollectible, GameBoss } from '../../types/game';
import { GameAudio } from '../../services/gameAudio';
import { PlaceTrackStorage } from '../../services/storage';
import { GamePuzzleModal } from './GamePuzzleModal';
import { GameBossModal } from './GameBossModal';
import { GameHUD } from './GameHUD';

interface GameCanvasProps {
  initialLevel: GameLevel;
  onExitGame: () => void;
  onLevelComplete: (stats: {
    levelId: string;
    accuracy: number;
    stars: number;
    timeSeconds: number;
    gems: number;
  }) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  initialLevel,
  onExitGame,
  onLevelComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active level state
  const [level, setLevel] = useState<GameLevel>(() => JSON.parse(JSON.stringify(initialLevel)));

  // Player state
  const playerRef = useRef({
    x: initialLevel.playerStart.x,
    y: initialLevel.playerStart.y,
    vx: 0,
    vy: 0,
    speed: 3.8,
    direction: 'right' as 'up' | 'down' | 'left' | 'right',
    isMoving: false,
    walkFrame: 0,
    width: 32,
    height: 48,
    targetX: null as number | null,
    targetY: null as number | null,
  });

  // Camera state
  const cameraRef = useRef({ x: 0, y: 0 });

  // Key tracking
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Active modals
  const [activeObstacle, setActiveObstacle] = useState<GameObstacle | null>(null);
  const [activeBoss, setActiveBoss] = useState<GameBoss | null>(null);
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);

  // HUD stats
  const [gemsCount, setGemsCount] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Nearby interactable obstacle
  const [nearbyObstacle, setNearbyObstacle] = useState<GameObstacle | null>(null);
  const [isNearBoss, setIsNearBoss] = useState<boolean>(false);
  const [isNearPortal, setIsNearPortal] = useState<boolean>(false);

  // Particles
  const particlesRef = useRef<Particle[]>([]);
  const ambientParticlesRef = useRef<
    { x: number; y: number; speed: number; size: number; char?: string; angle: number }[]
  >([]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize ambient particles (leaves / matrix / stars)
  useEffect(() => {
    const list = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      list.push({
        x: Math.random() * level.worldWidth,
        y: Math.random() * level.worldHeight,
        speed: 0.4 + Math.random() * 0.8,
        size: 2 + Math.random() * 3,
        char:
          level.theme.ambientEffect === 'matrix'
            ? ['0', '1', 'λ', '∑', '√', 'π'][Math.floor(Math.random() * 6)]
            : undefined,
        angle: Math.random() * Math.PI * 2,
      });
    }
    ambientParticlesRef.current = list;
  }, [level.worldWidth, level.worldHeight, level.theme.ambientEffect]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not move player if modal is active
      if (activeObstacle || activeBoss || isLevelCleared) return;

      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code] = true;

      // Interact trigger
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        e.preventDefault();
        triggerInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Spawn visual particle burst
  const spawnSparkles = (x: number, y: number, color: string, count: number = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 25,
      });
    }
  };

  // Interact with closest hotspot
  const triggerInteract = useCallback(() => {
    if (activeObstacle || activeBoss || isLevelCleared) return;

    if (nearbyObstacle) {
      GameAudio.playInteract();
      setActiveObstacle(nearbyObstacle);
    } else if (isNearBoss && level.boss && !level.boss.isDefeated) {
      GameAudio.playInteract();
      setActiveBoss(level.boss);
    } else if (isNearPortal && level.exitPortal.unlocked) {
      handleCompleteLevel();
    }
  }, [nearbyObstacle, isNearBoss, isNearPortal, level, activeObstacle, activeBoss, isLevelCleared]);

  // Handle Obstacle Solved Success
  const handleSolveObstacle = (obsId: string) => {
    setLevel((prevLevel) => {
      const nextLevel = { ...prevLevel };
      const obs = nextLevel.obstacles.find((o) => o.id === obsId);
      if (obs) {
        obs.isSolved = true;
        obs.blocksMovement = false;
        obs.animationProgress = 1;

        // Sparkles at obstacle location
        spawnSparkles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#10b981', 30);
      }

      // Check if all obstacles are solved; if so, trigger boss readiness
      const allSolved = nextLevel.obstacles.every((o) => o.isSolved);
      setSolvedCount(nextLevel.obstacles.filter((o) => o.isSolved).length);

      return nextLevel;
    });

    setActiveObstacle(null);
  };

  // Handle Boss Defeated
  const handleBossDefeated = () => {
    setLevel((prev) => {
      const next = { ...prev };
      if (next.boss) {
        next.boss.isDefeated = true;
        next.boss.currentHp = 0;
        spawnSparkles(next.boss.x, next.boss.y, '#f59e0b', 50);
      }
      next.exitPortal.unlocked = true;
      return next;
    });
    setActiveBoss(null);
  };

  // Complete level
  const handleCompleteLevel = () => {
    setIsLevelCleared(true);
    GameAudio.playLevelClear();
    const stats = {
      levelId: level.id,
      accuracy: 100,
      stars: 3,
      timeSeconds: elapsedSeconds,
      gems: gemsCount,
    };
    PlaceTrackStorage.saveGameProgress(level.id, {
      completed: true,
      stars: 3,
      highScore: gemsCount * 10 + 300,
      accuracy: 100,
    });
    onLevelComplete(stats);
  };

  // Virtual D-pad input handler
  const handleVirtualMove = (dir: 'up' | 'down' | 'left' | 'right' | 'stop') => {
    if (dir === 'stop') {
      keysRef.current['arrowup'] = false;
      keysRef.current['arrowdown'] = false;
      keysRef.current['arrowleft'] = false;
      keysRef.current['arrowright'] = false;
      keysRef.current['w'] = false;
      keysRef.current['s'] = false;
      keysRef.current['a'] = false;
      keysRef.current['d'] = false;
    } else {
      if (dir === 'up') keysRef.current['arrowup'] = true;
      if (dir === 'down') keysRef.current['arrowdown'] = true;
      if (dir === 'left') keysRef.current['arrowleft'] = true;
      if (dir === 'right') keysRef.current['arrowright'] = true;
    }
  };

  // Canvas click to move
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeObstacle || activeBoss || isLevelCleared) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + cameraRef.current.x;
    const clickY = e.clientY - rect.top + cameraRef.current.y;

    playerRef.current.targetX = clickX;
    playerRef.current.targetY = clickY;
  };

  // ----------------------------------------------------
  // MAIN ANIMATION & RENDERING LOOP
  // ----------------------------------------------------
  useEffect(() => {
    let animId: number;
    let lastStepTime = 0;

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p = playerRef.current;
      const keys = keysRef.current;

      // 1. Process movement inputs
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      // Mouse target pathfind
      if (p.targetX !== null && p.targetY !== null) {
        const toX = p.targetX - p.x;
        const toY = p.targetY - p.y;
        const dist = Math.hypot(toX, toY);
        if (dist > 8) {
          dx = toX / dist;
          dy = toY / dist;
        } else {
          p.targetX = null;
          p.targetY = null;
        }
      }

      // Normalize diagonal speed
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      // Update player facing direction
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) p.direction = 'right';
        else if (dx < 0) p.direction = 'left';
      } else if (Math.abs(dy) > 0) {
        if (dy > 0) p.direction = 'down';
        else if (dy < 0) p.direction = 'up';
      }

      p.isMoving = dx !== 0 || dy !== 0;
      if (p.isMoving) {
        p.walkFrame = (p.walkFrame + 0.18) % (Math.PI * 2);

        // Sound footstep occasionally
        if (time - lastStepTime > 320) {
          GameAudio.playStep();
          lastStepTime = time;
        }
      }

      // Calculate candidate next position
      const nextX = Math.max(20, Math.min(level.worldWidth - 20, p.x + dx * p.speed));
      const nextY = Math.max(60, Math.min(level.worldHeight - 60, p.y + dy * p.speed));

      // 2. Collision detection with blocking obstacles
      let canMoveX = true;
      let canMoveY = true;

      level.obstacles.forEach((obs) => {
        if (obs.blocksMovement && !obs.isSolved && obs.barrierBox) {
          const b = obs.barrierBox;
          // Check collision with barrier box
          if (
            nextX + p.width / 2 > b.x &&
            nextX - p.width / 2 < b.x + b.width &&
            p.y + p.height / 2 > b.y &&
            p.y - p.height / 2 < b.y + b.height
          ) {
            canMoveX = false;
          }
          if (
            p.x + p.width / 2 > b.x &&
            p.x - p.width / 2 < b.x + b.width &&
            nextY + p.height / 2 > b.y &&
            nextY - p.height / 2 < b.y + b.height
          ) {
            canMoveY = false;
          }
        }
      });

      if (canMoveX) p.x = nextX;
      if (canMoveY) p.y = nextY;

      // 3. Proximity detection for interactables
      let closestObs: GameObstacle | null = null;
      level.obstacles.forEach((obs) => {
        const dist = Math.hypot(p.x - (obs.x + obs.width / 2), p.y - (obs.y + obs.height / 2));
        if (dist <= obs.hitRadius) {
          closestObs = obs;
        }
      });
      setNearbyObstacle(closestObs);

      // Boss proximity
      if (level.boss && !level.boss.isDefeated) {
        const bDist = Math.hypot(p.x - level.boss.x, p.y - level.boss.y);
        setIsNearBoss(bDist < 130);
      } else {
        setIsNearBoss(false);
      }

      // Exit portal proximity
      const pDist = Math.hypot(p.x - level.exitPortal.x, p.y - level.exitPortal.y);
      setIsNearPortal(pDist < 100);

      // 4. Collectibles pickup
      level.collectibles.forEach((c) => {
        if (!c.isCollected) {
          const dist = Math.hypot(p.x - c.x, p.y - c.y);
          if (dist < 32) {
            c.isCollected = true;
            setGemsCount((prev) => prev + 1);
            GameAudio.playCoin();
            spawnSparkles(c.x, c.y, '#f59e0b', 14);
            PlaceTrackStorage.addXp(15, `game_gem_${c.id}`);
          }
        }
      });

      // 5. Update Camera (Smooth centering on player with boundaries)
      const viewportW = canvas.width;
      const viewportH = canvas.height;
      const targetCamX = Math.max(0, Math.min(level.worldWidth - viewportW, p.x - viewportW / 2));
      const targetCamY = Math.max(0, Math.min(level.worldHeight - viewportH, p.y - viewportH / 2));

      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1;

      const camX = cameraRef.current.x;
      const camY = cameraRef.current.y;

      // ====================================================
      // CANVAS RENDERING
      // ====================================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-camX, -camY);

      // Ground Background
      ctx.fillStyle = level.theme.groundColor;
      ctx.fillRect(0, 0, level.worldWidth, level.worldHeight);

      // World 1: River and Terrain
      if (level.worldId === 'math-adventure') {
        // Draw winding dirt pathway
        ctx.fillStyle = level.theme.pathColor;
        ctx.beginPath();
        ctx.rect(0, 400, level.worldWidth, 100);
        ctx.fill();

        // River at x = 440 to 530
        const riverX = 440;
        const riverW = 90;
        ctx.fillStyle = level.theme.waterOrVoidColor || '#38bdf8';
        ctx.fillRect(riverX, 0, riverW, level.worldHeight);

        // Animated river water waves
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        const waveOffset = (time * 0.003) % 40;
        for (let y = -20; y < level.worldHeight + 40; y += 30) {
          ctx.beginPath();
          ctx.moveTo(riverX, y + waveOffset);
          ctx.bezierCurveTo(
            riverX + 30,
            y + waveOffset + Math.sin(time * 0.004 + y) * 8,
            riverX + 60,
            y + waveOffset - Math.sin(time * 0.004 + y) * 8,
            riverX + riverW,
            y + waveOffset
          );
          ctx.stroke();
        }

        // River stone banks
        ctx.fillStyle = '#64748b';
        for (let y = 0; y < level.worldHeight; y += 35) {
          ctx.beginPath();
          ctx.arc(riverX, y, 6, 0, Math.PI * 2);
          ctx.arc(riverX + riverW, y + 10, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Decorative trees and shrubs
        ctx.fillStyle = '#059669';
        const trees = [
          { x: 180, y: 180 },
          { x: 320, y: 720 },
          { x: 700, y: 160 },
          { x: 1100, y: 720 },
          { x: 1400, y: 220 },
          { x: 1720, y: 760 },
          { x: 2000, y: 180 },
        ];
        trees.forEach((tr) => {
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.arc(tr.x - 8, tr.y - 8, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#059669';
        });
      }

      // World 2: Neon Grid Lines
      if (level.worldId === 'logic-quest') {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1;
        for (let x = 0; x < level.worldWidth; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, level.worldHeight);
          ctx.stroke();
        }
        for (let y = 0; y < level.worldHeight; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(level.worldWidth, y);
          ctx.stroke();
        }
        // Glowing cyber pathway
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(0, 390, level.worldWidth, 120);
      }

      // World 3: Space Station Parallax Starfield & Hull
      if (level.worldId === 'space-mission') {
        // Starfield
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 80; i++) {
          const sx = (i * 137.5) % level.worldWidth;
          const sy = (i * 93.2) % level.worldHeight;
          const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.002 + i));
          ctx.globalAlpha = alpha;
          ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
        }
        ctx.globalAlpha = 1.0;

        // Space Station Walkway Deck
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 380, level.worldWidth, 140);
        // Hazard safety borders
        ctx.fillStyle = '#f59e0b';
        for (let x = 0; x < level.worldWidth; x += 40) {
          ctx.fillRect(x, 375, 20, 5);
          ctx.fillRect(x, 520, 20, 5);
        }
      }

      // 6. Draw Obstacles & Interactive Mechanisms
      level.obstacles.forEach((obs) => {
        ctx.save();

        if (obs.type === 'bridge') {
          // Suspension Bridge across the river
          const bx = obs.x;
          const by = obs.y;
          const bw = obs.width;
          const bh = obs.height;

          // Bridge ropes / railings
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(bx - 10, by);
          ctx.lineTo(bx + bw + 10, by);
          ctx.moveTo(bx - 10, by + bh);
          ctx.lineTo(bx + bw + 10, by + bh);
          ctx.stroke();

          // Wooden Planks
          if (obs.isSolved) {
            // Lowered aligned wooden planks
            ctx.fillStyle = '#b45309';
            for (let px = bx; px < bx + bw; px += 16) {
              ctx.fillRect(px, by + 4, 12, bh - 8);
              ctx.fillStyle = '#92400e';
              ctx.fillRect(px + 2, by + 6, 2, bh - 12);
              ctx.fillStyle = '#b45309';
            }
          } else {
            // Broken broken planks fallen in water
            ctx.fillStyle = '#78350f';
            ctx.fillRect(bx, by + 6, 20, bh - 12);
            ctx.fillRect(bx + bw - 20, by + 6, 20, bh - 12);

            // Warning holographic tape
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(bx, by, bw, bh);
            ctx.setLineDash([]);
          }
        } else if (obs.type === 'machine') {
          // Clockwork Gear Machine
          const mx = obs.x + obs.width / 2;
          const my = obs.y + obs.height / 2;

          // Machine Base
          ctx.fillStyle = '#475569';
          ctx.fillRect(obs.x, obs.y + 30, obs.width, obs.height - 30);

          // Rotating Steampunk Brass Gears
          const gearAngle = obs.isSolved ? time * 0.004 : 0;
          ctx.save();
          ctx.translate(mx - 20, my - 10);
          ctx.rotate(gearAngle);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();
          // Gear teeth
          for (let g = 0; g < 8; g++) {
            ctx.rotate((Math.PI * 2) / 8);
            ctx.fillRect(-4, -28, 8, 8);
          }
          ctx.restore();

          // Steam puffs if solved
          if (obs.isSolved) {
            ctx.fillStyle = 'rgba(241, 245, 249, 0.6)';
            const puffY = obs.y - (time * 0.04) % 30;
            ctx.beginPath();
            ctx.arc(obs.x + 30, puffY, 10, 0, Math.PI * 2);
            ctx.arc(obs.x + 50, puffY - 10, 14, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (obs.type === 'chest') {
          // Gilded Treasure Vault
          const cx = obs.x;
          const cy = obs.y;
          ctx.fillStyle = '#d97706';
          ctx.fillRect(cx, cy + 20, obs.width, obs.height - 20);

          // Lid
          ctx.fillStyle = '#f59e0b';
          if (obs.isSolved) {
            // Open lid tilted back
            ctx.fillRect(cx - 5, cy + 5, obs.width + 10, 16);
            // Golden glow
            ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.beginPath();
            ctx.arc(cx + obs.width / 2, cy + 10, 30, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Closed chest lid with iron band
            ctx.fillRect(cx, cy + 10, obs.width, 16);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(cx + obs.width / 2 - 4, cy + 18, 8, 12);
          }
        } else if (obs.type === 'gate') {
          // Portcullis Gate
          const gx = obs.x;
          const gy = obs.y;
          const gw = obs.width;
          const gh = obs.height;

          // Stone arch pillars
          ctx.fillStyle = '#334155';
          ctx.fillRect(gx - 15, gy - 20, 20, gh + 40);
          ctx.fillRect(gx + gw - 5, gy - 20, 20, gh + 40);
          ctx.fillRect(gx - 15, gy - 30, gw + 30, 20);

          // Portcullis iron bars
          const barLift = obs.isSolved ? gh - 15 : 0;
          ctx.fillStyle = '#64748b';
          for (let bx = gx + 6; bx < gx + gw - 6; bx += 14) {
            ctx.fillRect(bx, gy - barLift, 4, gh);
          }
        } else if (obs.type === 'terminal' || obs.type === 'barrier') {
          // Futuristic Terminal or Forcefield
          const tx = obs.x;
          const ty = obs.y;
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(tx, ty + 20, obs.width, obs.height - 20);

          // Glowing Screen
          ctx.fillStyle = obs.isSolved ? '#10b981' : '#38bdf8';
          ctx.fillRect(tx + 10, ty + 28, obs.width - 20, 45);

          // Holographic glyph
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.isSolved ? '✓ ONLINE' : 'LOCKED', tx + obs.width / 2, ty + 56);
        } else if (obs.type === 'cauldron') {
          // Alchemist Cauldron
          const cx = obs.x + obs.width / 2;
          const cy = obs.y + obs.height / 2;
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(cx, cy + 10, 32, 0, Math.PI * 2);
          ctx.fill();
          // Bubbling elixir
          ctx.fillStyle = obs.isSolved ? '#10b981' : '#a855f7';
          ctx.beginPath();
          ctx.ellipse(cx, cy - 8, 26, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hotspot Highlight Ring
        const hx = obs.x + obs.width / 2;
        const hy = obs.y + obs.height / 2;
        const isNearby = nearbyObstacle?.id === obs.id;

        ctx.strokeStyle = obs.isSolved
          ? 'rgba(16, 185, 129, 0.6)'
          : isNearby
          ? '#6366f1'
          : 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = isNearby ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(hx, hy, obs.hitRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Label above obstacle
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obs.label, hx, obs.y - 12);

        // Topic badge
        ctx.fillStyle = obs.isSolved ? '#059669' : '#4f46e5';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(obs.isSolved ? '✓ SOLVED' : `[${obs.requiredTopic}]`, hx, obs.y + obs.height + 16);

        ctx.restore();
      });

      // 7. Draw Collectibles (Gems & Stars)
      level.collectibles.forEach((c) => {
        if (!c.isCollected) {
          ctx.save();
          const bob = Math.sin(time * 0.005 + c.animationAngle) * 6;
          ctx.translate(c.x, c.y + bob);

          if (c.type === 'gem') {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 12);
            ctx.lineTo(-10, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else if (c.type === 'star') {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.stroke();
          } else {
            // Energy Cell
            ctx.fillStyle = '#10b981';
            ctx.fillRect(-6, -10, 12, 20);
            ctx.fillStyle = '#34d399';
            ctx.fillRect(-3, -7, 6, 14);
          }
          ctx.restore();
        }
      });

      // 8. Draw Guardian Boss
      if (level.boss) {
        const b = level.boss;
        ctx.save();
        ctx.translate(b.x, b.y);

        // Boss Aura / Shadow
        ctx.fillStyle = b.isDefeated ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 35, 45, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Boss Body
        const bossFloat = Math.sin(time * 0.003) * 6;
        ctx.translate(0, bossFloat);

        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.avatar, 0, 0);

        // Name & Health bar above Boss
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(b.name, 0, -42);

        // Health bar
        const barW = 70;
        const barH = 7;
        ctx.fillStyle = '#334155';
        ctx.fillRect(-barW / 2, -32, barW, barH);
        ctx.fillStyle = b.isDefeated ? '#10b981' : '#ef4444';
        ctx.fillRect(-barW / 2, -32, barW * (b.currentHp / b.maxHp), barH);

        ctx.restore();
      }

      // 9. Draw Exit Portal
      const portal = level.exitPortal;
      ctx.save();
      ctx.translate(portal.x, portal.y);
      const portalRot = time * 0.003;
      ctx.rotate(portalRot);

      // Swirling Portal Ring
      ctx.strokeStyle = portal.unlocked ? '#10b981' : '#64748b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = portal.unlocked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(100, 116, 139, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = portal.unlocked ? '#059669' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(
        portal.unlocked ? '★ ENTER PORTAL' : 'LOCKED (Defeat Boss)',
        portal.x,
        portal.y + 54
      );

      // 10. Draw Player Character (Custom Animated Canvas Sprite)
      ctx.save();
      ctx.translate(p.x, p.y);

      // Player Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking Leg Oscillation
      const legOffset = p.isMoving ? Math.sin(p.walkFrame) * 7 : 0;
      const legBob = p.isMoving ? Math.abs(Math.sin(p.walkFrame)) * 2 : 0;

      // Legs / Shoes
      ctx.fillStyle = level.worldId === 'space-mission' ? '#94a3b8' : '#1e293b';
      // Left leg
      ctx.fillRect(-8, 8 - legBob, 6, 12 + legOffset);
      // Right leg
      ctx.fillRect(2, 8 - legBob, 6, 12 - legOffset);

      // Torso / Jacket
      if (level.worldId === 'space-mission') {
        // Astronaut Suit
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-10, -10 - legBob, 20, 20);
        // Life support chest console
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-4, -6 - legBob, 8, 8);
      } else if (level.worldId === 'logic-quest') {
        // Cyber Explorer
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, -10 - legBob, 20, 20);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-8, -8 - legBob, 16, 4);
      } else {
        // Math Adventurer Jacket
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(-10, -10 - legBob, 20, 20);
        // Belt
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-10, 6 - legBob, 20, 4);
        // Backpack
        ctx.fillStyle = '#78350f';
        ctx.fillRect(p.direction === 'right' ? -14 : 6, -8 - legBob, 6, 14);
      }

      // Head
      ctx.fillStyle = '#fed7aa'; // skin tone
      if (level.worldId === 'space-mission') {
        // Space Helmet
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -18 - legBob, 13, 0, Math.PI * 2);
        ctx.fill();
        // Gold reflective visor
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        const visorX = p.direction === 'left' ? -4 : p.direction === 'right' ? 4 : 0;
        ctx.arc(visorX, -18 - legBob, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, -18 - legBob, 11, 0, Math.PI * 2);
        ctx.fill();

        // Hair / Cap
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.arc(0, -22 - legBob, 11, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#0f172a';
        if (p.direction === 'right') {
          ctx.fillRect(2, -20 - legBob, 2.5, 3.5);
        } else if (p.direction === 'left') {
          ctx.fillRect(-4.5, -20 - legBob, 2.5, 3.5);
        } else if (p.direction === 'down') {
          ctx.fillRect(-4, -19 - legBob, 2.5, 3.5);
          ctx.fillRect(2, -19 - legBob, 2.5, 3.5);
        }
      }

      // 11. Emote bubble if near interactable
      if (nearbyObstacle || isNearBoss || (isNearPortal && portal.unlocked)) {
        ctx.save();
        const bubbleBounce = Math.sin(time * 0.008) * 3;
        ctx.translate(0, -42 + bubbleBounce);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-42, -14, 84, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#4f46e5';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Press [E] Interact', 0, -3);
        ctx.restore();
      }

      ctx.restore();

      // 12. Particles Update & Render
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        pt.alpha = 1 - pt.life / pt.maxLife;

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();

        if (pt.life >= pt.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1.0;

      // 13. Ambient Drift Particles (Leaves, Matrix, Stars)
      if (!reducedMotion) {
        ambientParticlesRef.current.forEach((ap) => {
          ap.y += ap.speed;
          if (ap.y > level.worldHeight) {
            ap.y = -10;
            ap.x = Math.random() * level.worldWidth;
          }
          ctx.save();
          if (ap.char) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.font = `${ap.size * 3}px monospace`;
            ctx.fillText(ap.char, ap.x, ap.y);
          } else {
            ctx.fillStyle =
              level.theme.ambientEffect === 'leaves'
                ? 'rgba(16, 185, 129, 0.5)'
                : 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      ctx.restore(); // Restore camera translation

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [level, nearbyObstacle, isNearBoss, isNearPortal, reducedMotion]);

  // Window Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none">
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="block w-full h-full cursor-crosshair"
      />

      {/* Game HUD Overlay */}
      <GameHUD
        level={level}
        solvedCount={solvedCount}
        totalObstacles={level.obstacles.length}
        gemsCount={gemsCount}
        elapsedSeconds={elapsedSeconds}
        isBossActive={isNearBoss}
        isBossDefeated={level.boss ? level.boss.isDefeated : false}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        onExitGame={onExitGame}
        onVirtualMove={handleVirtualMove}
        onVirtualInteract={triggerInteract}
      />

      {/* Puzzle Modal */}
      {activeObstacle && (
        <GamePuzzleModal
          obstacle={activeObstacle}
          onSolveSuccess={handleSolveObstacle}
          onClose={() => setActiveObstacle(null)}
        />
      )}

      {/* Boss Modal */}
      {activeBoss && (
        <GameBossModal
          boss={activeBoss}
          onBossDefeated={handleBossDefeated}
          onClose={() => setActiveBoss(null)}
        />
      )}
    </div>
  );
};
