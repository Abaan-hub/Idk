import { create } from 'zustand';
import { uid, today, QUOTES } from './utils';

const STORAGE_KEY = 'prodigy-v4';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.settings) return parsed;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function makeDefaultState() {
  const now = new Date().toISOString();
  return {
    theme: 'dark',
    accentColor: '#818cf8',

    // Water
    waterLogs: [],
    waterGoal: 2000,
    waterReminderInterval: 30,

    // Food
    foodLogs: [],
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 250,
    fatGoal: 65,
    savedMeals: [],

    // Exercise
    exerciseLogs: [],

    // Sleep
    sleepLogs: [],

    // Tasks
    todos: [],

    // Habits
    habits: [
      { id: uid(), name: 'Exercise', emoji: '🏃', completedDays: {}, color: '#34d399' },
      { id: uid(), name: 'Read 30min', emoji: '📖', completedDays: {}, color: '#60a5fa' },
      { id: uid(), name: 'Meditate', emoji: '🧘', completedDays: {}, color: '#a78bfa' },
      { id: uid(), name: 'Drink Water', emoji: '💧', completedDays: {}, color: '#38bdf8' },
      { id: uid(), name: 'Journal', emoji: '✍️', completedDays: {}, color: '#fbbf24' },
    ],

    // Journal
    journalEntries: [],

    // Pomodoro
    pomoSessions: [],
    pomoSettings: {
      focusMin: 25,
      breakMin: 5,
      longBreakMin: 15,
      sessionsBeforeLong: 4,
      sound: true,
      autoStartBreak: false,
    },

    // Notes
    notes: [
      {
        id: uid(),
        title: 'Welcome to Prodigy! 🎉',
        content: 'This is your premium personal productivity & wellness dashboard.\n\nTrack your habits, hydration, nutrition, focus sessions, sleep, and more.\n\nAll data is stored locally on your device — private and secure.',
        tags: ['welcome'],
        created_at: now,
        updated_at: now,
      },
    ],

    // Bookmarks
    bookmarks: [
      { id: uid(), title: 'GitHub', url: 'https://github.com', category: 'Development' },
      { id: uid(), title: 'MDN Web Docs', url: 'https://developer.mozilla.org', category: 'Reference' },
    ],

    // Settings
    settings: {
      showQuotes: true,
      showWeather: true,
      units: 'metric',
      notifications: true,
      userName: '',
    },

    quoteIdx: Math.floor(Math.random() * QUOTES.length),
    activeNote: null,
    activePage: 'dashboard',
  };
}

const saved = loadState();
const initialState = saved || makeDefaultState();
if (!saved) {
  initialState.activeNote = initialState.notes[0]?.id || null;
}

const persist = (fn) => (set, get) => fn(
  (...args) => {
    set(...args);
    const state = get();
    const toSave = { ...state };
    // Don't persist function references
    Object.keys(toSave).forEach(k => {
      if (typeof toSave[k] === 'function') delete toSave[k];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  },
  get
);

export const useStore = create(
  persist((set, get) => ({
    ...initialState,

    // Navigation
    setPage: (page) => set({ activePage: page }),

    // Theme
    setTheme: (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      set({ theme });
    },
    toggleTheme: () => {
      const newTheme = get().theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      set({ theme: newTheme });
    },
    setAccent: (color) => set({ accentColor: color }),

    // ===== WATER =====
    addWater: ({ amount_ml }) => set(s => ({
      waterLogs: [...s.waterLogs, {
        id: uid(),
        date: today(),
        amount_ml,
        time: new Date().toISOString(),
      }],
    })),
    removeWater: (id) => set(s => ({
      waterLogs: s.waterLogs.filter(w => w.id !== id),
    })),
    setWaterGoal: (ml) => set({ waterGoal: ml }),

    // ===== FOOD =====
    addFood: ({ meal_type, name, calories, protein, carbs, fat }) => set(s => ({
      foodLogs: [...s.foodLogs, {
        id: uid(),
        date: today(),
        meal_type,
        name,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        time: new Date().toISOString(),
      }],
    })),
    removeFood: (id) => set(s => ({
      foodLogs: s.foodLogs.filter(f => f.id !== id),
    })),
    addSavedMeal: (meal) => set(s => ({
      savedMeals: [...s.savedMeals, { id: uid(), ...meal }],
    })),
    removeSavedMeal: (id) => set(s => ({
      savedMeals: s.savedMeals.filter(m => m.id !== id),
    })),
    setCalorieGoal: (cal) => set({ calorieGoal: cal }),

    // ===== EXERCISE =====
    addExercise: ({ type, name, duration_min, calories_burned }) => set(s => ({
      exerciseLogs: [...s.exerciseLogs, {
        id: uid(),
        date: today(),
        type,
        name,
        duration_min: Number(duration_min) || 0,
        calories_burned: Number(calories_burned) || 0,
        time: new Date().toISOString(),
      }],
    })),
    removeExercise: (id) => set(s => ({
      exerciseLogs: s.exerciseLogs.filter(e => e.id !== id),
    })),

    // ===== SLEEP =====
    addSleep: ({ sleep_time, wake_time, quality, notes }) => set(s => ({
      sleepLogs: [...s.sleepLogs, {
        id: uid(),
        date: today(),
        sleep_time,
        wake_time,
        quality: Number(quality) || 3,
        notes: notes || '',
        time: new Date().toISOString(),
      }],
    })),
    removeSleep: (id) => set(s => ({
      sleepLogs: s.sleepLogs.filter(sl => sl.id !== id),
    })),

    // ===== TASKS =====
    addTodo: ({ title, description, priority, category, due }) => set(s => ({
      todos: [...s.todos, {
        id: uid(),
        title,
        description: description || '',
        priority: priority || 'med',
        category: category || 'Other',
        due: due || '',
        done: false,
        subtasks: [],
        created_at: Date.now(),
      }],
    })),
    toggleTodo: (id) => set(s => ({
      todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t),
    })),
    removeTodo: (id) => set(s => ({
      todos: s.todos.filter(t => t.id !== id),
    })),
    updateTodo: (id, updates) => set(s => ({
      todos: s.todos.map(t => t.id === id ? { ...t, ...updates } : t),
    })),
    clearDoneTodos: () => set(s => ({
      todos: s.todos.filter(t => !t.done),
    })),
    addSubtask: (todoId, title) => set(s => ({
      todos: s.todos.map(t => t.id === todoId ? {
        ...t,
        subtasks: [...(t.subtasks || []), { id: uid(), title, done: false }],
      } : t),
    })),
    toggleSubtask: (todoId, subtaskId) => set(s => ({
      todos: s.todos.map(t => t.id === todoId ? {
        ...t,
        subtasks: (t.subtasks || []).map(st =>
          st.id === subtaskId ? { ...st, done: !st.done } : st
        ),
      } : t),
    })),

    // ===== HABITS =====
    addHabit: ({ name, emoji, color }) => set(s => ({
      habits: [...s.habits, {
        id: uid(),
        name,
        emoji: emoji || '📌',
        completedDays: {},
        color: color || '#818cf8',
      }],
    })),
    toggleHabit: (id, date) => set(s => ({
      habits: s.habits.map(h => {
        if (h.id !== id) return h;
        const d = date || today();
        const cd = { ...h.completedDays };
        if (cd[d]) delete cd[d];
        else cd[d] = true;
        return { ...h, completedDays: cd };
      }),
    })),
    removeHabit: (id) => set(s => ({
      habits: s.habits.filter(h => h.id !== id),
    })),

    // ===== JOURNAL =====
    addJournal: ({ title, content, mood, tags }) => set(s => ({
      journalEntries: [...s.journalEntries, {
        id: uid(),
        title: title || 'Untitled Entry',
        content: content || '',
        mood: mood || '🙂',
        tags: tags || [],
        date: today(),
        created_at: new Date().toISOString(),
      }],
    })),
    updateJournal: (id, updates) => set(s => ({
      journalEntries: s.journalEntries.map(j =>
        j.id === id ? { ...j, ...updates } : j
      ),
    })),
    removeJournal: (id) => set(s => ({
      journalEntries: s.journalEntries.filter(j => j.id !== id),
    })),

    // ===== POMODORO =====
    addPomoSession: ({ duration_min, phase }) => set(s => ({
      pomoSessions: [...s.pomoSessions, {
        id: uid(),
        date: today(),
        duration_min,
        phase,
        completed_at: new Date().toISOString(),
      }],
    })),
    updatePomoSettings: (updates) => set(s => ({
      pomoSettings: { ...s.pomoSettings, ...updates },
    })),

    // ===== NOTES =====
    addNote: ({ title, content, tags }) => {
      const note = {
        id: uid(),
        title: title || 'Untitled Note',
        content: content || '',
        tags: tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set(s => ({
        notes: [...s.notes, note],
        activeNote: note.id,
      }));
    },
    updateNote: (id, updates) => set(s => ({
      notes: s.notes.map(n =>
        n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
      ),
    })),
    removeNote: (id) => set(s => ({
      notes: s.notes.filter(n => n.id !== id),
      activeNote: s.activeNote === id ? (s.notes[0]?.id || null) : s.activeNote,
    })),
    setActiveNote: (id) => set({ activeNote: id }),

    // ===== BOOKMARKS =====
    addBookmark: ({ title, url, category }) => set(s => ({
      bookmarks: [...s.bookmarks, { id: uid(), title, url, category: category || 'Other' }],
    })),
    removeBookmark: (id) => set(s => ({
      bookmarks: s.bookmarks.filter(b => b.id !== id),
    })),

    // ===== SETTINGS =====
    updateSettings: (updates) => set(s => ({
      settings: { ...s.settings, ...updates },
    })),
    nextQuote: () => set(s => ({
      quoteIdx: (s.quoteIdx + 1) % QUOTES.length,
    })),

    // ===== DATA MANAGEMENT =====
    importData: (data) => {
      if (data && data.settings) {
        set(data);
        document.documentElement.setAttribute('data-theme', data.theme || 'dark');
      }
    },
    resetData: () => {
      const fresh = makeDefaultState();
      set(fresh);
      document.documentElement.setAttribute('data-theme', 'dark');
    },
    exportData: () => {
      const state = get();
      const toExport = { ...state };
      Object.keys(toExport).forEach(k => {
        if (typeof toExport[k] === 'function') delete toExport[k];
      });
      return toExport;
    },
  }))
);

// Initialize theme on load
document.documentElement.setAttribute('data-theme', initialState.theme || 'dark');
