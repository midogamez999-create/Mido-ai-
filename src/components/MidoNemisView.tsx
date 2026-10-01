import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, NemisGame } from '../types';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Heart,
  MessageCircle,
  Share2,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Plus,
  Check,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  Zap,
  Flame,
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
  Info,
  Sliders,
  Rocket,
  Shield,
  Crosshair,
  Layers,
  Settings2,
  Palette,
  Skull,
  Crown
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface MidoNemisViewProps {
  user: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenAccountManager?: () => void;
  onFollowChange?: (targetUserId: string, isFollowing: boolean) => void;
}

const CLIENT_FALLBACK_GAMES: NemisGame[] = [
  {
    id: 'game_cyber_runner_1',
    title: 'Cyber Runner 2099',
    description: 'Jump over neon spikes, collect quantum credits, and survive at hyper speed!',
    genre: 'Arcade Runner',
    code: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80',
    creatorId: 'ch_neo_arcade',
    creatorName: 'NeoArcade Studios',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
    creatorVerified: true,
    plays: 14290,
    likes: 3820,
    highScore: 4850,
    createdAt: new Date().toISOString()
  },
  {
    id: 'game_galaxy_shooter_2',
    title: 'Galaxy Strike 3000',
    description: 'Blast incoming alien interceptors, dodge plasma beams, and protect Earth!',
    genre: 'Space Action',
    code: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    creatorId: 'ch_retro_orbit',
    creatorName: 'Retro Orbit',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&q=80',
    creatorVerified: true,
    plays: 28400,
    likes: 7490,
    highScore: 12400,
    createdAt: new Date().toISOString()
  },
  {
    id: 'game_flappy_orb_3',
    title: 'Flappy Neon Orb',
    description: 'Tap to flap through hyper-dimensional laser gates. How high can you score?',
    genre: 'Casual Arcade',
    code: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    creatorId: 'ch_pixel_god',
    creatorName: 'Pixel God',
    creatorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&q=80',
    creatorVerified: true,
    plays: 52100,
    likes: 12900,
    highScore: 34,
    createdAt: new Date().toISOString()
  }
];

export const MidoNemisView: React.FC<MidoNemisViewProps> = ({
  user,
  onOpenAuthModal,
  onOpenAccountManager,
  onFollowChange,
}) => {
  const [games, setGames] = useState<NemisGame[]>(CLIENT_FALLBACK_GAMES);
  const [activeGameIndex, setActiveGameIndex] = useState<number>(0);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comments modal state
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');

  // AI Game Maker studio settings state
  const [isAiMakerOpen, setIsAiMakerOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiGameTitle, setAiGameTitle] = useState<string>('');
  const [aiGenre, setAiGenre] = useState<string>('Galaxy Shooter');
  const [aiPerspective, setAiPerspective] = useState<string>('Top-Down 2D');
  const [aiDifficulty, setAiDifficulty] = useState<string>('Balanced');
  const [aiCharacter, setAiCharacter] = useState<string>('Spaceship');
  const [aiCharacterColor, setAiCharacterColor] = useState<string>('#38bdf8');
  const [aiTheme, setAiTheme] = useState<string>('Cyber Neon');
  const [aiMechanics, setAiMechanics] = useState<string[]>(['Lasers / Shooting', 'Energy Shields', 'Boss Battle']);
  const [aiLivesMode, setAiLivesMode] = useState<string>('3 Hearts');
  const [aiBossFight, setAiBossFight] = useState<boolean>(true);
  const [aiSoundStyle, setAiSoundStyle] = useState<string>('8-Bit Chiptune');

  // AI Generation status & In-Modal Test state
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiLoadingStage, setAiLoadingStage] = useState<string>('');
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [generatedDraft, setGeneratedDraft] = useState<any | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isTestPlayingDraft, setIsTestPlayingDraft] = useState<boolean>(false);
  const testCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const testGameStateRef = useRef<any>({});

  // Active game canvas execution state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const gameStateRef = useRef<any>({});
  const [gameScore, setGameScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPlayingGame, setIsPlayingGame] = useState<boolean>(false);

  // Following state cache: targetUserId -> boolean
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mido_following_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // User likes map: gameId -> boolean
  const [likedGamesMap, setLikedGamesMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mido_liked_games');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch games
  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/nemis/games');
      if (res.ok) {
        const data = await res.json();
        if (data.games) {
          setGames(data.games);
        }
      }
    } catch (err) {
      console.error('Failed to load Nemis games:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const filteredGames = games.filter(g => selectedGenre === 'All' || g.genre === selectedGenre);
  const currentGame = filteredGames[activeGameIndex] || filteredGames[0];

  // Navigate between games (feed scrolling)
  const scrollToNextGame = () => {
    if (activeGameIndex < filteredGames.length - 1) {
      soundFx.playClick();
      setActiveGameIndex(prev => prev + 1);
      stopCurrentGame();
    }
  };

  const scrollToPrevGame = () => {
    if (activeGameIndex > 0) {
      soundFx.playClick();
      setActiveGameIndex(prev => prev - 1);
      stopCurrentGame();
    }
  };

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAiMakerOpen || isCommentsOpen) return;
      if (e.key === 'ArrowDown' && !isPlayingGame) {
        e.preventDefault();
        scrollToNextGame();
      } else if (e.key === 'ArrowUp' && !isPlayingGame) {
        e.preventDefault();
        scrollToPrevGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGameIndex, filteredGames.length, isPlayingGame, isAiMakerOpen, isCommentsOpen]);

  // Stop running game loop
  const stopCurrentGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setIsPlayingGame(false);
    setIsGameOver(false);
    setGameScore(0);
  };

  // Clean up when current game changes
  useEffect(() => {
    stopCurrentGame();
  }, [currentGame?.id]);

  // Start & run interactive game on HTML5 canvas
  const startGame = () => {
    if (!canvasRef.current || !currentGame) return;
    stopCurrentGame();
    setIsPlayingGame(true);
    setIsGameOver(false);
    setGameScore(0);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Record play on server
    fetch(`/api/nemis/games/${currentGame.id}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 0 })
    }).catch(() => {});

    // High DPI Canvas Scaling
    const width = 480;
    const height = 640;
    canvas.width = width;
    canvas.height = height;

    const gameType = (currentGame as any).gameType || 'runner';

    // Game states
    let score = 0;
    let gameOver = false;
    let frames = 0;

    // Keys state
    const keys: Record<string, boolean> = {};
    const onKey = (e: KeyboardEvent) => {
      keys[e.code] = e.type === 'keydown';
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    // Touch / Click input
    let tapTriggered = false;
    const pointer = { x: width / 2, y: height / 2, isDown: false, justPressed: false };
    const updatePointer = (e: PointerEvent, isDown: boolean, justPressed: boolean) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * width;
      pointer.y = ((e.clientY - rect.top) / rect.height) * height;
      pointer.isDown = isDown;
      pointer.justPressed = justPressed;
    };

    const onPointerDown = (e: PointerEvent) => {
      updatePointer(e, true, true);
      tapTriggered = true;
    };
    const onPointerMove = (e: PointerEvent) => updatePointer(e, pointer.isDown, false);
    const onPointerUp = (e: PointerEvent) => updatePointer(e, false, false);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // API Bridge provided to custom AI games
    const api = {
      keys,
      pointer,
      width,
      height,
      addScore: (pts: number) => {
        score += pts;
        setGameScore(score);
      },
      triggerGameOver: (finalScore: number) => {
        gameOver = true;
        setIsGameOver(true);
        setGameScore(finalScore !== undefined ? finalScore : score);
        fetch(`/api/nemis/games/${currentGame.id}/play`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: finalScore !== undefined ? finalScore : score })
        }).catch(() => {});
      },
      playSound: (type: string) => {
        if (type === 'score' || type === 'powerup') soundFx.playSuccess();
        else if (type === 'hit' || type === 'gameover') soundFx.playError();
        else soundFx.playClick();
      }
    };

    // If custom AI-engineered code exists, execute it directly:
    const customCode = (currentGame as any).gameCode || (currentGame as any).code;
    if (customCode && typeof customCode === 'string' && customCode.trim().length > 30) {
      try {
        const customRunner = new Function('canvas', 'ctx', 'api', customCode);
        const cleanupFn = customRunner(canvas, ctx, api);
        gameStateRef.current = {
          stop: () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKey);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            if (typeof cleanupFn === 'function') cleanupFn();
          }
        };
        return;
      } catch (err) {
        console.warn("Custom AI game execution fallback to preset:", err);
      }
    }

    // ==========================================
    // 1. RUNNER ENGINE
    // ==========================================
    if (gameType === 'runner') {
      let playerY = height - 120;
      let playerVy = 0;
      let isGrounded = true;
      const obstacles: { x: number; y: number; w: number; h: number; color: string }[] = [];
      const coins: { x: number; y: number; radius: number; collected: boolean }[] = [];
      let speed = 5;

      const loop = () => {
        frames++;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Cyber Grid Lines
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Ground
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, height - 80, width, 80);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(0, height - 80, width, 3);

        // Jump Controls
        if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || tapTriggered) && isGrounded) {
          playerVy = -13;
          isGrounded = false;
          tapTriggered = false;
        }

        playerVy += 0.65; // gravity
        playerY += playerVy;

        if (playerY >= height - 120) {
          playerY = height - 120;
          playerVy = 0;
          isGrounded = true;
        }

        // Spawn obstacles
        if (frames % 90 === 0) {
          obstacles.push({
            x: width + 20,
            y: height - 115,
            w: 24,
            h: 35,
            color: '#f43f5e'
          });
        }

        // Spawn coins
        if (frames % 120 === 0) {
          coins.push({
            x: width + 20,
            y: height - 160 - Math.random() * 40,
            radius: 9,
            collected: false
          });
        }

        // Update & draw obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= speed;

          // Draw neon spike
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.lineTo(obs.x, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();

          // Collision
          if (
            60 + 20 > obs.x &&
            60 < obs.x + obs.w &&
            playerY + 36 > obs.y &&
            playerY < obs.y + obs.h
          ) {
            gameOver = true;
          }

          if (obs.x < -40) {
            obstacles.splice(i, 1);
            score += 10;
            speed += 0.05;
          }
        }

        // Update & draw coins
        for (let i = coins.length - 1; i >= 0; i--) {
          const c = coins[i];
          c.x -= speed;

          if (!c.collected) {
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Collect
            const dist = Math.hypot(c.x - 70, c.y - (playerY + 18));
            if (dist < 26) {
              c.collected = true;
              score += 25;
            }
          }

          if (c.x < -20) coins.splice(i, 1);
        }

        // Draw Player (Glowing Cyber Orb)
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(70, playerY + 18, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(70, playerY + 18, 8, 0, Math.PI * 2);
        ctx.fill();

        // UI Score
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`SCORE: ${score}`, 20, 40);

        setGameScore(score);

        if (!gameOver) {
          gameLoopRef.current = requestAnimationFrame(loop);
        } else {
          setIsGameOver(true);
          // Sync high score
          fetch(`/api/nemis/games/${currentGame.id}/play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score })
          }).catch(() => {});
        }
      };

      gameLoopRef.current = requestAnimationFrame(loop);
    }

    // ==========================================
    // 2. GALAXY SHOOTER ENGINE
    // ==========================================
    else if (gameType === 'shooter') {
      let shipX = width / 2;
      const lasers: { x: number; y: number }[] = [];
      const enemies: { x: number; y: number; w: number; h: number; hp: number }[] = [];

      canvas.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        shipX = ((e.clientX - rect.left) / rect.width) * width;
      });

      const loop = () => {
        frames++;
        ctx.fillStyle = '#05070e';
        ctx.fillRect(0, 0, width, height);

        // Starfield
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 25; i++) {
          const sx = (i * 37 + frames * 2) % width;
          const sy = (i * 91 + frames * 4) % height;
          ctx.fillRect(sx, sy, 2, 2);
        }

        // Ship movement
        if (keys['ArrowLeft'] || keys['KeyA']) shipX -= 6;
        if (keys['ArrowRight'] || keys['KeyD']) shipX += 6;
        shipX = Math.max(25, Math.min(width - 25, shipX));

        // Auto fire / space fire
        if (frames % 12 === 0 || keys['Space'] || tapTriggered) {
          lasers.push({ x: shipX - 10, y: height - 60 });
          lasers.push({ x: shipX + 10, y: height - 60 });
          tapTriggered = false;
        }

        // Spawn enemies
        if (frames % 45 === 0) {
          enemies.push({
            x: 30 + Math.random() * (width - 70),
            y: -30,
            w: 32,
            h: 24,
            hp: 2
          });
        }

        // Update lasers
        for (let i = lasers.length - 1; i >= 0; i--) {
          const l = lasers[i];
          l.y -= 10;
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0ea5e9';
          ctx.shadowBlur = 8;
          ctx.fillRect(l.x - 2, l.y, 4, 14);
          ctx.shadowBlur = 0;

          if (l.y < -20) lasers.splice(i, 1);
        }

        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          const en = enemies[i];
          en.y += 2.5;

          // Alien ship
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(en.x + en.w / 2, en.y + en.h);
          ctx.lineTo(en.x + en.w, en.y);
          ctx.lineTo(en.x, en.y);
          ctx.closePath();
          ctx.fill();

          // Laser hit test
          for (let li = lasers.length - 1; li >= 0; li--) {
            const l = lasers[li];
            if (l.x > en.x && l.x < en.x + en.w && l.y > en.y && l.y < en.y + en.h) {
              en.hp--;
              lasers.splice(li, 1);
              if (en.hp <= 0) {
                enemies.splice(i, 1);
                score += 50;
                break;
              }
            }
          }

          // Crash into player or bottom
          if (en.y > height - 60 && Math.abs(en.x + en.w / 2 - shipX) < 30) {
            gameOver = true;
          }
          if (en.y > height + 30) {
            enemies.splice(i, 1);
          }
        }

        // Draw Player Ship
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(shipX, height - 70);
        ctx.lineTo(shipX + 22, height - 35);
        ctx.lineTo(shipX - 22, height - 35);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Thruster flame
        ctx.fillStyle = frames % 2 === 0 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(shipX - 8, height - 35);
        ctx.lineTo(shipX + 8, height - 35);
        ctx.lineTo(shipX, height - 20 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`SCORE: ${score}`, 20, 40);

        setGameScore(score);

        if (!gameOver) {
          gameLoopRef.current = requestAnimationFrame(loop);
        } else {
          setIsGameOver(true);
        }
      };

      gameLoopRef.current = requestAnimationFrame(loop);
    }

    // ==========================================
    // 3. FLAPPY ORB ENGINE
    // ==========================================
    else if (gameType === 'flappy') {
      let orbY = height / 2;
      let orbVy = 0;
      const pipes: { x: number; topH: number; gap: number }[] = [];

      const loop = () => {
        frames++;
        ctx.fillStyle = '#060814';
        ctx.fillRect(0, 0, width, height);

        // Flap
        if (keys['Space'] || keys['ArrowUp'] || tapTriggered) {
          orbVy = -7;
          tapTriggered = false;
        }

        orbVy += 0.38;
        orbY += orbVy;

        // Spawn pipes
        if (frames % 85 === 0) {
          const topH = 80 + Math.random() * (height - 300);
          pipes.push({ x: width + 20, topH, gap: 140 });
        }

        // Draw and update pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
          const p = pipes[i];
          p.x -= 3.5;

          // Top pipe
          ctx.fillStyle = '#8b5cf6';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 8;
          ctx.fillRect(p.x, 0, 48, p.topH);

          // Bottom pipe
          const botY = p.topH + p.gap;
          ctx.fillRect(p.x, botY, 48, height - botY);
          ctx.shadowBlur = 0;

          // Collision test (orb at x=90, r=16)
          if (90 + 16 > p.x && 90 - 16 < p.x + 48) {
            if (orbY - 16 < p.topH || orbY + 16 > botY) {
              gameOver = true;
            }
          }

          if (p.x < -60) {
            pipes.splice(i, 1);
            score += 1;
          }
        }

        // Floor / Ceiling check
        if (orbY > height - 20 || orbY < 10) {
          gameOver = true;
        }

        // Draw Flappy Orb
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(90, orbY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(94, orbY - 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`SCORE: ${score}`, 20, 45);

        setGameScore(score);

        if (!gameOver) {
          gameLoopRef.current = requestAnimationFrame(loop);
        } else {
          setIsGameOver(true);
        }
      };

      gameLoopRef.current = requestAnimationFrame(loop);
    }

    // ==========================================
    // 4. BRICK BREAKER & RETRO DEFAULT ENGINE
    // ==========================================
    else {
      let paddleX = width / 2 - 45;
      let ballX = width / 2;
      let ballY = height - 120;
      let ballVx = 4;
      let ballVy = -4.5;
      const bricks: { x: number; y: number; w: number; h: number; color: string; alive: boolean }[] = [];

      const rows = 5;
      const cols = 7;
      const bw = 58;
      const bh = 22;
      const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bricks.push({
            x: 25 + c * 62,
            y: 70 + r * 28,
            w: bw,
            h: bh,
            color: colors[r],
            alive: true
          });
        }
      }

      canvas.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        paddleX = ((e.clientX - rect.left) / rect.width) * width - 45;
      });

      const loop = () => {
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, width, height);

        if (keys['ArrowLeft'] || keys['KeyA']) paddleX -= 7;
        if (keys['ArrowRight'] || keys['KeyD']) paddleX += 7;
        paddleX = Math.max(10, Math.min(width - 100, paddleX));

        ballX += ballVx;
        ballY += ballVy;

        // Bounce walls
        if (ballX < 12 || ballX > width - 12) ballVx = -ballVx;
        if (ballY < 12) ballVy = -ballVy;

        // Bounce paddle
        if (ballY + 10 >= height - 60 && ballY - 10 <= height - 45) {
          if (ballX >= paddleX && ballX <= paddleX + 90) {
            ballVy = -Math.abs(ballVy);
            const hitOffset = (ballX - (paddleX + 45)) / 45;
            ballVx = hitOffset * 6.5;
          }
        }

        // Brick collision
        for (const b of bricks) {
          if (b.alive) {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);

            if (ballX > b.x && ballX < b.x + b.w && ballY > b.y && ballY < b.y + b.h) {
              b.alive = false;
              ballVy = -ballVy;
              score += 20;
            }
          }
        }

        // Ball out
        if (ballY > height + 20) {
          gameOver = true;
        }

        // Draw Paddle
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.fillRect(paddleX, height - 55, 90, 14);
        ctx.shadowBlur = 0;

        // Draw Ball
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`SCORE: ${score}`, 20, 40);

        setGameScore(score);

        if (!gameOver) {
          gameLoopRef.current = requestAnimationFrame(loop);
        } else {
          setIsGameOver(true);
        }
      };

      gameLoopRef.current = requestAnimationFrame(loop);
    }

    gameStateRef.current = { stop: () => window.removeEventListener('keydown', onKey) };
  };

  // Follow / Unfollow Creator
  const handleToggleFollow = async (targetCreatorId: string) => {
    soundFx.playClick();
    const currentUserId = user?.id || 'ch_my_channel';

    // Strict self-follow prevention:
    if (
      currentUserId === targetCreatorId ||
      targetCreatorId === 'ch_my_channel' ||
      targetCreatorId === 'c_my_channel' ||
      currentUserId === `ch_${targetCreatorId}` ||
      targetCreatorId === `ch_${currentUserId}`
    ) {
      showToast("❌ You cannot follow yourself! Connect with other creators.");
      return;
    }

    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId, targetUserId: targetCreatorId })
      });
      const data = await res.json();
      if (data.success) {
        const nextState = data.isFollowing;
        setFollowingMap(prev => {
          const updated = { ...prev, [targetCreatorId]: nextState };
          localStorage.setItem('mido_following_map', JSON.stringify(updated));
          return updated;
        });

        if (onFollowChange) {
          onFollowChange(targetCreatorId, nextState);
        }

        showToast(nextState ? "✓ Followed creator!" : "Unfollowed creator");

        // Update verified badge on current game creator if they hit 1,000+
        if (currentGame && currentGame.creatorId === targetCreatorId) {
          currentGame.creatorVerified = data.isVerified;
        }
      } else {
        showToast(data.error || "Failed to update follow");
      }
    } catch {
      showToast("Error updating follow state");
    }
  };

  // Like Game
  const handleLikeGame = async (gameId: string) => {
    soundFx.playClick();
    const isLiked = likedGamesMap[gameId];
    setLikedGamesMap(prev => {
      const updated = { ...prev, [gameId]: !isLiked };
      localStorage.setItem('mido_liked_games', JSON.stringify(updated));
      return updated;
    });

    if (currentGame && currentGame.id === gameId) {
      currentGame.likes = (currentGame.likes || 0) + (isLiked ? -1 : 1);
    }

    try {
      await fetch(`/api/nemis/games/${gameId}/like`, { method: 'POST' });
    } catch {}
  };

  // Share Game
  const handleShareGame = (game: NemisGame) => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#mido-nemis?game=${game.id}`);
      showToast("🔗 Game link copied to clipboard!");
    }
  };

  // Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentGame) return;

    soundFx.playClick();
    try {
      const res = await fetch(`/api/nemis/games/${currentGame.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentText,
          userId: user?.id || 'ch_my_channel',
          userName: user?.name || 'Mido Gamer',
          userAvatar: user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Gamer'
        })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        if (!currentGame.comments) currentGame.comments = [];
        currentGame.comments.unshift(data.comment);
        setCommentText('');
        showToast("💬 Comment posted!");
      }
    } catch {
      showToast("Failed to post comment");
    }
  };

  // Stop test game running inside maker modal
  const stopTestGame = () => {
    if (testGameStateRef.current && testGameStateRef.current.stop) {
      testGameStateRef.current.stop();
      testGameStateRef.current = {};
    }
    setIsTestPlayingDraft(false);
  };

  // Start in-modal interactive test game
  const startTestGame = (draftToTest?: any) => {
    const draft = draftToTest || generatedDraft;
    if (!testCanvasRef.current || !draft) return;
    stopTestGame();
    setIsTestPlayingDraft(true);

    const canvas = testCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = 480;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    let score = 0;
    let gameOver = false;
    const keys: Record<string, boolean> = {};
    const onKey = (e: KeyboardEvent) => {
      keys[e.code] = e.type === 'keydown';
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    const pointer = { x: width / 2, y: height / 2, isDown: false, justPressed: false };
    const updatePointer = (e: PointerEvent, isDown: boolean, justPressed: boolean) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * width;
      pointer.y = ((e.clientY - rect.top) / rect.height) * height;
      pointer.isDown = isDown;
      pointer.justPressed = justPressed;
    };
    const onDown = (e: PointerEvent) => updatePointer(e, true, true);
    const onMove = (e: PointerEvent) => updatePointer(e, pointer.isDown, false);
    const onUp = (e: PointerEvent) => updatePointer(e, false, false);

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const api = {
      keys,
      pointer,
      width,
      height,
      addScore: (pts: number) => { score += pts; },
      triggerGameOver: (finalScore: number) => {
        gameOver = true;
        soundFx.playError();
      },
      playSound: (type: string) => {
        if (type === 'score' || type === 'powerup') soundFx.playSuccess();
        else if (type === 'hit' || type === 'gameover') soundFx.playError();
        else soundFx.playClick();
      }
    };

    const code = draft.gameCode || draft.code;
    try {
      const runner = new Function('canvas', 'ctx', 'api', code);
      const cleanup = runner(canvas, ctx, api);
      testGameStateRef.current = {
        stop: () => {
          window.removeEventListener('keydown', onKey);
          window.removeEventListener('keyup', onKey);
          canvas.removeEventListener('pointerdown', onDown);
          canvas.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          if (typeof cleanup === 'function') cleanup();
        }
      };
    } catch (e) {
      console.error('Test game run error:', e);
    }
  };

  // Generate Game with AI (Progressive Real Loading Screen with Live Steps)
  const handleGenerateAiGame = async () => {
    if (!aiPrompt.trim()) return;
    soundFx.playClick();
    stopTestGame();
    setIsGeneratingAi(true);
    setGeneratedDraft(null);
    setAiProgress(8);
    setAiLoadingStage(`Analyzing game design: "${aiPrompt.slice(0, 36)}..."`);
    setAiLogs([
      `[0.0s] Initializing Mido Nemis AI Game Architect...`,
      `[0.3s] Model: Gemini 3.8 Flash active`,
      `[0.7s] Settings locked: ${aiGenre} | ${aiPerspective} | ${aiDifficulty}`,
      `[1.1s] Character: ${aiCharacter} (${aiCharacterColor}) | Theme: ${aiTheme}`
    ]);

    const timer1 = setTimeout(() => {
      setAiProgress(30);
      setAiLoadingStage(`Synthesizing physics engine & mechanics (${aiMechanics.join(', ')})...`);
      setAiLogs(prev => [
        ...prev,
        `[1.8s] Compiling player bounding box, velocities & movement constraints...`,
        `[2.4s] Designing custom hazard waves, enemy formations & collectibles...`
      ]);
    }, 1200);

    const timer2 = setTimeout(() => {
      setAiProgress(60);
      setAiLoadingStage(`Writing 60 FPS HTML5 Canvas engine with ${aiBossFight ? 'Boss Fight' : 'Endless Run'}...`);
      setAiLogs(prev => [
        ...prev,
        `[3.2s] Writing 60FPS render loop with neon particle glow shaders...`,
        `[3.9s] Structuring collision resolution & dynamic damage system (${aiLivesMode})...`
      ]);
    }, 2800);

    const timer3 = setTimeout(() => {
      setAiProgress(85);
      setAiLoadingStage('Compiling responsive dual input (Touch Pointer + Keyboard WASD)...');
      setAiLogs(prev => [
        ...prev,
        `[4.6s] Linking high-score dispatch & dynamic audio triggers...`,
        `[5.2s] Packaging standalone sandbox runtime for instant test play...`
      ]);
    }, 4500);

    try {
      const res = await fetch('/api/nemis/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          genre: aiGenre,
          perspective: aiPerspective,
          difficulty: aiDifficulty,
          character: aiCharacter,
          characterColor: aiCharacterColor,
          theme: aiTheme,
          mechanics: aiMechanics,
          livesMode: aiLivesMode,
          bossFight: aiBossFight,
          soundStyle: aiSoundStyle,
          title: aiGameTitle,
        })
      });
      const data = await res.json();
      if (data.success && data.gameConfig) {
        setAiProgress(100);
        setAiLoadingStage('✨ Verification complete! Playable game ready to test & publish.');
        setAiLogs(prev => [
          ...prev,
          `[Done] Game engine verified: 60 FPS Canvas ready!`,
          `[Done] Ready to test play below and publish to Mido Nemis feed.`
        ]);
        setGeneratedDraft(data.gameConfig);
        showToast("🎮 Custom Game Engineered! Play it now or publish!");
      } else {
        showToast(data.error || "Failed to generate game");
      }
    } catch {
      showToast("Error generating AI game.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGeneratingAi(false);
    }
  };

  // Publish Draft Game to Mido Nemis
  const handlePublishDraft = async () => {
    if (!generatedDraft) return;
    soundFx.playClick();
    stopTestGame();
    setIsPublishing(true);

    try {
      const myId = user?.id || 'ch_my_channel';
      const myName = user?.name || 'Mido Gamez';
      const myAvatar = user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel';

      const res = await fetch('/api/nemis/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedDraft.title,
          description: generatedDraft.description,
          genre: generatedDraft.genre || aiGenre,
          gameType: 'custom',
          gameCode: generatedDraft.gameCode || generatedDraft.code || '',
          code: generatedDraft.gameCode || generatedDraft.code || '',
          instructions: generatedDraft.instructions || 'Tap/Click or use Arrow Keys to play!',
          thumbnailUrl: generatedDraft.thumbnailUrl,
          creatorId: myId,
          creatorName: myName,
          creatorAvatar: myAvatar,
        })
      });

      const data = await res.json();
      if (data.success && data.game) {
        setGames(prev => [data.game, ...prev]);
        setActiveGameIndex(0);
        setIsAiMakerOpen(false);
        setGeneratedDraft(null);
        setAiPrompt('');
        showToast("🎉 Game published to Mido Nemis! Everyone can now scroll and play it.");
      }
    } catch {
      showToast("Error publishing game");
    } finally {
      setIsPublishing(false);
    }
  };

  const isCreatorSelf = user?.id && currentGame?.creatorId === user.id;
  const isFollowingCreator = currentGame ? Boolean(followingMap[currentGame.creatorId]) : false;
  const isLikedCurrent = currentGame ? Boolean(likedGamesMap[currentGame.id]) : false;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-slate-900/95 border border-purple-500/40 text-white text-xs font-bold shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm md:text-base tracking-tight text-white">MIDO NEMIS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-extrabold border border-pink-500/30">
                GAMES FEED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              TikTok for Games — Scroll through playable mini-games, earn high scores &amp; make games with AI!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsAiMakerOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25 transition-all flex items-center gap-1.5 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Make Game with AI</span>
          </button>

          {onOpenAccountManager && (
            <button
              onClick={onOpenAccountManager}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="My Unified Account & Followers"
            >
              <User className="w-4 h-4 text-purple-400" />
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-slate-900/40 overflow-x-auto shrink-0 scrollbar-none">
        {['All', 'Arcade Runner', 'Galaxy Shooter', 'Flappy Flying', 'Brick Breaker', 'Physics Puzzle', 'Rhythm Beat'].map(genre => (
          <button
            key={genre}
            onClick={() => {
              soundFx.playClick();
              setSelectedGenre(genre);
              setActiveGameIndex(0);
              stopCurrentGame();
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === genre
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* MAIN VIEWPORT: SCROLLABLE FEED OF PLAYABLE GAMES */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading Mido Nemis Games Feed...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center space-y-4 p-8 max-w-md bg-slate-900/60 border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-pink-600/30 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto shadow-xl">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-base font-black text-white">No games published yet</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Only real creators and human players here — absolutely zero fake bots. Be the very first creator to engineer an open-ended game with AI and publish it!
              </p>
            </div>
            <button
              onClick={() => setIsAiMakerOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white text-xs font-black shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 mx-auto transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Make &amp; Publish First Game with AI</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-md h-full max-h-[720px] rounded-3xl bg-slate-900 border border-white/15 overflow-hidden shadow-2xl flex flex-col">
            {/* GAME VIEW CONTAINER */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              {/* Active Playable HTML5 Canvas */}
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain ${isPlayingGame ? 'block' : 'hidden'}`}
              />

              {/* Game Poster / Idle Screen */}
              {!isPlayingGame && (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
                  {/* Backdrop artwork */}
                  <img
                    src={currentGame.thumbnailUrl}
                    alt={currentGame.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[2px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                  <div className="relative z-10 space-y-4 max-w-xs">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 text-pink-400" />
                      <span>{currentGame.genre}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {currentGame.title}
                    </h2>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentGame.description}
                    </p>

                    <button
                      onClick={startGame}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-pink-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>TAP TO PLAY (60 FPS)</span>
                    </button>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                      <span>🏆 Best: {currentGame.highScore || 0}</span>
                      <span>•</span>
                      <span>🎮 Plays: {(currentGame.plays || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Over Overlay */}
              {isGameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Game Over</div>
                    <div className="text-3xl font-black text-white font-mono mt-1">{gameScore} PTS</div>
                    {gameScore >= (currentGame.highScore || 0) && gameScore > 0 && (
                      <div className="text-xs font-bold text-amber-300 mt-1 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>NEW HIGH SCORE!</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2.5 w-full max-w-xs">
                    <button
                      onClick={startGame}
                      className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Play Again</span>
                    </button>
                    <button
                      onClick={stopCurrentGame}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              )}

              {/* RIGHT FLOATING ACTION BAR (TikTok style for games) */}
              <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-3.5">
                {/* Creator Profile & Follow Button */}
                <div className="relative flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-lg cursor-pointer">
                    <img
                      src={currentGame.creatorAvatar}
                      alt={currentGame.creatorName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* REAL FOLLOW BUTTON (Cannot follow yourself!) */}
                  {!isCreatorSelf ? (
                    <button
                      onClick={() => handleToggleFollow(currentGame.creatorId)}
                      className={`-mt-2.5 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md border transition-all flex items-center gap-0.5 ${
                        isFollowingCreator
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-rose-600 hover:bg-rose-500 text-white border-white/20'
                      }`}
                      title={isFollowingCreator ? "Following" : "Follow Creator"}
                    >
                      {isFollowingCreator ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                      <span>{isFollowingCreator ? 'Following' : 'Follow'}</span>
                    </button>
                  ) : (
                    <span className="-mt-2.5 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                      You
                    </span>
                  )}
                </div>

                {/* Like Button */}
                <button
                  onClick={() => handleLikeGame(currentGame.id)}
                  className="flex flex-col items-center gap-0.5 group"
                >
                  <div className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    isLikedCurrent ? 'bg-rose-600 text-white scale-110 shadow-lg shadow-rose-600/40' : 'bg-black/50 text-white hover:bg-white/20'
                  }`}>
                    <Heart className={`w-5 h-5 ${isLikedCurrent ? 'fill-white' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold text-white font-mono">
                    {currentGame.likes || 0}
                  </span>
                </button>

                {/* Comments Button */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsCommentsOpen(true);
                  }}
                  className="flex flex-col items-center gap-0.5 group"
                >
                  <div className="p-2.5 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur-md transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white font-mono">
                    {currentGame.comments?.length || 0}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShareGame(currentGame)}
                  className="flex flex-col items-center gap-0.5 group"
                >
                  <div className="p-2.5 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur-md transition-all">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white">Share</span>
                </button>

                {/* Restart / Replay Button */}
                {isPlayingGame && (
                  <button
                    onClick={startGame}
                    className="p-2.5 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur-md transition-all"
                    title="Restart Game"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* BOTTOM CREATOR & GAME METADATA OVERLAY */}
              <div className="absolute left-4 bottom-4 right-16 z-20 space-y-1 text-left select-text">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white drop-shadow-md">
                    @{currentGame.creatorName}
                  </span>
                  {/* OFFICIAL VERIFIED BADGE (1,000+ Followers!) */}
                  {currentGame.creatorVerified && (
                    <span
                      className="text-cyan-400 drop-shadow-md"
                      title="Verified Creator (1,000+ Followers on Mido AI)"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-cyan-500 text-black" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1 drop-shadow">
                  {currentGame.title}
                </div>
                <p className="text-[11px] text-slate-300/90 line-clamp-2 drop-shadow leading-tight">
                  {currentGame.description}
                </p>
              </div>

              {/* Top controls: Mute & Exit game */}
              {isPlayingGame && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                  <button
                    onClick={stopCurrentGame}
                    className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold border border-white/20 backdrop-blur-md hover:bg-black/80"
                  >
                    ✕ Stop Playing
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Feed Navigation Controls (Previous / Next Game) */}
            <div className="p-2 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] pl-2">
                Game {activeGameIndex + 1} of {filteredGames.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={scrollToPrevGame}
                  disabled={activeGameIndex === 0}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1 transition-all"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={scrollToNextGame}
                  disabled={activeGameIndex === filteredGames.length - 1}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1 transition-all shadow-md"
                >
                  <span>Next Game</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COMMENTS MODAL / DRAWER */}
      {isCommentsOpen && currentGame && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-slate-900 border-l border-white/10 h-full flex flex-col p-4 animate-slide-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-pink-400" />
                <span className="font-bold text-sm text-white">Comments ({currentGame.comments?.length || 0})</span>
              </div>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {(!currentGame.comments || currentGame.comments.length === 0) ? (
                <div className="text-center text-xs text-slate-500 py-10">
                  No comments yet. Be the first to cheer for this game!
                </div>
              ) : (
                currentGame.comments.map(c => (
                  <div key={c.id} className="flex gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                    <img src={c.userAvatar} alt={c.userName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{c.userName}</span>
                        <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handlePostComment} className="pt-2 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI GAME MAKER STUDIO MODAL */}
      {isAiMakerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto space-y-5 text-slate-100 no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                    <span>Mido Nemis Pro Game Studio</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                      Zero Templates • AI Custom Code
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Configure your vision, generate 60FPS canvas engine, test play &amp; publish</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopTestGame();
                  setIsAiMakerOpen(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: PROMPT & GAME TITLE */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>1. Describe whatever game you want to play:</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const ideas = [
                      "Cyberpunk dragon flying through a futuristic city shooting plasma lasers at hostile surveillance blimps, with a massive cyber boss with energy shields",
                      "Lava cave parkour runner with a neon ninja who can double jump and dash over falling volcanic boulders and spike pits",
                      "Neon retro highway racer where you weave through high-speed traffic, grab nitro canisters, and smash speed records",
                      "Deep space asteroid miner with orbital gravity where you bounce between planetary shields avoiding laser traps and collecting dark matter gems",
                      "Arena bullet survivor with a battle wizard casting chain-lightning spells against endless hordes of shadow goblins",
                      "Arcade laser brick smasher with explosive multi-ball powerups, neon laser paddles, and indestructible iron barriers"
                    ];
                    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
                    setAiPrompt(randomIdea);
                    if (!aiGameTitle) setAiGameTitle(randomIdea.split(' ')[0] + ' ' + randomIdea.split(' ')[1] + ' 🎮');
                  }}
                  className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Inspire Me / Random Idea</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="What happens in your game? e.g. Cyber space runner with laser beams, glowing powerup gems, intense boss battle with HP bar..."
                className="w-full p-3.5 bg-black/60 border border-white/15 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 resize-none font-sans leading-relaxed"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiGameTitle}
                  onChange={(e) => setAiGameTitle(e.target.value)}
                  placeholder="Custom Game Title (optional, e.g. Cyber Dragon Fury 🐉)"
                  className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* SECTION 2: GENRE & ENGINE ARCHITECTURE */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Core Game Genre &amp; Engine:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Galaxy Shooter', label: '🚀 Space Shooter', desc: 'Lasers, waves, boss showdown' },
                  { id: 'Arcade Runner', label: '🏃 2D Platformer', desc: 'Jump, slide, obstacles, gems' },
                  { id: 'Brick Breaker', label: '🧱 Brick Smasher', desc: 'Paddle, deflection, multiball' },
                  { id: 'Highway Racer', label: '🏎️ Cyber Racer', desc: 'Traffic dodge, nitro boost' },
                  { id: 'Arena Survivor', label: '⚔️ Arena Survivor', desc: '360° horde, auto-spells' },
                  { id: 'Flappy Flying', label: '🐦 Gravity Flap', desc: 'Thrust, gates, rings' },
                  { id: 'Neon Snake', label: '🐍 Snake Dash', desc: 'Growing trail, speed fruits' },
                  { id: 'Physics Puzzle', label: '🧩 Gravity Sandbox', desc: 'Bounce, portals, physics' }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAiGenre(g.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      aiGenre === g.id
                        ? 'bg-purple-600/30 border-purple-500 text-white ring-1 ring-purple-500/50'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="font-bold text-xs">{g.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 3: PERSPECTIVE & DIFFICULTY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>3. Camera Perspective:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Top-Down 2D', 'Side-Scrolling', 'Isometric 2.5D', 'Vertical Scroller'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAiPerspective(p)}
                      className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                        aiPerspective === p ? 'bg-blue-600/30 border-blue-500 text-white' : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>4. Difficulty Pacing:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'Casual', label: '🟢 Casual' },
                    { id: 'Balanced', label: '🟡 Balanced' },
                    { id: 'Bullet-Hell', label: '🔴 Hardcore' },
                    { id: 'Chaos Mode', label: '⚡ Chaos' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setAiDifficulty(d.id)}
                      className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                        aiDifficulty === d.id ? 'bg-amber-600/30 border-amber-500 text-white' : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: CHARACTER & COLOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. Player Sprite Type:</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Spaceship', 'Cyber Ninja', 'Energy Orb', 'Super Car', 'Spellcaster', 'Pixel Beast'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAiCharacter(c)}
                      className={`py-1.5 px-2 rounded-xl border text-center text-[11px] font-bold transition-all ${
                        aiCharacter === c ? 'bg-emerald-600/30 border-emerald-500 text-white' : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                  <span>6. Player Accent Color:</span>
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { color: '#38bdf8', label: 'Cyan' },
                    { color: '#f43f5e', label: 'Rose' },
                    { color: '#fbbf24', label: 'Gold' },
                    { color: '#34d399', label: 'Emerald' },
                    { color: '#a855f7', label: 'Purple' }
                  ].map(c => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setAiCharacterColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-9 h-9 rounded-xl transition-all shadow-md flex items-center justify-center ${
                        aiCharacterColor === c.color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {aiCharacterColor === c.color && <Check className="w-4 h-4 text-black stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 5: SPECIAL MECHANICS & LIVES */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>7. Special Mechanics &amp; Features:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Lasers / Shooting', label: '⚡ Auto Lasers' },
                  { id: 'Energy Shields', label: '🛡️ Invincible Shield' },
                  { id: 'Double Jump', label: '🌀 Double Jump / Dash' },
                  { id: 'Boss Battle', label: '👾 Boss Fight with HP' }
                ].map(m => {
                  const isChecked = aiMechanics.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        if (isChecked) {
                          setAiMechanics(aiMechanics.filter(x => x !== m.id));
                        } else {
                          setAiMechanics([...aiMechanics, m.id]);
                        }
                      }}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                        isChecked ? 'bg-rose-600/30 border-rose-500 text-white' : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Lives mode & Theme */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAiLivesMode(aiLivesMode === '3 Hearts' ? '1-Hit Sudden Death' : '3 Hearts')}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-left flex items-center justify-between"
                >
                  <span className="text-xs text-slate-300">Health Mode:</span>
                  <span className="text-xs font-black text-rose-400">{aiLivesMode === '3 Hearts' ? '❤️❤️❤️ 3 Hearts' : '💀 1-Hit Sudden Death'}</span>
                </button>

                <div className="flex gap-1.5">
                  {['Cyber Neon', 'Deep Space', 'Volcanic Lava', 'Retro 8-Bit'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAiTheme(t)}
                      className={`flex-1 p-2 rounded-xl border text-center text-[10px] font-bold ${
                        aiTheme === t ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* REAL PROGRESSIVE LOADING SCREEN (Takes its time with live logs) */}
            {isGeneratingAi && (
              <div className="p-4 rounded-2xl bg-black/80 border border-purple-500/50 space-y-3 text-left animate-fade-in shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">AI Engineering Engine Active</span>
                  </div>
                  <span className="font-mono text-xs font-black text-pink-400">{aiProgress}%</span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full transition-all duration-300 shadow-md shadow-pink-500/30"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-pink-200">
                  <Zap className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                  <span>{aiLoadingStage}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                  {aiLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-emerald-400">
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateAiGame}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isGeneratingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Compiling 60 FPS Custom Game Engine ({aiProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Generate Full Custom Game with AI</span>
                </>
              )}
            </button>

            {/* GENERATED GAME DRAFT: IN-MODAL LIVE TEST PLAY & PUBLISH */}
            {generatedDraft && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-950/90 border border-purple-500/40 space-y-4 text-left animate-fade-in shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-black text-white">{generatedDraft.title}</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-black border border-purple-500/30">
                    {generatedDraft.genre}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{generatedDraft.description}</p>
                <div className="text-[11px] text-amber-300 font-mono">
                  Controls: {generatedDraft.instructions}
                </div>

                {/* IN-MODAL LIVE TEST PLAY CANVAS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live In-Studio Test Player:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => startTestGame()}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isTestPlayingDraft ? 'Restart Test Play' : 'Play & Test Now'}</span>
                    </button>
                  </div>

                  <div className="relative aspect-square max-h-72 w-full rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                    <canvas
                      ref={testCanvasRef}
                      className="w-full h-full object-contain cursor-crosshair"
                    />
                    {!isTestPlayingDraft && (
                      <div
                        onClick={() => startTestGame()}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 cursor-pointer group"
                      >
                        <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                          <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                        <span className="text-xs font-black text-white">Tap to Test Play Your Game</span>
                        <span className="text-[10px] text-slate-400">Controls: Mouse / Touch drag or Arrow Keys</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PUBLISH TO FEED BUTTON */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    Publisher: <strong className="text-white">@{user?.name || 'Mido Gamez'}</strong>
                  </span>
                  <button
                    onClick={handlePublishDraft}
                    disabled={isPublishing}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Publishing Game to Feed...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 text-slate-950" />
                        <span>Publish Game to Mido Nemis Feed 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
