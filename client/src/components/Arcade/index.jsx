import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './Arcade.css';

const Arcade = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(2);
  const [wave, setWave] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showInitialInput, setShowInitialInput] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [waveMessage, setWaveMessage] = useState('');

  const gameDataRef = useRef({
    score: 0,
    lives: 2,
    wave: 1,
    playerX: 0,
    playerY: 0,
    objects: [],
    lastSpawnTime: 0,
    lastXPSpawnTime: 0,
    spawnInterval: 1200,
    fallSpeed: 2.5,
    gameStartTime: 0,
    difficulty: 1,
    invincibilityEnd: 0,
    floatingTexts: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('bugdodge_leaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gameData = gameDataRef.current;

    // Set responsive canvas size
    const container = canvas.parentElement;
    canvas.width = Math.min(900, container?.offsetWidth || 900);
    canvas.height = 550;

    const playerWidth = 28;
    const playerHeight = 36;
    const objectSize = 25;
    const canvasBottom = canvas.height - 20;
    const playerY = canvasBottom - playerHeight;

    const keys = {};

    const handleKeyDown = (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    };

    const handleKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleStart = () => {
      if (gameState === 'start') {
        startGame();
      } else if (gameState === 'gameOver' && !showInitialInput) {
        resetGame();
      }
    };

    const startGame = () => {
      gameData.score = 0;
      gameData.lives = 2;
      gameData.wave = 1;
      gameData.playerX = canvas.width / 2 - playerWidth / 2;
      gameData.playerY = playerY;
      gameData.objects = [];
      gameData.lastSpawnTime = Date.now();
      gameData.lastXPSpawnTime = Date.now();
      gameData.spawnInterval = 1200;
      gameData.fallSpeed = 2.5;
      gameData.gameStartTime = Date.now();
      gameData.difficulty = 1;
      gameData.invincibilityEnd = 0;
      gameData.floatingTexts = [];
      setGameState('playing');
      setScore(0);
      setLives(2);
      setWave(1);
      setWaveMessage('');
    };

    const resetGame = () => {
      setGameState('start');
      setShowInitialInput(false);
      setWaveMessage('');
    };

    const checkHighScore = (score) => {
      if (leaderboard.length < 5) return true;
      return score > (leaderboard[leaderboard.length - 1]?.score || 0);
    };

    const getDifficultySettings = (elapsedSeconds) => {
      if (elapsedSeconds < 10) {
        return { wave: 1, spawnInterval: 1200, fallSpeed: 2.5, xpInterval: 20000 };
      } else if (elapsedSeconds < 20) {
        return { wave: 2, spawnInterval: 1000, fallSpeed: 3.5, xpInterval: 20000 };
      } else if (elapsedSeconds < 35) {
        return { wave: 3, spawnInterval: 800, fallSpeed: 4.5, xpInterval: 20000 };
      } else if (elapsedSeconds < 50) {
        return { wave: 4, spawnInterval: 600, fallSpeed: 5.5, xpInterval: 20000 };
      } else {
        return { wave: 5, spawnInterval: 400, fallSpeed: 7, xpInterval: 25000 };
      }
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

    const update = () => {
      if (gameState !== 'playing') return;

      const now = Date.now();
      const elapsedSeconds = (now - gameData.gameStartTime) / 1000;
      const difficulty = getDifficultySettings(elapsedSeconds);

      gameData.difficulty = difficulty.wave;
      gameData.spawnInterval = difficulty.spawnInterval;
      gameData.fallSpeed = difficulty.fallSpeed;

      const newWave = difficulty.wave;
      if (newWave !== gameData.wave) {
        setWave(newWave);
        gameData.wave = newWave;
        setWaveMessage(`WAVE ${newWave} REACHED!`);
        gameData.score += 15;
        setScore(gameData.score);
        setTimeout(() => setWaveMessage(''), 1500);
      }

      const moveSpeed = 7;
      if (keys['arrowleft'] || keys['a']) {
        gameData.playerX = Math.max(0, gameData.playerX - moveSpeed);
      }
      if (keys['arrowright'] || keys['d']) {
        gameData.playerX = Math.min(canvas.width - playerWidth, gameData.playerX + moveSpeed);
      }

      if (now - gameData.lastSpawnTime > gameData.spawnInterval) {
        const spawnCount = gameData.difficulty >= 4 && Math.random() < 0.5 ? 2 : 1;
        for (let i = 0; i < spawnCount; i++) {
          const x = Math.random() * (canvas.width - objectSize);
          gameData.objects.push({
            x,
            y: 0,
            type: getRandomObjectType(),
            id: Math.random(),
            initialX: x
          });
        }
        gameData.lastSpawnTime = now;
      }

      if (now - gameData.lastXPSpawnTime > difficulty.xpInterval) {
        const x = Math.random() * (canvas.width - objectSize);
        gameData.objects.push({
          x,
          y: 0,
          type: 'xp',
          id: Math.random()
        });
        gameData.lastXPSpawnTime = now;
      }

      gameData.floatingTexts = gameData.floatingTexts
        .map(text => ({
          ...text,
          y: text.y - 1,
          age: text.age + 1
        }))
        .filter(text => text.age < 60);

      gameData.objects = gameData.objects.filter((obj) => {
        if (obj.type === 'timeout') {
          obj.x = obj.initialX + Math.sin(obj.y / 20) * 60;
        }

        const objWidth = obj.type === 'deadline' ? 40 : objectSize;
        obj.y += obj.type === 'deadline' ? gameData.fallSpeed * 2 : gameData.fallSpeed;

        if (
          gameData.invincibilityEnd < now &&
          obj.y + objWidth > gameData.playerY &&
          obj.y < gameData.playerY + playerHeight &&
          obj.x + objWidth > gameData.playerX &&
          obj.x < gameData.playerX + playerWidth
        ) {
          if (obj.type === 'xp') {
            gameData.score += 25;
            gameData.floatingTexts.push({
              x: obj.x + objectSize / 2,
              y: obj.y,
              text: '+25 XP!',
              age: 0
            });
            setScore(gameData.score);
          } else {
            gameData.lives -= 1;
            setLives(gameData.lives);
            gameData.invincibilityEnd = now + 1500;
            if (gameData.lives <= 0) {
              setGameState('gameOver');
              setFinalScore(gameData.score);
              if (checkHighScore(gameData.score)) {
                setShowInitialInput(true);
              }
            }
            gameData.playerX = canvas.width / 2 - playerWidth / 2;
          }
          return false;
        }

        if (obj.y > canvas.height) {
          if (obj.type !== 'xp') {
            gameData.score += 2;
            setScore(gameData.score);
          }
          return false;
        }

        return obj.y < canvas.height + objectSize;
      });

      const scorePerSecond = Math.floor(elapsedSeconds);
      const lastScore = Math.floor((now - gameData.gameStartTime - 16) / 1000);
      if (scorePerSecond > lastScore) {
        gameData.score += 1;
        setScore(gameData.score);
      }
    };

    const drawObject = (obj) => {
      const isInvincible = gameData.invincibilityEnd > now && 
        Math.floor((now - (gameData.invincibilityEnd - 1500)) / 150) % 2 === 0;
      const opacity = isInvincible && obj.type !== 'xp' ? 0.3 : 1;

      ctx.globalAlpha = opacity;

      if (obj.type === 'bug') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
        ctx.fillStyle = '#ff4444';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐛', obj.x + objectSize / 2, obj.y + objectSize);
      } else if (obj.type === 'error') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(obj.x, obj.y, objectSize, objectSize / 1.5);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ERR', obj.x + objectSize / 2, obj.y + objectSize / 2 + 2);
      } else if (obj.type === 'seg') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(obj.x, obj.y, objectSize, objectSize / 1.5);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SEG', obj.x + objectSize / 2, obj.y + objectSize / 2 + 2);
      } else if (obj.type === 'nullptr') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obj.x, obj.y, objectSize, objectSize);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NULL', obj.x + objectSize / 2, obj.y + objectSize / 2 + 2);
      } else if (obj.type === 'timeout') {
        ctx.fillStyle = '#888888';
        ctx.fillRect(obj.x, obj.y, objectSize, objectSize);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('408', obj.x + objectSize / 2, obj.y + objectSize / 2 + 2);
      } else if (obj.type === 'deadline') {
        ctx.fillStyle = '#660000';
        ctx.fillRect(obj.x, obj.y, 40, 40);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DUE', obj.x + 20, obj.y + 15);
        ctx.fillText('NOW', obj.x + 20, obj.y + 27);
      } else if (obj.type === 'xp') {
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255, 221, 0, 0.8)';
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.arc(obj.x + objectSize / 2, obj.y + objectSize / 2, objectSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const now = Date.now();

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
      } else if (gameState === 'playing') {
        const isInvincible = gameData.invincibilityEnd > now;
        const blinkPhase = isInvincible && 
          Math.floor((now - (gameData.invincibilityEnd - 1500)) / 150) % 2 === 0;
        
        ctx.globalAlpha = blinkPhase ? 0.3 : 1;
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(gameData.playerX, gameData.playerY, playerWidth, playerHeight);
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(gameData.playerX + 4, gameData.playerY + 4, playerWidth - 8, playerHeight - 8);
        ctx.globalAlpha = 1;

        gameData.objects.forEach(drawObject);

        gameData.floatingTexts.forEach(text => {
          ctx.fillStyle = `rgba(255, 221, 0, ${1 - text.age / 60})`;
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(text.text, text.x, text.y);
        });

        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText(`SCORE: ${gameData.score}`, 10, 25);
        
        ctx.textAlign = 'right';
        ctx.fillText(`❤️ × ${gameData.lives}`, canvas.width - 10, 25);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.fillText(`WAVE ${gameData.wave}`, canvas.width / 2, canvas.height - 10);
      } else if (gameState === 'gameOver') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 80);

        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.fillText(`SCORE: ${gameData.score}`, canvas.width / 2, canvas.height / 2 - 20);

        if (checkHighScore(gameData.score)) {
          ctx.fillStyle = '#ffdd00';
          ctx.font = 'bold 18px "Press Start 2P", monospace';
          ctx.fillText('🏆 NEW RECORD! 🏆', canvas.width / 2, canvas.height / 2 + 30);
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
      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, showInitialInput, leaderboard]);

  const handleMobileStart = () => {
    if (gameState === 'start') {
      const canvas = canvasRef.current;
      if (canvas) {
        const playerWidth = 28;
        gameDataRef.current.score = 0;
        gameDataRef.current.lives = 2;
        gameDataRef.current.playerX = canvas.width / 2 - playerWidth / 2;
        gameDataRef.current.objects = [];
        gameDataRef.current.gameStartTime = Date.now();
        gameDataRef.current.difficulty = 1;
        gameDataRef.current.floatingTexts = [];
        setGameState('playing');
        setScore(0);
        setLives(2);
        setWave(1);
      }
    } else if (gameState === 'gameOver' && !showInitialInput) {
      setGameState('start');
    }
  };

  return (
    <motion.div
      className="arcade-section panel"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="arcade-title pixel-font">🕹️ ARCADE</h1>
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
          <h3>🏆 HALL OF FAME</h3>
          <div className="leaderboard-entries">
            {leaderboard.length === 0 ? (
              <div className="empty-leaderboard">No high scores yet</div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`leaderboard-entry ${
                    entry.score === finalScore ? 'highlight' : ''
                  }`}
                >
                  <span className="rank">#{index + 1}</span>
                  <span className="initials">{entry.initials}</span>
                  <span className="score">{entry.score}</span>
                </div>
              ))
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
          onSubmit={(initials) => {
            localStorage.setItem('bugdodge_highscore', finalScore);
            let saved = localStorage.getItem('bugdodge_leaderboard');
            let list = saved ? JSON.parse(saved) : [];
            list.push({
              initials,
              score: finalScore,
              date: new Date().toISOString().split('T')[0]
            });
            list = list.sort((a, b) => b.score - a.score).slice(0, 5);
            localStorage.setItem('bugdodge_leaderboard', JSON.stringify(list));
            setLeaderboard(list);
            setShowInitialInput(false);
          }}
        />
      )}
    </motion.div>
  );
};

const InitialInput = ({ score, onSubmit }) => {
  const [initials, setInitials] = useState('AAA');

  const handleSubmit = () => {
    onSubmit(initials.toUpperCase().slice(0, 3));
  };

  return (
    <div className="initial-input-overlay">
      <div className="initial-input-box">
        <h2>🏆 NEW RECORD! 🏆</h2>
        <p className="initial-score">Score: {score}</p>
        <label>ENTER INITIALS:</label>
        <input
          type="text"
          maxLength="3"
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase())}
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="initial-input"
          placeholder="AAA"
        />
        <button onClick={handleSubmit} className="initial-submit">
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default Arcade;
