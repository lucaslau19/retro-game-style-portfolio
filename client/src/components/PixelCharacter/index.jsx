import React from 'react';
import { motion } from 'framer-motion';
import './PixelCharacter.css';

const PixelCharacter = () => {
  // 16x16 pixel grid for the character
  // Colors: 0=transparent, 1=hair (brown), 2=skin, 3=armor (orange), 4=boots (dark)
  const pixelMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0], // hair top
    [0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0], // hair sides
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0], // face
    [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0], // face
    [0, 0, 0, 3, 3, 0, 2, 2, 2, 2, 2, 0, 3, 3, 0, 0], // face
    [0, 0, 0, 0, 3, 0, 0, 3, 3, 3, 0, 0, 3, 0, 0, 0], // hair bottom
    [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, , 0, 0], // armor top
    [0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0], // armor with arms
    [0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0], // armor
    [0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0], // armor
    [0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0], // legs
    [0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0], // legs
    [0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0], // boots
    [0, 0, 0, 0, 0, 0, 4, 4, 0, 4, 4, 0, 0, 0, 0, 0]  // boots
  ];

  const colorMap = {
    0: 'transparent',
    1: '#4a3728', // brown hair
    2: '#d4a574', // skin tone
    3: '#ff9900', // orange armor
    4: '#1a1a1a'  // dark boots
  };

  const pixelSize = 23; // pixels per grid cell

  return (
    <motion.div
      className="pixel-character-frame"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        className="pixel-character"
        animate={{
          y: [0, -12, 0],
          rotate: [-3, 0, 3, 0]
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.25, 0.5, 1]
        }}
      >
        <div className="pixel-grid">
          {pixelMap.map((row, rowIndex) =>
            row.map((colorIndex, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="pixel"
                style={{
                  width: `${pixelSize}px`,
                  height: `${pixelSize}px`,
                  backgroundColor: colorMap[colorIndex],
                  opacity: colorIndex === 0 ? 0 : 1
                }}
              />
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PixelCharacter;
