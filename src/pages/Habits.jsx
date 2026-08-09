import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { HABIT_EMOJIS, getHabitStreak, today, daysAgo } from '../utils';
import Card from '../components/Card';
import { showToast } from '../components/Toast';
import { 
  Activity, Plus, Trash2, Check, LayoutGrid, 
  Flame, Trophy, Target, TrendingUp
} from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

const Habits = () => {
  const { habits, addHabit, toggleHabit, removeHabit } = useStore();
  
  const [newHabit, setNewHabit] = useState({ name: '', emoji: HABIT_EMOJIS[0] || '💧', color: COLORS[4] });
  
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return showToast('Habit name is required', 'error');
    addHabit(newHabit);
    setNewHabit({ name: '', emoji: HABIT_EMOJIS[0] || '💧', color: COLORS[4] });
    showToast('Habit added successfully', 'success');
  };

  const stats = useMemo(() => {
    if (!habits.length) return { total: 0, today: 0, rate: 0, bestStreak: 0 };
    const t = today();
    let completedToday = 0;
    let maxStreak = 0;
    let totalExpected = habits.length * 30; // approx 30 days
    let totalCompleted = 0;

    habits.forEach(h => {
      if (h.completedDays?.[t]) completedToday++;
      const { current, best } = getHabitStreak(h.completedDays);
      if (best > maxStreak) maxStreak = best;
      totalCompleted += Object.keys(h.completedDays || {}).length;
    });

    const rate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    return {
      total: habits.length,
      today: completedToday,
      rate: Math.min(rate, 100),
      bestStreak: maxStreak
    };
  }, [habits]);

  const heatmapDays = useMemo(() => {
    const days = [];
    for (let i = 83; i >= 0; i--) {
      days.push(daysAgo(i));
    }
    return days;
  }, []);

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-sm mb-6">
        <Activity className="text-primary" size={28} />
        <h1 className="text-3xl font-bold">Habits</h1>
      </div>

      <div className="grid-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Habits', value: stats.total, icon: LayoutGrid, color: 'text-blue-500' },
          { label: 'Done Today', value: `${stats.today}/${stats.total}`, icon: Target, color: 'text-green-500' },
          { label: 'Completion Rate', value: `${stats.rate}%`, icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Best Streak', value: `${stats.bestStreak} days`, icon: Trophy, color: 'text-amber-500' }
        ].map((stat, i) => (
          <Card key={i} className="stat-card p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full bg-surface ${stat.color}`}>
              <stat.icon size={24} className="stat-icon" />
            </div>
            <div>
              <div className="stat-label text-sm text-muted">{stat.label}</div>
              <div className="stat-value text-2xl font-bold">{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mb-8 p-4">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 p-1 bg-surface rounded-lg">
            <select 
              className="select bg-transparent border-none text-xl w-16 px-1 cursor-pointer focus:ring-0"
              value={newHabit.emoji}
              onChange={e => setNewHabit({...newHabit, emoji: e.target.value})}
            >
              {HABIT_EMOJIS.map(emoji => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
          </div>
          
          <input 
            type="text" 
            className="input flex-1 min-w-[200px]" 
            placeholder="What habit do you want to build?" 
            value={newHabit.name}
            onChange={e => setNewHabit({...newHabit, name: e.target.value})}
          />
          
          <div className="flex gap-1 bg-surface p-1 rounded-lg">
            {COLORS.slice(0, 6).map(color => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                onClick={() => setNewHabit({...newHabit, color})}
              >
                {newHabit.color === color && <Check size={14} className="text-white drop-shadow-md" />}
              </button>
            ))}
          </div>

          <button type="submit" className="btn btn-primary">
            <Plus size={20} /> Add Habit
          </button>
        </form>
      </Card>

      <div className="space-y-4 pb-20">
        <AnimatePresence>
          {habits.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="empty-state p-12 text-center text-muted border-2 border-dashed border-border rounded-xl"
            >
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">No habits yet</h3>
              <p className="text-sm">Start building positive routines by adding your first habit.</p>
            </motion.div>
          ) : (
            habits.map(habit => {
              const { current, best } = getHabitStreak(habit.completedDays);
              const isDoneToday = !!habit.completedDays?.[today()];
              
              return (
                <motion.div 
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-4 rounded-xl border border-border/50 shadow-sm transition-all hover:border-border"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-center gap-4 min-w-[300px]">
                      <button 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${isDoneToday ? 'scale-105 shadow-lg' : 'opacity-70 hover:opacity-100 bg-surface'}`}
                        style={{ backgroundColor: isDoneToday ? habit.color : undefined, color: isDoneToday ? '#fff' : undefined }}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        {isDoneToday ? <Check size={24} strokeWidth={3} /> : habit.emoji}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{habit.name}</h3>
                        <div className="flex items-center gap-4 text-sm mt-1">
                          <span className="flex items-center gap-1 font-medium" style={{ color: habit.color }}>
                            <Flame size={16} /> {current}
                          </span>
                          <span className="flex items-center gap-1 text-muted">
                            <Trophy size={16} /> {best}
                          </span>
                        </div>
                      </div>

                      <button 
                        className="btn btn-ghost btn-icon btn-danger text-muted hover:text-danger hover:bg-danger/10"
                        onClick={() => removeHabit(habit.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center justify-end overflow-hidden">
                      <div className="heatmap flex flex-wrap gap-1" style={{ maxWidth: '350px' }}>
                        {heatmapDays.map(date => {
                          const done = !!habit.completedDays?.[date];
                          return (
                            <div 
                              key={date}
                              title={date}
                              className={`heatmap-cell w-3 h-3 rounded-sm ${done ? 'level-4' : 'bg-surface'}`}
                              style={done ? { backgroundColor: habit.color } : {}}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Habits;
