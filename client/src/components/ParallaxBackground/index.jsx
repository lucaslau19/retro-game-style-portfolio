import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = () => {
  const meshRef = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ],
        speed: Math.random() * 0.01 + 0.005
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={meshRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#ff9900' : i % 3 === 1 ? '#00f5ff' : '#c9a84c'}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

const ParallaxBackground = () => {
  return (
    <div className="parallax-background">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Particles />
      </Canvas>
    </div>
  );
};

export default ParallaxBackground;