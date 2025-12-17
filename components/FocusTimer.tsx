import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Watch } from 'lucide-react';

const MESSAGES = [
  "Keep going! 🌱",
  "You've got this! ✨",
  "Stay focused! 🔭",
  "Don't give up! 💖",
  "You're doing great! 🌟",
  "One step at a time! 🐾",
  "Crushing it! 🚀"
];

const RobotHelper: React.FC<{ active: boolean }> = ({ active }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % MESSAGES.length);
      }, 5000); // Change message every 5s
      return () => clearInterval(interval);
    }
  }, [active]);

  return (
    <div className="flex items-center justify-center gap-4 mt-8 w-full px-4">
      <motion.svg width="60" height="60" viewBox="0 0 100 100" 
         animate={{ y: active ? [0, -5, 0] : 0 }}
         transition={{ repeat: Infinity, duration: 2 }}
         className="drop-shadow-lg flex-shrink-0"
      >
          {/* Mini Robot Body */}
          <rect x="30" y="40" width="40" height="40" rx="10" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="2" />
          {/* Eyes */}
          <rect x="40" y="50" width="8" height="8" rx="2" fill="#334155" />
          <rect x="60" y="50" width="8" height="8" rx="2" fill="#334155" />
          
          {/* Arms holding banner */}
          <path d="M30,60 L10,50" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
      </motion.svg>
      
      {/* Banner/Sign */}
      <motion.div 
        className="relative bg-white text-violet-500 px-4 py-2 rounded-2xl rounded-bl-none shadow-md border border-violet-100 min-w-[140px] text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        key={msgIndex} // Re-animate on text change
      >
        <p className="text-sm font-bold whitespace-nowrap">{active ? MESSAGES[msgIndex] : "Ready to focus? ☁️"}</p>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)] rotate-180 transform translate-x-2 border-l border-t border-violet-100" />
      </motion.div>
    </div>
  );
};

export const FocusTimer: React.FC = () => {
  const [mode, setMode] = useState<'TIMER' | 'STOPWATCH'>('TIMER');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [stopwatchTime, setStopwatchTime] = useState(0);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        if (mode === 'TIMER') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'TIMER') setTimeLeft(25 * 60);
    else setStopwatchTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'TIMER' ? (timeLeft / (25 * 60)) * 100 : 100;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-lg min-h-[450px] relative">
      
      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-full p-1 mb-8 z-10">
        <button
          onClick={() => { setMode('TIMER'); setIsActive(false); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
            mode === 'TIMER' ? 'bg-white text-violet-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Timer size={16} /> Timer
        </button>
        <button
          onClick={() => { setMode('STOPWATCH'); setIsActive(false); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
            mode === 'STOPWATCH' ? 'bg-white text-violet-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Watch size={16} /> Stopwatch
        </button>
      </div>

      {/* Clock Visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8 z-10 group cursor-pointer" onClick={toggleTimer}>
         {/* Background Ring */}
         <svg 
            viewBox="0 0 256 256"
            className="absolute inset-0 w-full h-full transform -rotate-90 transition-transform duration-500 group-hover:scale-105 overflow-visible"
        >
          <circle
            cx="128"
            cy="128"
            r="100"
            stroke="#F1F5F9"
            strokeWidth="12"
            fill="#F8FAFC"
          />
          {mode === 'TIMER' && (
             <motion.circle
                cx="128"
                cy="128"
                r="100"
                stroke="#A78BFA"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - progress / 100) }}
                transition={{ duration: 1, ease: "linear" }}
            />
          )}
          {mode === 'STOPWATCH' && isActive && (
              <motion.circle
              cx="128"
              cy="128"
              r="100"
              stroke="#34D399"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="20 60"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
          )}
        </svg>

        <div className="flex flex-col items-center z-10 pointer-events-none">
            <span className="text-5xl font-mono font-bold text-slate-700 tracking-wider drop-shadow-sm">
            {formatTime(mode === 'TIMER' ? timeLeft : stopwatchTime)}
            </span>
            <span className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">
                {isActive ? 'Focusing...' : 'Paused'}
            </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-4 z-10">
        <button
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 text-white ${
            isActive 
              ? 'bg-amber-400 hover:bg-amber-300' 
              : 'bg-violet-400 hover:bg-violet-300'
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-500 flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      <RobotHelper active={isActive} />
    </div>
  );
};