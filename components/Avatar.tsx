import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AvatarState } from '../types';

interface AvatarProps {
  state: AvatarState;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ state, onClick }) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const isHappy = state === 'HAPPY';
  const isZapped = state === 'ZAPPED';
  const isThinking = state === 'THINKING';
  const isWaving = state === 'WAVING';

  // Only blink when idle or thinking (not when zapped or happy/winking)
  const shouldBlink = !isHappy && !isZapped && !isWaving;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Limit the movement radius within the eye
      const maxDist = 4; // Smaller movement for cute puppy eyes
      const angle = Math.atan2(deltaY, deltaX);
      const dist = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 20, maxDist);

      setPupilPos({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={ref} 
      className="relative w-56 h-56 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      {/* Aura/Background Glow - Pastel */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full blur-3xl ${
          isZapped ? 'bg-red-200' : isHappy || isWaving ? 'bg-pink-200' : 'bg-blue-100'
        }`}
      />

      {/* Robot SVG */}
      <svg width="200" height="200" viewBox="0 0 200 200" className="z-10 drop-shadow-xl">
        
        {/* Breathing Wrapper - Moves the whole body slightly up and down */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Antenna */}
          <motion.g
            animate={{ rotate: isThinking ? [0, 10, -10, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            originX="100" originY="40"
          >
              <line x1="100" y1="40" x2="100" y2="10" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
              <motion.circle 
                  cx="100" cy="10" r="8" 
                  fill={isZapped ? "#FCA5A5" : isThinking ? "#FDE047" : "#60A5FA"}
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
              />
          </motion.g>

          {/* Ears/Bolts - Softer Grey */}
          <rect x="15" y="90" width="15" height="40" rx="5" fill="#CBD5E1" />
          <rect x="170" y="90" width="15" height="40" rx="5" fill="#CBD5E1" />

          {/* Hand (Only visible when waving) */}
          <motion.g
            initial={{ opacity: 0, rotate: 0, x: 170, y: 120 }}
            animate={{ 
              opacity: isWaving ? 1 : 0,
              rotate: isWaving ? [0, 20, -20, 0] : 0,
              x: isWaving ? 160 : 170,
              y: isWaving ? 100 : 120
            }}
            transition={{ duration: 0.5, repeat: isWaving ? Infinity : 0 }}
          >
            <path d="M0,0 L20,-20 L40,0 L30,30 L10,30 Z" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="3" strokeLinejoin="round" />
          </motion.g>

          {/* Head Shape - Pastel Blue */}
          <motion.rect
            x="30" y="40" width="140" height="120" rx="35"
            fill={isZapped ? "#FECACA" : "#E0F2FE"} 
            stroke={isZapped ? "#FCA5A5" : "#BAE6FD"} strokeWidth="5"
            animate={{
              x: isZapped ? [30, 35, 25, 30] : 30,
              fill: isZapped ? "#FECACA" : "#E0F2FE"
            }}
            transition={{ duration: 0.1, repeat: isZapped ? Infinity : 0 }}
          />

          {/* Face Screen Area - Darker blue but softer */}
          <rect x="45" y="60" width="110" height="80" rx="25" fill="#334155" />

          {/* Eyes Group - PUPPY EYES */}
          <g transform="translate(0, 0)">
            {/* Left Eye */}
            <g transform="translate(70, 95)">
              {isHappy || isWaving ? (
                  <motion.path d="M-15,0 Q0,-20 15,0" stroke="#38BDF8" strokeWidth="5" fill="none" strokeLinecap="round" />
              ) : (
                  // Blinking Wrapper
                  <motion.g
                    animate={shouldBlink ? { scaleY: [1, 1, 1, 1, 0.1, 1, 1] } : { scaleY: 1 }}
                    transition={{ duration: 5, repeat: Infinity, times: [0, 0.45, 0.5, 0.52, 0.55, 0.6, 1] }}
                    style={{ originY: "50%", originX: "50%" }} // Blink to center
                  >
                    {/* Main Eye Circle */}
                    <motion.circle 
                      r="16" 
                      fill="#0F172A" 
                      stroke="#38BDF8" 
                      strokeWidth="2" 
                      animate={{ 
                        scaleY: isZapped ? 0.1 : 1,
                        x: pupilPos.x,
                        y: pupilPos.y 
                        }} 
                      />
                    {!isZapped && (
                      <>
                        {/* Big Highlight */}
                        <circle cx="-6" cy="-6" r="6" fill="white" opacity="0.9" />
                        {/* Small Highlight */}
                        <circle cx="6" cy="6" r="3" fill="white" opacity="0.8" />
                      </>
                    )}
                  </motion.g>
              )}
            </g>

            {/* Right Eye */}
            <g transform="translate(130, 95)">
              {isHappy || isWaving ? (
                  <motion.path d="M-15,0 Q0,-20 15,0" stroke="#38BDF8" strokeWidth="5" fill="none" strokeLinecap="round" />
              ) : (
                  // Blinking Wrapper
                  <motion.g
                    animate={shouldBlink ? { scaleY: [1, 1, 1, 1, 0.1, 1, 1] } : { scaleY: 1 }}
                    transition={{ duration: 5, repeat: Infinity, times: [0, 0.45, 0.5, 0.52, 0.55, 0.6, 1] }}
                    style={{ originY: "50%", originX: "50%" }} // Blink to center
                  >
                    {/* Main Eye Circle */}
                      <motion.circle 
                      r="16" 
                      fill="#0F172A" 
                      stroke="#38BDF8" 
                      strokeWidth="2" 
                      animate={{ 
                        scaleY: isZapped ? 0.1 : 1,
                        x: pupilPos.x,
                        y: pupilPos.y 
                        }} 
                      />
                    {!isZapped && (
                      <>
                        {/* Big Highlight */}
                        <circle cx="-6" cy="-6" r="6" fill="white" opacity="0.9" />
                        {/* Small Highlight */}
                        <circle cx="6" cy="6" r="3" fill="white" opacity="0.8" />
                      </>
                    )}
                  </motion.g>
              )}
            </g>
          </g>

          {/* Mouth */}
          <motion.g transform="translate(100, 130)">
              {isThinking ? (
                  <circle r="4" fill="#38BDF8" />
              ) : isZapped ? (
                  <path d="M-10,5 L-5,-5 L0,5 L5,-5 L10,5" stroke="#F87171" strokeWidth="3" fill="none" strokeLinecap="round" />
              ) : isHappy || isWaving ? (
                  <path d="M-10,-2 Q0,8 10,-2" stroke="#38BDF8" strokeWidth="4" fill="none" strokeLinecap="round" />
              ) : (
                  <path d="M-5,0 L5,0" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
              )}
          </motion.g>
          
          {/* Cheeks - Always subtle visible for cuteness */}
          <circle cx="50" cy="110" r="8" fill="#F472B6" opacity={isZapped ? "0" : "0.4"} />
          <circle cx="150" cy="110" r="8" fill="#F472B6" opacity={isZapped ? "0" : "0.4"} />
        </motion.g>

      </svg>
      
      {/* Lightning Overlay */}
      {isZapped && (
         <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none text-yellow-200 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3, repeat: 3 }}
         >
             <path d="M50,0 L30,50 L50,50 L40,100 L70,40 L50,40 Z" fill="currentColor" stroke="white" strokeWidth="2" />
         </motion.svg>
      )}
    </div>
  );
};