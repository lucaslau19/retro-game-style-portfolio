import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { useXPCounter } from '../../hooks/useXPCounter';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './StatsPanel.css';

const statDescriptions = {
  str: { name: 'Python & C++', desc: 'Programming languages for data analysis and embedded systems' },
  int: { name: 'AI / ML', desc: 'Machine learning algorithms and artificial intelligence applications' },
  dex: { name: 'JavaScript, HTML/CSS', desc: 'Web development technologies for interactive user interfaces' },
  wis: { name: 'AutoCAD', desc: 'Computer-aided design for engineering and technical drawings' },
  cha: { name: 'Leadership & Communication', desc: 'Team collaboration and technical presentation skills' },
  lck: { name: 'Engineering Design', desc: 'Problem-solving and innovative design thinking' },
  sig: { name: 'Signal Processing', desc: 'Arduino firmware, sensor noise filtering, SpO2 algorithms' },
  prt: { name: 'Prototyping', desc: 'SolidWorks CAD, physical builds, biomedical design constraints' }
};

const StatsPanel = () => {
  const { player } = usePlayer();
  const [selectedStat, setSelectedStat] = useState(null);
  const [ref, isVisible] = useScrollReveal();

  const handleStatClick = (stat) => {
    setSelectedStat(stat);
  };

  const stats = Object.entries(player.stats).map(([key, value]) => ({
    key,
    value: useXPCounter(value, isVisible ? 1500 : 0),
    max: 100,
    ...statDescriptions[key]
  }));

  return (
    <motion.div
      ref={ref}
      className="stats-panel panel"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h2 className="panel-title pixel-font">ATTRIBUTES</h2>

      <motion.div
        className="stats-grid"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
        initial="hidden"
        animate={isVisible ? "show" : "hidden"}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.key}
            className="stat-item"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleStatClick(stat)}
            style={{ position: 'relative', overflow: 'visible' }}
          >
            <div className="stat-header">
              <span className="stat-name">{stat.name}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
            <div style={{
              width: '100%',
              height: '14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(212,146,30,0.3)',
              borderRadius: '2px',
              marginTop: '16px',
              overflow: 'hidden',
              display: 'block',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: `${stat.value}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d4921e, #ff9900)',
                borderRadius: '2px',
                display: 'block',
                transition: 'width 1.2s ease'
              }} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selectedStat && (
        <motion.div
          className="stat-modal panel"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setSelectedStat(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedStat.name}</h3>
            <p>{selectedStat.desc}</p>
            <button onClick={() => setSelectedStat(null)}>Close</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatsPanel;