import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { usePlayer } from '../../context/PlayerContext';
import './QuestLog.css';

const QuestLog = () => {
  const { player } = usePlayer();
  const [useFallback, setUseFallback] = useState(false);

  const { data: repos, isLoading, error } = useQuery({
    queryKey: ['repos'],
    queryFn: () => axios.get('/api/github/repos').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });

  // Timeout fallback after 4 seconds
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.log('GitHub API timeout, using fallback data');
        setUseFallback(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Use fallback data if API fails or times out
  useEffect(() => {
    if (error) {
      console.error('GitHub API error:', error);
      setUseFallback(true);
    }
  }, [error]);

  const quests = useFallback ? player.quests : (repos || []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading && !useFallback) {
    return (
      <motion.div
        className="quest-log panel"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="panel-title pixel-font">QUESTS</h2>
        <div className="loading-quests">
          <div className="loading-spinner"></div>
          Loading...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="quest-log panel"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="panel-title pixel-font">QUESTS</h2>

      <motion.div
        className="quests-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id || quest.name}
            className="quest-card"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="quest-image">
              <img
                src={quest.image}
                alt={quest.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="image-placeholder" style={{ display: 'none' }}>
                [ IMAGE ]
              </div>
            </div>

            <div className="quest-content">
              <h3 className="quest-title cinzel-font">{quest.title}</h3>

              <div className="quest-tech">
                {quest.tech.slice(0, 3).map(tech => (
                  <span key={tech} className="tech-chip">{tech}</span>
                ))}
              </div>

              <p className="quest-description">
                {quest.description}
              </p>

              <div className="quest-actions">
                {quest.github && (
                  <button
                    className="quest-button primary"
                    onClick={() => window.open(quest.github, '_blank')}
                  >
                    ACCEPT QUEST
                  </button>
                )}
                {quest.homepage && (
                  <button
                    className="quest-button secondary"
                    onClick={() => window.open(quest.homepage, '_blank')}
                  >
                    LIVE DEMO →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default QuestLog;