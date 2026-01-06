import { Habit, UserStats } from '../types';

// CONFIGURATION
// Set this to false when you have a real backend server running.
const USE_MOCK_BACKEND = true; 
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// INITIAL DATA (Used for new users in Mock Mode)
const DEFAULT_HABITS: Habit[] = [
  { id: '1', title: 'Drink Water', completed: false, streak: 0, lastCompleted: null, color: '#60A5FA', priority: 'medium', frequency: 'daily', coinValue: 10 },
  { id: '2', title: 'Read 10 Pages', completed: false, streak: 0, lastCompleted: null, color: '#F472B6', priority: 'low', frequency: 'daily', coinValue: 5 },
];

const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 0,
  coins: 0,
  totalStreak: 0,
  maxStreak: 0,
  lastLoginDate: new Date().toISOString(),
  health: 100,
  history: {} 
};

// --- REAL API IMPLEMENTATION ---
const realApi = {
  getHabits: async (): Promise<Habit[]> => {
    const res = await fetch(`${API_BASE_URL}/habits`);
    if (!res.ok) throw new Error('Failed to fetch habits');
    return res.json();
  },

  createHabit: async (habit: Habit): Promise<Habit> => {
    const res = await fetch(`${API_BASE_URL}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit),
    });
    if (!res.ok) throw new Error('Failed to create habit');
    return res.json();
  },

  updateHabit: async (habit: Habit): Promise<Habit> => {
    const res = await fetch(`${API_BASE_URL}/habits/${habit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit),
    });
    if (!res.ok) throw new Error('Failed to update habit');
    return res.json();
  },

  deleteHabit: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete habit');
  },

  getUserStats: async (): Promise<UserStats> => {
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  updateUserStats: async (stats: UserStats): Promise<UserStats> => {
    const res = await fetch(`${API_BASE_URL}/stats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    });
    if (!res.ok) throw new Error('Failed to update stats');
    return res.json();
  }
};

// --- MOCK API IMPLEMENTATION (Uses LocalStorage with Delay) ---
const mockApi = {
  getHabits: async (): Promise<Habit[]> => {
    await new Promise(r => setTimeout(r, 600)); // Simulate network delay
    const stored = localStorage.getItem('hero_habits');
    return stored ? JSON.parse(stored) : DEFAULT_HABITS;
  },

  createHabit: async (habit: Habit): Promise<Habit> => {
    await new Promise(r => setTimeout(r, 300));
    const habits = await mockApi.getHabits();
    const newHabits = [...habits, habit];
    localStorage.setItem('hero_habits', JSON.stringify(newHabits));
    return habit;
  },

  updateHabit: async (habit: Habit): Promise<Habit> => {
    // No artificial delay here for snappier UI, or keep it low
    const habits = await mockApi.getHabits();
    const index = habits.findIndex(h => h.id === habit.id);
    if (index !== -1) {
      habits[index] = habit;
      localStorage.setItem('hero_habits', JSON.stringify(habits));
    }
    return habit;
  },

  deleteHabit: async (id: string): Promise<void> => {
    const habits = await mockApi.getHabits();
    const newHabits = habits.filter(h => h.id !== id);
    localStorage.setItem('hero_habits', JSON.stringify(newHabits));
  },

  getUserStats: async (): Promise<UserStats> => {
    await new Promise(r => setTimeout(r, 600));
    const stored = localStorage.getItem('hero_stats');
    return stored ? JSON.parse(stored) : INITIAL_STATS;
  },

  updateUserStats: async (stats: UserStats): Promise<UserStats> => {
    localStorage.setItem('hero_stats', JSON.stringify(stats));
    return stats;
  }
};

export const api = USE_MOCK_BACKEND ? mockApi : realApi;