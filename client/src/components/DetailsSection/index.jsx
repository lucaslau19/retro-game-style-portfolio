import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Activity, MapPin } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useTypewriter } from '../../hooks/useTypewriter';
import PixelCharacter from '../PixelCharacter';
import './DetailsSection.css';

const DetailsSection = () => {
  const { player } = usePlayer();
  const { displayText, isComplete } = useTypewriter(player.bio, 8, 300);
  const [portraitHovered, setPortraitHovered] = useState(false);

  return (
    <motion.div
      className="details-section panel"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="details-content">
        {/* Left Column */}
        <div className="details-left">
          <motion.h1
            className="details-name pixel-font glow-text"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {player.name}
          </motion.h1>

          <motion.div
            className="details-class"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {player.class}
          </motion.div>

          <motion.div
            className="details-university"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {player.university}
          </motion.div>

          <motion.div
            className={`details-portrait ${portraitHovered ? 'hovered' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            onMouseEnter={() => setPortraitHovered(true)}
            onMouseLeave={() => setPortraitHovered(false)}
          >
            <PixelCharacter />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="details-right">
          <motion.h2
            className="details-lore-title cinzel-font"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            CHARACTER LORE
          </motion.h2>

          <motion.div
            className="details-bio"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Hidden text to reserve space */}
            <div className="bio-hidden-text">
              {player.bio}
            </div>
            
            {/* Visible typewriter text */}
            <div className="bio-visible-text">
              {displayText.split('\n\n').map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                  {!isComplete && index === displayText.split('\n\n').length - 1 && (
                    <span className="typewriter-cursor">|</span>
                  )}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="details-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="stat-chip">
              <GraduationCap size={14} />
              <span>UWaterloo '30</span>
            </div>
            <div className="stat-chip">
              <Activity size={14} />
              <span>Biomedical Eng.</span>
            </div>
            <div className="stat-chip">
              <MapPin size={14} />
              <span>Toronto, ON | Waterloo, ON</span>
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
};

export default DetailsSection;