import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { getTopScores, submitScore } from '../../lib/arcadeScores';
import './Arcade.css';

const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'now';
};

const Arcade = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(2);
  const [wave, setWave] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [showInitialInput, setShowInitialInput] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [waveMessage, setWaveMessage] = useState('');
  const [savedInitials, setSavedInitials] = useState(null);

  const gameStateRef = useRef({
    score: 0,
    lives: 2,
    wave: 1,
    objects: [],
    player: { x: 0, y: 0, width: 28, height: 36, invincible: false },
    lastSpawn: 0,
    spawnInterval: 1200,
    fallSpeed: 2.5,
    animFrameId: null,
    running: false,
    xpSpawnTimer: 0,
    gameStartTime: 0,
    floatingTexts: []
  });

  const keysRef = useRef({});
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('bugdodge_initials');
    if (saved && saved.length === 2) {
      setSavedInitials(saved);
    }
    
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      const scores = await getTopScores();
      setLeaderboard(scores);
      setLoadingLeaderboard(false);
    };
    
    loadLeaderboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const scores = await getTopScores();
      setLeaderboard(scores);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const keys = keysRef.current;

    const handleKeyDown = (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'start') {
          setGameState('playing');
        } else if (gameState === 'gameOver' && !showInitialInput) {
          setGameState('start');
        }
      }
    };

    const handleKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, showInitialInput]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    const keys = keysRef.current;

    const container = canvas.parentElement;
    canvas.width = Math.min(900, container?.offsetWidth || 900);
    canvas.height = 550;

    const PLAYER_WIDTH = 28;
    const PLAYER_HEIGHT = 36;
    const OBJECT_SIZE = 25;
    const CANVAS_BOTTOM = canvas.height - 20;
    const MOVE_SPEED = 7;

    if (gameState === 'playing' && !state.running) {
      state.score = 0;
      state.lives = 2;
      state.wave = 1;
      state.objects = [];
      state.lastSpawn = 0;
      state.spawnInterval = 1200;
      state.fallSpeed = 2.5;
      state.xpSpawnTimer = 0;
      state.gameStartTime = Date.now();
      state.running = true;
      state.player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
      state.player.y = CANVAS_BOTTOM - PLAYER_HEIGHT;
      state.player.invincible = false;
      state.floatingTexts = [];
    }

    const getDifficultySettings = (elapsedSeconds) => {
      if (elapsedSeconds < 10) return { wave: 1, spawnInterval: 1200, fallSpeed: 2.5, xpInterval: 20000 };
      if (elapsedSeconds < 20) return { wave: 2, spawnInterval: 1000, fallSpeed: 3.5, xpInterval: 20000 };
      if (elapsedSeconds < 35) return { wave: 3, spawnInterval: 800, fallSpeed: 4.5, xpInterval: 20000 };
      if (elapsedSeconds < 50) return { wave: 4, spawnInterval: 600, fallSpeed: 5.5, xpInterval: 20000 };
      return { wave: 5, spawnInterval: 400, fallSpeed: 7, xpInterval: 25000 };
    };

    const getRandomObjectType = () => {
      const rand = Math.random();
      if (rand < 0.35) return 'bug';
      if (rand < 0.6) return 'error';
      if (rand < 0.75) return 'seg';
      if (rand < 0.85) return 'nullptr';
      if (rand < 0.93) return 'timeout';
      return 'deadline';
    };

    const checkCollision = (player, obj) => {
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const objWidth = obj.type === 'deadline' ? 40 : OBJECT_SIZE;
      const objCenterX = obj.x + objWidth / 2;
      const objCenterY = obj.y + objWidth / 2;
      const dx = Math.abs(playerCenterX - objCenterX);
      const dy = Math.abs(playerCenterY - objCenterY);
      const hitW = (player.width + objWidth) / 2 - 8;
      const hitH = (player.height + objWidth) / 2 - 8;
      return dx < hitW && dy < hitH;
    };

    const checkHighScore = (score) => {
      if (leaderboard.length < 10) return true;
      return score > (leaderboard[leaderboard.length - 1]?.score || 0);
    };

    const update = () => {
      if (!state.running || gameState !== 'playing') return;

      const now = Date.now();
      const elapsedSeconds = (now - state.gameStartTime) / 1000;
      const difficulty = getDifficultySettings(elapsedSeconds);

      state.spawnInterval = difficulty.spawnInterval;
      state.fallSpeed = difficulty.fallSpeed;

      if (difficulty.wave !== state.wave) {
        state.wave = difficulty.wave;
        setWave(state.wave);
        setWaveMessage(`WAVE ${state.wave} REACHED!`);
        state.score += 15;
        setScore(Math.floor(state.score));
        setTimeout(() => setWaveMessage(''), 1500);
      }

      if (keys['arrowleft'] || keys['a']) state.player.x = Math.max(0, state.player.x - MOVE_SPEED);
      if (keys['arrowright'] || keys['d']) state.player.x = Math.min(canvas.width - PLAYER_WIDTH, state.player.x + MOVE_SPEED);

      if (now - state.lastSpawn > state.spawnInterval) {
        const spawnCount = state.wave >= 4 && Math.random() < 0.5 ? 2 : 1;
        for (let i = 0; i < spawnCount; i++) {
          state.objects.push({
            x: Math.random() * (canvas.width - OBJECT_SIZE),
            y: 0,
            type: getRandomObjectType(),
            id: Date.now() + Math.random(),
            initialX: Math.random() * (canvas.width - OBJECT_SIZE)
          });
        }
        state.lastSpawn = now;
      }

      if (now - state.xpSpawnTimer > difficulty.xpInterval) {
        state.objects.push({
          x: Math.random() * (canvas.width - OBJECT_SIZE),
          y: 0,
          type: 'xp',
          id: Date.now() + Math.random()
        });
        state.xpSpawnTimer = now;
      }

      state.floatingTexts = state.floatingTexts
        .map(text => ({ ...text, y: text.y - 1, age: text.age + 1 }))
        .filter(text => text.age < 60);

      state.objects = state.objects.filter((obj) => {
        if (obj.type === 'timeout') obj.x = obj.initialX + Math.sin(obj.y / 20) * 60;
        const objWidth = obj.type === 'deadline' ? 40 : OBJECT_SIZE;
        obj.y += obj.type === 'deadline' ? state.fallSpeed * 2 : state.fallSpeed;

        if (!state.player.invincible && checkCollision(state.player, obj)) {
          if (obj.type === 'xp') {
            state.score += 25;
            state.floatingTexts.push({ x: obj.x + OBJECT_SIZE / 2, y: obj.y, text: '+25 XP!', age: 0 });
            setScore(Math.floor(state.score));
          } else {
            state.lives -= 1;
            setLives(state.lives);
            state.player.invincible = true;
            setTimeout(() => { state.player.invincible = false; }, 1500);
            if (state.lives <= 0) {
              state.running = false;
              setFinalScore(Math.floor(state.score));
              setGameState('gameOver');
              if (checkHighScore(state.score)) {
                if (savedInitials) submitScore(savedInitials, Math.floor(state.score));
                else setShowInitialInput(true);
              }
            }
            state.player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
          }
          return false;
        }

        if (obj.y > canvas.height) {
          if (obj.type !== 'xp') {
            state.score += 2;
            setScore(Math.floor(state.score));
          }
          return false;
        }
        return true;
      });
    };

    const draw = () => {
      ctx.fillStyle = '#0d0a07';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      if (gameState === 'start') {
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 40px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BUG DODGE', canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('Press SPACE or tap to start', canvas.width / 2, canvas.height / 2 + 10);
        const highScore = localStorage.getItem('bugdodge_highscore') || 0;
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
        ctx.fillText(`BEST: ${highScore}`, canvas.width / 2, canvas.height - 40);
      } else if (gameState === 'playing' && state.running) {
        ctx.globalAlpha = state.player.invincible && Math.floor(Date.now() / 100) % 2 === 0 ? 0.3 : 1;
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(state.player.x, state.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(state.player.x + 4, state.player.y + 4, PLAYER_WIDTH - 8, PLAYER_HEIGHT - 8);
        ctx.globalAlpha = 1;

        state.objects.forEach((obj) => {
          const opacity = state.player.invincible && obj.type !== 'xp' ? 0.3 : 1;
          ctx.globalAlpha = opacity;
          if (obj.type === 'bug') {
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(obj.x, obj.y, OBJECT_SIZE, OBJECT_SIZE / 1.5);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('BUG', obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2 + 2);
          } else if (obj.type === 'error') {
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
            ctx.fillStyle = '#f00';
            ctx.fillRect(obj.x, obj.y, OBJECT_SIZE, OBJECT_SIZE / 1.5);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ERR', obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2 + 2);
          } else if (obj.type === 'seg') {
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
            ctx.fillStyle = '#ff9900';
            ctx.fillRect(obj.x, obj.y, OBJECT_SIZE, OBJECT_SIZE / 1.5);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SEG', obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2 + 2);
          } else if (obj.type === 'nullptr') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(obj.x, obj.y, OBJECT_SIZE, OBJECT_SIZE);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('NULL', obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2 + 2);
          } else if (obj.type === 'timeout') {
            ctx.fillStyle = '#888';
            ctx.fillRect(obj.x, obj.y, OBJECT_SIZE, OBJECT_SIZE);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('408', obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2 + 2);
          } else if (obj.type === 'deadline') {
            ctx.fillStyle = '#660000';
            ctx.fillRect(obj.x, obj.y, 40, 40);
            ctx.fillStyle = '#ff0';
            ctx.font = 'bold 7px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('DUE', obj.x + 20, obj.y + 15);
            ctx.fillText('NOW', obj.x + 20, obj.y + 27);
          } else if (obj.type === 'xp') {
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(255, 221, 0, 0.8)';
            ctx.fillStyle = '#ffdd00';
            ctx.beginPath();
            ctx.arc(obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2, OBJECT_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });

        state.floatingTexts.forEach(text => {
          ctx.fillStyle = `rgba(255, 221, 0, ${1 - text.age / 60})`;
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(text.text, text.x, text.y);
        });

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 10, 25);
        ctx.fillStyle = '#e03030';
        for (let i = 0; i < state.lives; i++) ctx.fillRect(canvas.width - 20 - (i * 20), 10, 14, 14);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.fillText(`WAVE ${state.wave}`, canvas.width / 2, canvas.height - 10);
      } else if (gameState === 'gameOver') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 80);
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.fillText(`SCORE: ${Math.floor(state.score)}`, canvas.width / 2, canvas.height / 2 - 20);
        if (checkHighScore(state.score)) {
          ctx.fillStyle = '#ffdd00';
          ctx.font = 'bold 18px "Press Start 2P", monospace';
          ctx.fillText('NEW RECORD!', canvas.width / 2, canvas.height / 2 + 30);
        }
        if (!showInitialInput) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '12px "Press Start 2P", monospace';
          ctx.fillText('Press SPACE to retry', canvas.width / 2, canvas.height - 40);
        }
      }
    };

    const gameLoop = () => {
      update();
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      state.running = false;
    };
  }, [gameState, leaderboard, savedInitials, showInitialInput]);

  const handleMobileStart = () => {
    if (gameState === 'start') setGameState('playing');
    else if (gameState === 'gameOver' && !showInitialInput) setGameState('start');
  };

  return (
    <motion.div
      className="arcade-section panel"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="arcade-title pixel-font">
        ARCADE
      </h1>
      <p className="arcade-subtitle">Can you survive the codebase?</p>

      <div className="arcade-container">
        <div className="game-wrapper">
          <canvas ref={canvasRef} className="game-canvas" />
          <div className="scanline-overlay" />
          {waveMessage && (
            <div className="wave-notification">{waveMessage}</div>
          )}
        </div>

        <div className="leaderboard">
          <div className="leaderboard-header">
            <div className="leaderboard-title">
              <Trophy size={16} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
              <span style={{ fontFamily: 'Press Start 2P', fontSize: '0.7rem', color: 'var(--glow-primary)', letterSpacing: '1px' }}>
                HALL OF FAME
              </span>
            </div>
            <div className="leaderboard-global-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                <circle cx="12" cy="12" r="10" stroke="#ff9900" strokeWidth="2"/>
                <path d="M12 2C12 2 8 7 8 12C8 17 12 22 12 22" stroke="#ff9900" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 2C12 2 16 7 16 12C16 17 12 22 12 22" stroke="#ff9900" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 12H22" stroke="#ff9900" strokeWidth="1.5"/>
                <path d="M4 7H20" stroke="#ff9900" strokeWidth="1.5"/>
                <path d="M4 17H20" stroke="#ff9900" strokeWidth="1.5"/>
              </svg>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>
                GLOBAL
              </span>
            </div>
          </div>
          <div className="leaderboard-entries">
            {loadingLeaderboard ? (
              <div className="empty-leaderboard">LOADING...</div>
            ) : leaderboard.length === 0 ? (
              <div className="empty-leaderboard">No high scores yet</div>
            ) : (
              leaderboard.map((entry, index) => {
                const date = new Date(entry.created_at);
                const relative = getRelativeTime(date);
                return (
                  <div
                    key={index}
                    className={`leaderboard-entry ${
                      entry.score === finalScore ? 'highlight' : ''
                    }`}
                  >
                    <span className="rank">{index + 1}</span>
                    <span className="initials">{entry.initials}</span>
                    <span className="score">{entry.score}</span>
                    <span className="date">{relative}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mobile-controls">
        <button className="mobile-btn" onClick={handleMobileStart}>
          {gameState === 'start' ? 'START' : gameState === 'gameOver' ? 'RETRY' : '←'}
        </button>
        <button className="mobile-btn" onClick={handleMobileStart}>
          {gameState === 'start' ? 'START' : gameState === 'gameOver' ? 'RETRY' : '→'}
        </button>
      </div>

      {showInitialInput && gameState === 'gameOver' && (
        <InitialInput
          score={finalScore}
          savedInitials={savedInitials}
          onSubmit={async (initials) => {
            localStorage.setItem('bugdodge_initials', initials);
            setSavedInitials(initials);
            await submitScore(initials, finalScore);
            const updated = await getTopScores();
            setLeaderboard(updated);
            setShowInitialInput(false);
          }}
          onChangeInitials={() => {
            localStorage.removeItem('bugdodge_initials');
            setSavedInitials(null);
          }}
        />
      )}
    </motion.div>
  );
};

const InitialInput = ({ score, savedInitials, onSubmit, onChangeInitials }) => {
  const [initials, setInitials] = useState('AA');
  const [showingInput, setShowingInput] = useState(!savedInitials);

  const handleSubmit = () => {
    const clean = initials.toUpperCase().slice(0, 2);
    if (clean.length === 2 && /^[A-Z]{2}$/.test(clean)) {
      onSubmit(clean);
    }
  };

  const handleChange = () => {
    onChangeInitials();
    setShowingInput(true);
  };

  return (
    <div className="initial-input-overlay">
      <div className="initial-input-box">
        <h2>NEW RECORD!</h2>
        <p className="initial-score">Score: {score}</p>
        
        {showingInput ? (
          <>
            <label>ENTER INITIALS:</label>
            <input
              type="text"
              maxLength="2"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="initial-input"
              placeholder="AA"
            />
            <button onClick={handleSubmit} className="initial-submit">
              CONFIRM
            </button>
          </>
        ) : (
          <>
            <p className="initials-display">Submitted as: <span>{savedInitials}</span></p>
            <button onClick={handleChange} className="initial-change">
              change
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Arcade;
