import React from 'react';
import { motion } from 'framer-motion';

export const LightningStrike: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Background Flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0, 0.4, 0] }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-white"
      />
      
      {/* Bolt - Softer Yellow */}
      <motion.svg
         viewBox="0 0 200 600"
         className="absolute h-full w-auto text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.6)]"
         initial={{ pathLength: 0, opacity: 1 }}
         animate={{ pathLength: 1, opacity: [1, 1, 0] }}
         transition={{ duration: 0.3, ease: "linear" }}
      >
        <path
          d="M100,0 L20,250 L90,250 L10,600"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  );
};

export const Confetti: React.FC = () => {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
       {particles.map((_, i) => (
         <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full shadow-sm"
            style={{ 
                backgroundColor: ['#FCD34D', '#FCA5A5', '#93C5FD', '#6EE7B7', '#C4B5FD'][i % 5],
                left: '50%',
                top: '50%'
            }}
            initial={{ scale: 1 }}
            animate={{ 
                x: (Math.random() - 0.5) * 800,
                y: (Math.random() - 0.5) * 800,
                opacity: 0,
                scale: 0,
                rotate: Math.random() * 360
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
         />
       ))}
    </div>
  );
}