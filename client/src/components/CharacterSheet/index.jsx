import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { useXPCounter } from '../../hooks/useXPCounter';
import { DiscIcon, SnowboardIcon, CoffeeIcon, AirpodsIcon } from './InventoryIcons';
import './CharacterSheet.css';

const CharacterSheet = () => {
  const { player } = usePlayer();
  const [showClass, setShowClass] = useState(false);
  const xpCount = useXPCounter(player.xp);

  useEffect(() => {
    const timer = setTimeout(() => setShowClass(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="character-sheet"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="character-header">
        <motion.h1
          className="character-name pixel-font glow-text"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          {player.name}
        </motion.h1>

        <motion.div
          className="class-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: showClass ? 1 : 0 }}
          transition={{ delay: 1 }}
        >
          <span className="typewriter">{player.class}</span>
        </motion.div>

        <motion.p
          className="university"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {player.university}
        </motion.p>
      </div>

      <div className="character-avatar">
        <motion.div
          className="avatar-frame"
        >
          <div className="avatar-placeholder">
            <span>LVL {player.level}</span>
          </div>
        </motion.div>
      </div>

      <div className="character-stats">
        <div className="xp-bar">
          <motion.div
            className="xp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(xpCount / player.maxXP) * 100}%` }}
            transition={{ delay: 2, duration: 2, ease: "easeOut" }}
          />
          <span className="xp-text">{xpCount} / {player.maxXP} XP</span>
        </div>



        <div className="equipped-items">
          <h3 className="equipped-label">EQUIPPED</h3>
          <div className="items-grid">
            <motion.div 
              className="item-slot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
            >
              <div className="item-icon"><DiscIcon /></div>
              <div className="item-label">DISC</div>
            </motion.div>
            <motion.div 
              className="item-slot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7 }}
            >
              <div className="item-icon"><SnowboardIcon /></div>
              <div className="item-label">SNOWBOARD</div>
            </motion.div>
            <motion.div 
              className="item-slot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.9 }}
            >
              <div className="item-icon"><CoffeeIcon /></div>
              <div className="item-label">COFFEE</div>
            </motion.div>
            <motion.div 
              className="item-slot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.1 }}
            >
              <div className="item-icon"><AirpodsIcon /></div>
              <div className="item-label">AIRPODS</div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterSheet;