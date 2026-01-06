import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Star, Trash2, Clock, CalendarDays, Coins, AlertCircle } from 'lucide-react';
import { Habit } from '../types';

interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggle, onDelete }) => {
  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-rose-500 bg-rose-50 border border-rose-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border border-amber-100';
      default: return 'text-sky-500 bg-sky-50 border border-sky-100';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`group relative flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 shadow-sm ${
        habit.completed 
          ? 'bg-emerald-50/50 border-emerald-100' 
          : 'bg-white/80 border-white hover:border-violet-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => onToggle(habit.id)}
          className={`relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
            habit.completed
              ? 'bg-emerald-400 text-white shadow-emerald-200 shadow-lg'
              : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
          }`}
        >
          {habit.completed && (
            <motion.div
              initial={{ scale: 0.5, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
            >
              <Check size={24} strokeWidth={4} />
            </motion.div>
          )}
        </button>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
             <span className={`text-lg font-bold truncate transition-all ${
                habit.completed ? 'text-slate-400 line-through opacity-70' : 'text-slate-700'
             }`}>
                {habit.title}
             </span>
             {/* Coins Reward Badge */}
             <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 text-xs font-bold border border-amber-100">
               <Coins size={10} />
               <span>+{habit.coinValue}</span>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
            <span className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 ${getPriorityColor(habit.priority)}`}>
               <AlertCircle size={10} /> {habit.priority.charAt(0).toUpperCase() + habit.priority.slice(1)}
            </span>
            
            {habit.scheduledTime && (
                <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 flex items-center gap-1">
                    <Clock size={10} /> {habit.scheduledTime}
                </span>
            )}

            {habit.frequency === 'daily' && (
                <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 flex items-center gap-1">
                    <CalendarDays size={10} /> Daily
                </span>
            )}
            
            <div className="flex items-center gap-1 text-slate-400 font-bold ml-1">
                <Flame size={12} className={habit.streak > 0 ? "text-orange-400 fill-orange-400" : "text-slate-300"} />
                <span className={habit.streak > 0 ? "text-orange-400" : "text-slate-300"}>
                {habit.streak}
                </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-2">
         {habit.completed && (
             <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-amber-300"
             >
                 <Star fill="currentColor" size={24} />
             </motion.div>
         )}
        <button 
          onClick={() => onDelete(habit.id)}
          className="p-2 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};