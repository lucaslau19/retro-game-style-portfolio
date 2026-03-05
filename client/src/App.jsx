import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import CharacterSheet from './components/CharacterSheet';
import DetailsSection from './components/DetailsSection';
import StatsPanel from './components/StatsPanel';
import QuestLog from './components/QuestLog';
import Arcade from './components/Arcade';
// import ParallaxBackground from './components/ParallaxBackground';
import ContactParty from './components/ContactParty';
import CursorTrail from './components/CursorTrail/CursorTrail';
import { usePlayer } from './context/PlayerContext';
import './styles/globals.css';
import './styles/animations.css';
import './components/LoadingScreen/LoadingScreen.css';
import './components/CharacterSheet/CharacterSheet.css';
import './components/DetailsSection/DetailsSection.css';
import './components/StatsPanel/StatsPanel.css';
import './components/QuestLog/QuestLog.css';
import './components/Arcade/Arcade.css';
// import './components/ParallaxBackground/ParallaxBackground.css';
import './components/ContactParty/ContactParty.css';
import './components/CursorTrail/CursorTrail.css';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const { player } = usePlayer();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    { component: <CharacterSheet key="character" />, label: "CHARACTER", icon: "⚔️" },
    { component: <DetailsSection key="details" />, label: "DETAILS", icon: "📖" },
    { component: <StatsPanel key="stats" />, label: "ATTRIBUTES", icon: "📊" },
    { component: <QuestLog key="quests" />, label: "QUESTS", icon: "📜" },
    { component: <Arcade key="arcade" />, label: "ARCADE", icon: "🕹️" },
    { component: <ContactParty key="contact" />, label: "ADD FRIEND", icon: "👥" }
  ];

  return (
    <div className="app">
      <CursorTrail />
      {/* <ParallaxBackground /> */}
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="content"
        >
          {sections[currentSection].component}
          <div className="navigation">
            {sections.map((section, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`nav-button ${currentSection === index ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default App;