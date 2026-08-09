import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { today, formatDate, getGreeting, getGreetingEmoji, getProductivityScore, QUOTES } from '../utils';
import ProgressRing from '../components/ProgressRing';
import { showToast } from '../components/Toast';
import {
  Droplets, Timer, CheckSquare, Target, Sparkles, Clock, Zap,
  ArrowRight, Check, Activity, TrendingUp, Flame, Plus, Play
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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
  const focusMin = pomoSessions.filter(s => s.date === d).reduce((a, s) => a + (s.duration_min || 0), 0);
  const tasksDone = todos.filter(t => t.done).length;
  const habitsDone = habits.filter(h => h.completedDays?.[d]).length;
  const waterMl = waterLogs.filter(w => w.date === d).reduce((a, w) => a + w.amount_ml, 0);
  const score = getProductivityScore(habits, todos, pomoSessions);

  const timelineEntries = [
    ...waterLogs.filter(w => w.date === d).map(w => ({
      time: new Date(w.time), icon: <Droplets size={14} />, label: `${w.amount_ml}ml water`, color: '#22d3ee',
    })),
    ...foodLogs.filter(f => f.date === d).map(f => ({
      time: new Date(f.time), icon: <Flame size={14} />, label: `${f.name || f.meal_type} · ${f.calories} cal`, color: '#fbbf24',
    })),
    ...pomoSessions.filter(s => s.date === d).map(s => ({
      time: new Date(s.completed_at), icon: <Timer size={14} />, label: `${s.duration_min}min focus`, color: '#a78bfa',
    })),
  ].sort((a, b) => b.time - a.time).slice(0, 6);

  const stats = [
    { icon: <Timer size={18} />, value: `${focusMin}m`, label: 'Focus', cls: 'purple' },
    { icon: <CheckSquare size={18} />, value: `${tasksDone}/${todos.length}`, label: 'Tasks', cls: 'green' },
    { icon: <Target size={18} />, value: `${habitsDone}/${habits.length}`, label: 'Habits', cls: 'amber' },
    { icon: <Droplets size={18} />, value: `${waterMl}ml`, label: 'Water', cls: 'cyan' },
  ];

  return (
    <motion.div className="page" initial="hidden" animate="visible" variants={stagger}>

      {/* ── Header ── */}
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>
            <span className="gradient-text">{getGreeting()}</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{formatDate()}</p>
        </div>
        <div className="flex items-center gap-sm" style={{ fontSize: 13, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums', marginTop: 6 }}>
          <Clock size={14} />
          {clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div variants={fadeUp} className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className={`stat-card-premium ${s.cls}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <div className="stat-card-label">
              <span className={`icon-box sm ${s.cls}`}>{s.icon}</span>
              {s.label}
            </div>
            <div className="stat-card-value">{s.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Score + Quote ── */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 20 }}>
        <div className="glow-card animated-border" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, minWidth: 180 }}>
          <ProgressRing progress={score / 100} size={130} strokeWidth={10} label={`${score}`} sublabel="score" color="#a78bfa" />
          <div className="flex items-center gap-xs" style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5 }}>
            <Zap size={12} /> PRODUCTIVITY
          </div>
        </div>

        <div className="glow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="flex items-center gap-sm" style={{ marginBottom: 14 }}>
              <span className="icon-box sm amber"><Sparkles size={16} /></span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Daily Inspiration</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: 'italic', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              "{QUOTES[quoteIdx % QUOTES.length]}"
            </p>
          </div>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={nextQuote}>
              <Sparkles size={14} /> New Quote
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div variants={fadeUp} className="glow-card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">
            <span className="icon-box sm purple"><Zap size={16} /></span>
            Quick Actions
          </div>
        </div>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { addWater({ amount_ml: 250 }); showToast('Added 250ml water'); }}>
            <Droplets size={16} /> +250ml
          </button>
          <button className="btn" onClick={() => setPage('focus')}>
            <Play size={16} /> Focus
          </button>
          <button className="btn" onClick={() => setPage('tasks')}>
            <Plus size={16} /> New Task
          </button>
          <button className="btn" onClick={() => setPage('analytics')}>
            <TrendingUp size={16} /> Analytics
          </button>
        </div>
      </motion.div>

      {/* ── Today's Habits ── */}
      <motion.div variants={fadeUp} className="glow-card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">
            <span className="icon-box sm green"><Target size={16} /></span>
            Today's Habits
          </div>
          <span className="badge badge-accent">{habitsDone}/{habits.length}</span>
        </div>
        {habits.length === 0 ? (
          <div className="empty-state">
            <Target size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p className="empty-text">No habits yet — set some up in the Habits page</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
            {habits.map(h => {
              const done = !!h.completedDays?.[d];
              return (
                <div
                  key={h.id}
                  className="list-item"
                  style={{ cursor: 'pointer', borderRadius: 10, padding: '10px 14px' }}
                  onClick={() => toggleHabit(h.id)}
                >
                  <div
                    className={`checkbox ${done ? 'checked habit-check-done' : ''}`}
                    style={{ width: 22, height: 22 }}
                  >
                    {done && <Check size={13} />}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 14, fontWeight: 500,
                    textDecoration: done ? 'line-through' : 'none',
                    opacity: done ? 0.45 : 1,
                  }}>{h.name}</span>
                  {done && <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Done</span>}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Activity Timeline ── */}
      {timelineEntries.length > 0 && (
        <motion.div variants={fadeUp} className="glow-card">
          <div className="section-header">
            <div className="section-title">
              <span className="icon-box sm rose"><Activity size={16} /></span>
              Today's Activity
            </div>
          </div>
          <div className="flex-col">
            {timelineEntries.map((e, i) => (
              <div key={i} className="flex items-center gap-md" style={{
                padding: '10px 0',
                borderBottom: i < timelineEntries.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: e.color, flexShrink: 0,
                  boxShadow: `0 0 10px ${e.color}40`,
                }} />
                <span style={{ width: 65, flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontSize: 12, color: 'var(--text-dim)' }}>
                  {e.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ color: e.color, display: 'flex' }}>{e.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{e.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
