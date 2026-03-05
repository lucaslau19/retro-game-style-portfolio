import React, { useEffect, useState } from 'react';
import './CursorTrail.css';

const CursorTrail = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Random scatter ±4px
      const scatter = 4;
      const offsetX = (Math.random() - 0.5) * scatter * 2;
      const offsetY = (Math.random() - 0.5) * scatter * 2;

      // Create new particle
      const newParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX + offsetX,
        y: e.clientY + offsetY,
        created: Date.now(),
      };

      setParticles(prev => [...prev.slice(-14), newParticle]); // Keep last 15 particles
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Clean up old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.filter(particle =>
        Date.now() - particle.created < 600 // Remove after 600ms
      ));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cursor-trail">
      {particles.map(particle => {
        const age = Date.now() - particle.created;
        const opacity = Math.max(0, 1 - age / 600);

        return (
          <div
            key={particle.id}
            className="trail-particle"
            style={{
              left: particle.x - 3,
              top: particle.y - 3,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

export default CursorTrail;