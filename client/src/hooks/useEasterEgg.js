import { useState, useCallback } from 'react';

export const useEasterEgg = (onTrigger) => {
  const [clickCount, setClickCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleClick = useCallback(() => {
    setClickCount(prev => {
      const newCount = prev + 1;

      if (newCount === 3) {
        setIsFlashing(true);
        onTrigger();

        // Reset flash after animation
        setTimeout(() => setIsFlashing(false), 1000);

        return 0; // Reset click count
      }

      // Reset click count after 1 second of no clicks
      setTimeout(() => setClickCount(0), 1000);

      return newCount;
    });
  }, [onTrigger]);

  return { handleClick, isFlashing };
};