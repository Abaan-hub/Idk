export function today() {
  return new Date().toISOString().split('T')[0];
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function uid() {
  return crypto.randomUUID();
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getGreetingEmoji() {
  const h = new Date().getHours();
  if (h < 12) return '☀️';
  if (h < 17) return '🌤️';
  return '🌙';
}

export function formatDate(date) {
  return new Date(date || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeOfDay(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function hostname(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getHabitStreak(completedDays) {
  let current = 0;
  let best = 0;
  for (let i = 0; i < 365; i++) {
    if (completedDays[daysAgo(i)]) {
      current++;
      best = Math.max(best, current);
    } else {
      if (i === 0) continue; // today not done yet is ok
      break;
    }
  }
  // recalculate best independently
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    if (completedDays[daysAgo(i)]) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }
  return { current, best };
}

export function getProductivityScore(habits, todos, pomoSessions) {
  let score = 0;
  const d = today();
  if (habits.length) {
    const done = habits.filter(h => h.completedDays[d]).length;
    score += Math.round((done / habits.length) * 40);
  }
  if (todos.length) {
    const done = todos.filter(t => t.done).length;
    score += Math.round((done / todos.length) * 30);
  }
  const focusMin = pomoSessions
    .filter(s => s.date === d)
    .reduce((a, s) => a + s.duration_min, 0);
  if (focusMin >= 120) score += 30;
  else if (focusMin >= 60) score += 20;
  else if (focusMin >= 30) score += 10;
  else if (focusMin > 0) score += 5;
  return Math.min(100, score);
}

export const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Focus on being productive instead of busy. — Tim Ferriss",
  "Do what you can, with what you have, where you are. — T. Roosevelt",
  "The way to get started is to quit talking and begin doing. — Walt Disney",
  "Productivity is never an accident. — Paul J. Meyer",
  "Action is the foundational key to all success. — Picasso",
  "Your future is created by what you do today. — R. Kiyosaki",
  "It is not enough to be busy. — Thoreau",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "Success is the sum of small efforts, repeated daily. — Robert Collier",
  "The best time to plant a tree was 20 years ago. The second best is now.",
  "Amateurs sit and wait for inspiration. The rest of us get to work. — Stephen King",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
];

export const TASK_CATEGORIES = [
  ['💼', 'Work'],
  ['👤', 'Personal'],
  ['🏋️', 'Health'],
  ['📖', 'Learn'],
  ['🎨', 'Creative'],
  ['📌', 'Other'],
];

export const HABIT_EMOJIS = [
  '🏃', '💪', '📚', '🧘', '💧', '🍎', '💤', '✍️', '🎵', '🧹',
  '💊', '🌅', '🧠', '🎯', '💰', '❤️', '🚶', '🙏', '🎨', '📝',
];

export const JOURNAL_MOODS = [
  { emoji: '😄', label: 'Great', color: '#34d399' },
  { emoji: '🙂', label: 'Good', color: '#60a5fa' },
  { emoji: '😐', label: 'Okay', color: '#fbbf24' },
  { emoji: '😔', label: 'Low', color: '#f97316' },
  { emoji: '😢', label: 'Bad', color: '#f87171' },
];

export const JOURNAL_PROMPTS = [
  "What are you grateful for today?",
  "What's one thing you learned today?",
  "Describe a challenge you overcame recently.",
  "What made you smile today?",
  "What would you do differently today?",
  "Write about a goal you're working towards.",
  "What's something you're looking forward to?",
  "Describe your ideal day.",
  "What's a habit you'd like to build?",
  "Write about someone who inspires you.",
];
