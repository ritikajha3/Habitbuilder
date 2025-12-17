export type Priority = 'low' | 'medium' | 'high';
export type Frequency = 'daily' | 'once';

export interface Habit {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
  lastCompleted: string | null; // ISO Date string
  icon?: string;
  color: string;
  // New fields
  priority: Priority;
  frequency: Frequency;
  scheduledTime?: string; // "14:30"
  coinValue: number;
}

export interface DayStats {
  completed: number;
  total: number;
  allCompleted: boolean;
}

export interface UserStats {
  level: number;
  xp: number;
  coins: number; 
  totalStreak: number;
  maxStreak: number;
  lastLoginDate: string | null;
  health: number; // 0-100
  history: Record<string, DayStats>; // Key is YYYY-MM-DD
}

export type AvatarState = 'IDLE' | 'HAPPY' | 'ZAPPED' | 'THINKING' | 'WAVING';

export interface MotivationResponse {
  text: string;
}
