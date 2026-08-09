import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { today, formatDate, getGreeting, getGreetingEmoji, getProductivityScore, QUOTES } from '../utils';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { showToast } from '../components/Toast';
import { Droplets, Timer, CheckSquare, Target, Sparkles, Clock, Zap, ArrowRight, Check } from 'lucide-react';

export default function Dashboard() {
  const habits = useStore(s => s.habits);
  const todos = useStore(s => s.todos);
  const pomoSessions = useStore(s => s.pomoSessions);
  const waterLogs = useStore(s => s.waterLogs);
  const foodLogs = useStore(s => s.foodLogs);
  const quoteIdx = useStore(s => s.quoteIdx);
  const nextQuote = useStore(s => s.nextQuote);
  const toggleHabit = useStore(s => s.toggleHabit);
  const addWater = useStore(s => s.addWater);
  const setPage = useStore(s => s.setPage);

  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const d = today();

  // Stats
  const focusMin = pomoSessions.filter(s => s.date === d).reduce((a, s) => a + (s.duration_min || 0), 0);
  const tasksDone = todos.filter(t => t.done).length;
  const habitsDone = habits.filter(h => h.completedDays?.[d]).length;
  const waterMl = waterLogs.filter(w => w.date === d).reduce((a, w) => a + w.amount_ml, 0);
  const score = getProductivityScore(habits, todos, pomoSessions);

  // Timeline entries
  const timelineEntries = [
    ...waterLogs.filter(w => w.date === d).map(w => ({
      time: new Date(w.time),
      icon: '💧',
      label: `${w.amount_ml}ml water`,
      color: '#38bdf8',
    })),
    ...foodLogs.filter(f => f.date === d).map(f => ({
      time: new Date(f.time),
      icon: '🍽️',
      label: `${f.name || f.meal_type} (${f.calories} cal)`,
      color: '#fbbf24',
    })),
    ...pomoSessions.filter(s => s.date === d).map(s => ({
      time: new Date(s.completed_at),
      icon: '🍅',
      label: `${s.duration_min}min focus`,
      color: '#818cf8',
    })),
  ].sort((a, b) => b.time - a.time).slice(0, 8);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {getGreeting()} {getGreetingEmoji()}
          </h1>
          <p className="text-muted" style={{ fontSize: 14 }}>{formatDate()}</p>
        </div>
        <div className="flex items-center gap-sm" style={{ fontSize: 14, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          <Clock size={16} />
          <span>{clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { icon: '⏱️', value: `${focusMin}m`, label: 'Focus', color: '#818cf8' },
          { icon: '✅', value: `${tasksDone}/${todos.length}`, label: 'Tasks', color: '#34d399' },
          { icon: '🔥', value: `${habitsDone}/${habits.length}`, label: 'Habits', color: '#fbbf24' },
          { icon: '💧', value: `${waterMl}ml`, label: 'Water', color: '#38bdf8' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Score + Quote Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 20 }}>
        {/* Productivity Score */}
        <Card className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, minWidth: 180 }}>
          <ProgressRing progress={score / 100} size={130} strokeWidth={10} label={`${score}`} sublabel="score" />
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            <Zap size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Productivity
          </div>
        </Card>

        {/* Quote */}
        <Card className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Sparkles size={20} color="#fbbf24" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontStyle: 'italic', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              "{QUOTES[quoteIdx % QUOTES.length]}"
            </p>
          </div>
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={nextQuote}>✨ New Quote</button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title"><Zap size={18} /> Quick Actions</div>
        </div>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { addWater({ amount_ml: 250 }); showToast('💧 250ml added!'); }}>
            <Droplets size={16} /> +250ml Water
          </button>
          <button className="btn" onClick={() => setPage('focus')}>
            <Timer size={16} /> Start Focus
          </button>
          <button className="btn" onClick={() => setPage('tasks')}>
            <CheckSquare size={16} /> Add Task
          </button>
          <button className="btn" onClick={() => setPage('analytics')}>
            <ArrowRight size={16} /> Analytics
          </button>
        </div>
      </Card>

      {/* Today's Habits */}
      <Card className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title"><Target size={18} /> Today's Habits</div>
          <span className="badge badge-accent">{habitsDone}/{habits.length}</span>
        </div>
        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p className="empty-text">No habits yet. Add some in the Habits page!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {habits.map(h => {
              const done = !!h.completedDays?.[d];
              return (
                <div
                  key={h.id}
                  className="list-item"
                  style={{ cursor: 'pointer', borderRadius: 10, padding: '10px 14px' }}
                  onClick={() => toggleHabit(h.id)}
                >
                  <div className={`checkbox ${done ? 'checked' : ''}`}>
                    {done && <Check size={14} />}
                  </div>
                  <span style={{ fontSize: 20 }}>{h.emoji}</span>
                  <span style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: done ? 'line-through' : 'none',
                    opacity: done ? 0.5 : 1,
                  }}>{h.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Activity Timeline */}
      {timelineEntries.length > 0 && (
        <Card className="glass-card">
          <div className="card-header">
            <div className="card-title"><Clock size={18} /> Today's Activity</div>
          </div>
          <div className="flex-col gap-xs">
            {timelineEntries.map((e, i) => (
              <div key={i} className="flex items-center gap-md" style={{ padding: '8px 0', borderBottom: i < timelineEntries.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: e.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${e.color}60`,
                }} />
                <span className="text-muted text-sm" style={{ width: 70, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {e.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{e.icon}</span>
                <span style={{ fontSize: 14 }}>{e.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
