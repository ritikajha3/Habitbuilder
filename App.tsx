import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trophy, Coins, Sparkles, LayoutList, Timer, Calendar as CalendarIcon, Loader2, WifiOff } from 'lucide-react';
import { differenceInCalendarDays, isSameDay, parseISO, format } from 'date-fns';

import { Avatar } from './components/Avatar';
import { HabitItem } from './components/HabitItem';
import { FocusTimer } from './components/FocusTimer';
import { CalendarView } from './components/CalendarView';
import { LightningStrike, Confetti } from './components/Effects';
import { getGeminiMotivation, suggestHabit } from './services/geminiService';
import { api } from './services/api'; // Import the new API service
import { Habit, UserStats, AvatarState, Priority, Frequency } from './types';

// Fallback initial state (used before data loads)
const EMPTY_STATS: UserStats = {
  level: 1,
  xp: 0,
  coins: 0,
  totalStreak: 0,
  maxStreak: 0,
  lastLoginDate: new Date().toISOString(),
  health: 100,
  history: {} 
};

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'HABITS' | 'FOCUS' | 'CALENDAR'>('HABITS');
  const [avatarState, setAvatarState] = useState<AvatarState>('IDLE');
  const [showLightning, setShowLightning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivation, setMotivation] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitPriority, setNewHabitPriority] = useState<Priority>('medium');
  const [newHabitFreq, setNewHabitFreq] = useState<Frequency>('daily');
  const [newHabitTime, setNewHabitTime] = useState("");

  // --- INITIAL DATA LOAD & DAILY RESET LOGIC ---
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoadingData(true);
        // Parallel fetch for speed
        const [fetchedStats, fetchedHabits] = await Promise.all([
          api.getUserStats(),
          api.getHabits()
        ]);

        const today = new Date();
        const lastLogin = fetchedStats.lastLoginDate ? parseISO(fetchedStats.lastLoginDate) : new Date();
        
        let finalStats = { ...fetchedStats };
        let finalHabits = [...fetchedHabits];
        let needsSync = false;
        let struckByLightning = false;

        // Check if day has changed
        if (!isSameDay(today, lastLogin)) {
          const daysDiff = differenceInCalendarDays(today, lastLogin);
          needsSync = true;

          // Reset only daily habits
          finalHabits = finalHabits.map(h => ({
             ...h, 
             completed: h.frequency === 'daily' ? false : h.completed 
          }));
          
          let newStreak = finalStats.totalStreak;

          // Zap if missed yesterday (gap > 1 day)
          if (daysDiff > 1) {
             newStreak = 0;
             struckByLightning = true;
          }
          
          finalStats.lastLoginDate = today.toISOString();
          finalStats.totalStreak = newStreak;
        }

        setStats(finalStats);
        setHabits(finalHabits);

        // Sync changes back to backend if logic modified them
        if (needsSync) {
          await api.updateUserStats(finalStats);
          // For habits, we update them one by one or in batch if API supported it.
          // Here we just fire and forget the updates for simplicity or rely on UserStats update being key
          Promise.all(finalHabits.map(h => api.updateHabit(h)));
        }

        if (struckByLightning) {
          triggerLightning();
        } else if (!isSameDay(today, lastLogin)) {
          setMotivation("A fresh new day! Let's keep that streak alive! ✨");
        }

      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Could not connect to the server.");
      } finally {
        setIsLoadingData(false);
      }
    };

    initData();
  }, []);

  const triggerLightning = () => {
    setShowLightning(true);
    setAvatarState('ZAPPED');
    setMotivation("Oh no! The streak is broken! 😢");
    setTimeout(() => {
        setShowLightning(false);
        setAvatarState('IDLE');
    }, 2000);
  };

  const handleToggleHabit = useCallback(async (id: string) => {
    // 1. Optimistic Update
    let habitToUpdate: Habit | undefined;
    let isCompleting = false;

    setHabits(prevHabits => {
      const newHabits = prevHabits.map(habit => {
        if (habit.id === id) {
          habitToUpdate = habit;
          isCompleting = !habit.completed;
          return {
            ...habit,
            completed: isCompleting,
            streak: isCompleting ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            lastCompleted: isCompleting ? new Date().toISOString() : habit.lastCompleted
          };
        }
        return habit;
      });
      return newHabits;
    });

    if (!habitToUpdate) return;

    // 2. Calculate New Stats
    let newStats = { ...stats };
    const habit = habitToUpdate as Habit; // Typescript safety
    
    // We need to calculate based on the STATE of habits AFTER toggle.
    // Since setHabits is async, we manually calculate the derived state here for the stats.
    // NOTE: This logic mimics the previous local implementation but now we prepare it for the API.
    
    if (isCompleting) {
        setAvatarState('HAPPY');
        setShowConfetti(true);
        setTimeout(() => setAvatarState('IDLE'), 2000);
        setTimeout(() => setShowConfetti(false), 2000);

        newStats.xp += habit.coinValue;
        newStats.coins += habit.coinValue;
        newStats.level = Math.floor(newStats.xp / 100) + 1;
        
        // Check if this was the first completion today to increment streak?
        // Actually the logic was: if NO OTHER habits are completed today, increment streak.
        const otherActive = habits.some(h => h.id !== id && h.completed); 
        if (!otherActive) newStats.totalStreak += 1;
    } else {
        newStats.coins = Math.max(0, newStats.coins - habit.coinValue);
        // Decrement streak? The original logic didn't explicitly decrement totalStreak on untoggle 
        // usually to be kind, but we can leave it as is.
    }

    // Update History
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const updatedHabitsList = habits.map(h => h.id === id ? { ...h, completed: isCompleting } : h);
    const dailyCompleted = updatedHabitsList.filter(h => h.completed).length;
    const dailyTotal = updatedHabitsList.length;

    newStats.history = {
        ...newStats.history,
        [todayKey]: {
            completed: dailyCompleted,
            total: dailyTotal,
            allCompleted: dailyCompleted === dailyTotal && dailyTotal > 0
        }
    };

    setStats(newStats);

    // 3. Sync to Backend
    try {
        // We construct the updated habit object
        const updatedHabit = {
            ...habit,
            completed: isCompleting,
            streak: isCompleting ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            lastCompleted: isCompleting ? new Date().toISOString() : habit.lastCompleted
        };

        await Promise.all([
            api.updateHabit(updatedHabit),
            api.updateUserStats(newStats)
        ]);
    } catch (err) {
        console.error("Sync failed", err);
        // Ideally revert optimistic update here, but for now just alert
        setMotivation("Sync failed... check connection! 🔌");
    }

  }, [habits, stats]);

  const handleDeleteHabit = async (id: string) => {
    // Optimistic UI
    const previousHabits = [...habits];
    setHabits(prev => prev.filter(h => h.id !== id));

    try {
        await api.deleteHabit(id);
    } catch (err) {
        console.error("Delete failed", err);
        setHabits(previousHabits); // Revert
        setMotivation("Could not delete task.");
    }
  };

  const getCoinValueForPriority = (p: Priority) => {
      switch(p) {
          case 'high': return 20;
          case 'medium': return 10;
          default: return 5;
      }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    
    const newHabit: Habit = {
        id: Date.now().toString(), // Backend usually assigns ID, but for optimistic/mock we do it here
        title: newHabitTitle,
        completed: false,
        streak: 0,
        lastCompleted: null,
        icon: undefined,
        color: '#6366f1',
        priority: newHabitPriority,
        frequency: newHabitFreq,
        coinValue: getCoinValueForPriority(newHabitPriority),
        scheduledTime: newHabitTime || undefined
    };

    // Optimistic
    setHabits([...habits, newHabit]);
    setShowAddModal(false);
    
    // Reset Form
    setNewHabitTitle("");
    setNewHabitPriority('medium');
    setNewHabitFreq('daily');
    setNewHabitTime("");

    try {
        await api.createHabit(newHabit);
    } catch (err) {
        console.error("Create failed", err);
        setHabits(habits); // Revert to old list
        setMotivation("Failed to save new task.");
    }
  };

  const handleGetMotivation = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAvatarState('THINKING');
    setMotivation("Thinking... 💭");
    
    try {
        const msg = await getGeminiMotivation(stats, habits);
        setMotivation(msg);
    } catch (e) {
        setMotivation("You're doing awesome! 🌟");
    }
    
    setAvatarState('IDLE');
    setIsAiLoading(false);
  };

  const handleAiSuggest = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAvatarState('THINKING');
    setMotivation("Searching... 🔍");
    
    try {
        const suggestion = await suggestHabit(habits);
        const newHabit: Habit = {
            id: Date.now().toString(),
            title: suggestion.title,
            completed: false,
            streak: 0,
            lastCompleted: null,
            icon: undefined,
            color: suggestion.color || '#F472B6',
            priority: 'medium',
            frequency: 'daily',
            coinValue: 10
        };
        
        // Optimistic add
        setHabits([...habits, newHabit]);
        setAvatarState('HAPPY');
        setMotivation(`Added: ${suggestion.title}`);
        
        await api.createHabit(newHabit);

    } catch(e) {
        setMotivation("Try again later! 💫");
    }
    
    setIsAiLoading(false);
    setTimeout(() => setAvatarState('IDLE'), 2500);
  };

  const handleAvatarClick = () => {
    setAvatarState('WAVING');
    setMotivation("Hi there! You're doing great! 💖");
    setTimeout(() => setAvatarState('IDLE'), 2000);
  };

  const completedCount = habits.length > 0 ? habits.filter(h => h.completed).length : 0;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  // --- LOADING SCREEN ---
  if (isLoadingData) {
      return (
          <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center text-slate-400">
              <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                  <Loader2 size={48} className="text-violet-400" />
              </motion.div>
              <p className="mt-4 font-bold text-sm tracking-wider">LOADING HABIT HERO...</p>
          </div>
      );
  }

  // --- ERROR STATE ---
  if (error) {
      return (
          <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <WifiOff size={64} className="text-slate-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">Connection Error</h2>
              <p className="mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-violet-500 text-white rounded-full font-bold shadow-lg hover:bg-violet-600 transition"
              >
                  Try Again
              </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-indigo-50 to-sky-50 text-slate-700 overflow-hidden relative font-sans selection:bg-pink-200">
      <LightningStrike active={showLightning} />
      {showConfetti && <Confetti />}
      
      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col p-6 pb-24">
        
        {/* Header Stats */}
        <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-tr from-violet-400 to-fuchsia-400 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md">
                    {stats.level}
                </div>
                <div className="pr-2">
                    <p className="text-xs text-slate-400 font-bold tracking-wider">LEVEL</p>
                    <p className="text-sm font-bold text-violet-500">{stats.xp} XP</p>
                </div>
            </div>
            
            <div className="flex gap-2">
                 <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white shadow-sm">
                    <Coins className="text-amber-400" size={18} />
                    <span className="font-bold text-slate-600">{stats.coins}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white shadow-sm">
                    <Trophy className="text-orange-400" size={18} />
                    <span className="font-bold text-slate-600">{stats.totalStreak}</span>
                </div>
            </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/50 backdrop-blur-md rounded-2xl mb-6 border border-white shadow-sm">
             <button 
                onClick={() => setActiveTab('HABITS')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'HABITS' ? 'bg-white text-violet-500 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
             >
                 <LayoutList size={18} />
             </button>
             <button 
                onClick={() => setActiveTab('FOCUS')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'FOCUS' ? 'bg-white text-violet-500 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
             >
                 <Timer size={18} />
             </button>
             <button 
                onClick={() => setActiveTab('CALENDAR')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'CALENDAR' ? 'bg-white text-violet-500 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
             >
                 <CalendarIcon size={18} />
             </button>
        </div>

        {activeTab === 'FOCUS' ? (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
                <FocusTimer />
                <div className="mt-8 p-6 bg-white/40 rounded-3xl border border-white text-center shadow-sm">
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Deep Work Zone 🌸</h3>
                    <p className="text-slate-500 text-sm">
                        Use this timer to stay focused. 
                        Completing a session will help you bloom!
                    </p>
                </div>
            </motion.div>
        ) : activeTab === 'CALENDAR' ? (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
                <CalendarView stats={stats} habits={habits} />
            </motion.div>
        ) : (
            <>
                {/* Avatar Section */}
                <section className="flex flex-col items-center justify-center relative mb-6 min-h-[320px]">
                    <Avatar state={avatarState} onClick={handleAvatarClick} />
                    
                    {/* Speech Bubble / Banner */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={motivation}
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                            className="mt-6 bg-white/90 backdrop-blur-sm text-slate-600 px-6 py-4 rounded-2xl rounded-tr-sm shadow-lg max-w-[90%] text-center font-medium relative z-20 min-h-[60px] flex items-center justify-center border border-white"
                        >
                            <p>{motivation || (stats.totalStreak > 0 
                            ? `You've been taking care of yourself for ${stats.totalStreak} day${stats.totalStreak === 1 ? '' : 's'}! 🌿` 
                            : "Tap me to say hi, or check a task to start! 💕")}</p>
                            
                            <div className="absolute -top-2 right-8 w-4 h-4 bg-white rotate-45 border-l border-t border-white" />
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={handleGetMotivation} 
                            disabled={isAiLoading} 
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-violet-50 border border-violet-100 rounded-full text-xs font-bold text-violet-500 shadow-sm transition-colors disabled:opacity-50"
                        >
                            <Sparkles size={14} /> Coach Me
                        </button>
                        <button 
                            onClick={handleAiSuggest} 
                            disabled={isAiLoading} 
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-violet-50 border border-violet-100 rounded-full text-xs font-bold text-violet-500 shadow-sm transition-colors disabled:opacity-50"
                        >
                            <Plus size={14} /> AI Suggest
                        </button>
                    </div>
                </section>

                {/* Progress Bar */}
                <div className="mb-6 px-2">
                    <div className="flex justify-between text-sm mb-2 text-slate-400 font-medium">
                        <span>Daily Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-violet-300 to-fuchsia-300 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                </div>

                {/* Habits List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {habits.map(habit => (
                            <HabitItem 
                                key={habit.id} 
                                habit={habit} 
                                onToggle={handleToggleHabit} 
                                onDelete={handleDeleteHabit}
                            />
                        ))}
                    </AnimatePresence>
                    
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:text-violet-500 hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus size={20} /> Add New Task
                    </button>
                </div>
            </>
        )}

        {/* Add Modal */}
        <AnimatePresence>
            {showAddModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
                    onClick={() => setShowAddModal(false)}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white"
                    >
                        <h3 className="text-xl font-bold mb-4 text-slate-700">Create Task</h3>
                        <form onSubmit={handleAddHabit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">Task Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    placeholder="e.g. Morning Jog"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">Priority</label>
                                    <select 
                                        value={newHabitPriority}
                                        onChange={(e) => setNewHabitPriority(e.target.value as Priority)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-violet-400"
                                    >
                                        <option value="low">Low (+5)</option>
                                        <option value="medium">Medium (+10)</option>
                                        <option value="high">High (+20)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">Frequency</label>
                                    <select 
                                        value={newHabitFreq}
                                        onChange={(e) => setNewHabitFreq(e.target.value as Frequency)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-violet-400"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="once">One-time</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">Schedule (Optional)</label>
                                <input
                                    type="time"
                                    value={newHabitTime}
                                    onChange={(e) => setNewHabitTime(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-violet-400"
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full mt-2 bg-violet-500 text-white font-bold py-4 rounded-xl hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200"
                            >
                                Add Task
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}