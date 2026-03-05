import React, { createContext, useContext, useState, useEffect } from 'react';
import { playerData } from '../data/playerData';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(playerData);

  const updatePlayer = (updates) => {
    setPlayer(prev => ({ ...prev, ...updates }));
  };

  const gainXP = (amount) => {
    setPlayer(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return {
        ...prev,
        xp: newXP,
        level: newLevel
      };
    });
  };

  return (
    <PlayerContext.Provider value={{ player, updatePlayer, gainXP }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};