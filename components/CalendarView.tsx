import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isFuture,
  isToday,
  getDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Star, AlertCircle, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { UserStats, Habit } from '../types';

interface CalendarViewProps {
  stats: UserStats;
  habits: Habit[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ stats, habits }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate padding for start of month
  const startDay = getDay(startOfMonth(currentDate));
  const emptyDays = Array.from({ length: startDay });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDayStatus = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (isFuture(date) && !isToday(date)) return 'FUTURE';
    
    const dayData = stats.history?.[dateKey];
    
    if (!dayData) return 'EMPTY';
    if (dayData.allCompleted && dayData.total > 0) return 'PERFECT';
    if (dayData.completed > 0) return 'PARTIAL';
    return 'MISSED';
  };

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayData = stats.history?.[selectedKey];
  const isSelectedFuture = isFuture(selectedDate) && !isToday(selectedDate);

  // For future dates, assume all current active daily habits are planned
  const plannedCount = habits.filter(h => h.frequency === 'daily').length;

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-700">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          
          {daysInMonth.map(date => {
            const status = getDayStatus(date);
            const isSelected = isSameDay(date, selectedDate);
            const isDayToday = isToday(date);

            return (
              <motion.button
                key={date.toString()}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedDate(date)}
                className={`
                  relative aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all
                  ${isSelected ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-white' : ''}
                  ${!isSameMonth(date, currentDate) ? 'opacity-30' : ''}
                  ${status === 'PERFECT' ? 'bg-emerald-100 text-emerald-600' : ''}
                  ${status === 'PARTIAL' ? 'bg-amber-100 text-amber-600' : ''}
                  ${status === 'MISSED' ? 'bg-rose-100 text-rose-500' : ''}
                  ${status === 'EMPTY' && !isDayToday ? 'bg-slate-50 text-slate-400' : ''}
                  ${status === 'FUTURE' ? 'bg-slate-50 text-slate-300' : ''}
                  ${isDayToday && status === 'EMPTY' ? 'bg-violet-100 text-violet-600' : ''}
                `}
              >
                {format(date, 'd')}
                
                {/* Status Dot */}
                {status === 'PERFECT' && (
                  <div className="absolute bottom-1">
                    <Star size={8} fill="currentColor" />
                  </div>
                )}
                {status === 'PARTIAL' && (
                   <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/40 border border-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm
               ${isSelectedFuture ? 'bg-blue-100 text-blue-500' : 
                 selectedDayData?.allCompleted ? 'bg-emerald-100 text-emerald-500' : 
                 selectedDayData ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400'}
            `}>
              {isSelectedFuture ? '🔮' : 
               selectedDayData?.allCompleted ? '🌟' : 
               selectedDayData ? '⚡' : '📅'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-700">{format(selectedDate, 'EEEE, MMM do')}</h3>
              <p className="text-sm text-slate-400">
                {isSelectedFuture ? 'Future Plan' : 'Daily Summary'}
              </p>
            </div>
          </div>

          <div className="bg-white/60 rounded-xl p-4 flex items-center justify-between border border-white">
             {isSelectedFuture ? (
                 <>
                    <div className="flex items-center gap-3 text-slate-600 font-medium">
                        <CalendarIcon size={20} className="text-blue-400" />
                        <span>Scheduled Tasks</span>
                    </div>
                    <span className="font-bold text-xl text-slate-700">{plannedCount}</span>
                 </>
             ) : selectedDayData ? (
                 <>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold">Completed</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-2xl font-bold ${selectedDayData.allCompleted ? 'text-emerald-500' : 'text-slate-700'}`}>
                                {selectedDayData.completed}
                            </span>
                            <span className="text-slate-400 font-medium">/ {selectedDayData.total}</span>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        {selectedDayData.allCompleted ? (
                            <span className="flex items-center gap-1 text-emerald-500 text-sm font-bold">
                                <CheckCircle2 size={16} /> Perfect!
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                <AlertCircle size={16} /> Almost there!
                            </span>
                        )}
                    </div>
                 </>
             ) : (
                 <p className="text-slate-400 text-sm w-full text-center italic">No data recorded for this day.</p>
             )}
          </div>
          
          {isSelectedFuture && (
              <p className="mt-4 text-xs text-center text-slate-400 font-medium">
                  You have {plannedCount} tasks scheduled. Ready to shine? ✨
              </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};