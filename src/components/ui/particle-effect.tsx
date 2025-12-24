import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

export const ParticleEffect = ({ trigger }: { trigger: boolean }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50,
          size: Math.random() * 8 + 4,
          color: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][Math.floor(Math.random() * 4)],
          duration: Math.random() * 0.5 + 0.5,
        });
      }
      setParticles(newParticles);

      setTimeout(() => setParticles([]), 1000);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: 0,
            scale: 1,
          }}
          transition={{ duration: particle.duration, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};
