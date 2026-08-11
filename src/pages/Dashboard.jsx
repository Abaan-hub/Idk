import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { today, formatDate, getGreeting, getGreetingEmoji, getProductivityScore, QUOTES } from '../utils';
import ProgressRing from '../components/ProgressRing';
import { showToast } from '../components/Toast';
import { Droplets, Timer, CheckSquare, Target, Sparkles, Clock, Zap, TrendingUp, Play, Plus, Activity, Check, Flame } from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } } };

export default function Dashboard() {
  const habits      = useStore(s => s.habits);
  const todos       = useStore(s => s.todos);
  const pomoSessions= useStore(s => s.pomoSessions);
  const waterLogs   = useStore(s => s.waterLogs);
  const foodLogs    = useStore(s => s.foodLogs);
  const quoteIdx    = useStore(s => s.quoteIdx);
  const nextQuote   = useStore(s => s.nextQuote);
  const toggleHabit = useStore(s => s.toggleHabit);
  const addWater    = useStore(s => s.addWater);
  const setPage     = useStore(s => s.setPage);

  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const d = today();
  const focusMin  = pomoSessions.filter(s => s.date === d).reduce((a, s) => a + (s.duration_min || 0), 0);
  const tasksDone = todos.filter(t => t.done).length;
  const habitsDone= habits.filter(h => h.completedDays?.[d]).length;
  const waterMl   = waterLogs.filter(w => w.date === d).reduce((a, w) => a + w.amount_ml, 0);
  const score     = getProductivityScore(habits, todos, pomoSessions);
  const waterPct  = Math.min(100, Math.round((waterMl / 2500) * 100));

  const timeline = [
    ...waterLogs.filter(w => w.date === d).map(w => ({ time: new Date(w.time), icon: <Droplets size={13}/>, label: `${w.amount_ml}ml water`, color: '#22d3ee' })),
    ...foodLogs.filter(f => f.date === d).map(f => ({ time: new Date(f.time), icon: <Flame size={13}/>, label: `${f.name || f.meal_type} · ${f.calories} kcal`, color: '#fbbf24' })),
    ...pomoSessions.filter(s => s.date === d).map(s => ({ time: new Date(s.completed_at), icon: <Timer size={13}/>, label: `${s.duration_min}min deep focus`, color: '#a78bfa' })),
  ].sort((a, b) => b.time - a.time).slice(0, 6);

  return (
    <motion.div className="page" initial="hidden" animate="visible" variants={stagger}>

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>
            <span className="gradient-text">{getGreeting()}</span>
            <span style={{ marginLeft: 8, fontSize: 28 }}>{getGreetingEmoji()}</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>{formatDate()}</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 'var(--r-full)',
          background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          fontSize: 13, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums',
        }}>
          <Clock size={14} style={{ color: 'var(--violet-light)' }} />
          {clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </motion.div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { icon: <Timer size={16}/>,       value: focusMin ? `${focusMin}m` : '—', label: 'Focus',  cls: 'purple', sub: focusMin > 0 ? 'deep work' : 'start a session' },
          { icon: <CheckSquare size={16}/>, value: `${tasksDone}/${todos.length}`,  label: 'Tasks',  cls: 'green',  sub: todos.length - tasksDone > 0 ? `${todos.length - tasksDone} remaining` : 'all done!' },
          { icon: <Target size={16}/>,      value: `${habitsDone}/${habits.length}`,label: 'Habits', cls: 'amber',  sub: `${habits.length > 0 ? Math.round((habitsDone / habits.length) * 100) : 0}% complete` },
          { icon: <Droplets size={16}/>,    value: `${waterMl}ml`,                  label: 'Water',  cls: 'cyan',   sub: `${waterPct}% of goal` },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={`stat-card ${s.cls}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.07, duration: 0.35 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
          >
            <div className="stat-label">
              <span className={`icon-box sm ${s.cls}`}>{s.icon}</span>
              {s.label}
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Score + Quote ──────────────────────────────────── */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 20 }}>

        {/* Animated border ring card */}
        <div className="animated-border" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '28px 32px', minWidth: 190,
        }}>
          <ProgressRing progress={score / 100} size={120} strokeWidth={10} label={`${score}`} sublabel="score" color="#a78bfa" />
          <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Zap size={11} style={{ color: 'var(--violet-light)' }} /> Productivity
          </div>
        </div>

        {/* Quote */}
        <div className="glow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span className="icon-box sm amber"><Sparkles size={15}/></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Daily Insight</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: 'italic', lineHeight: 1.75, color: 'var(--text-2)' }}>
              "{QUOTES[quoteIdx % QUOTES.length]}"
            </p>
          </div>
          <div style={{ textAlign: 'right', marginTop: 18 }}>
            <button className="btn btn-ghost btn-sm" onClick={nextQuote}>
              <Sparkles size={12}/> New
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <motion.div variants={fadeUp} className="glass-card" style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 14 }}>
          <div className="section-title">
            <span className="icon-box sm purple"><Zap size={14}/></span>
            Quick Actions
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { addWater({ amount_ml: 250 }); showToast('💧 +250ml logged'); }}>
            <Droplets size={15}/> Log Water
          </button>
          <button className="btn" onClick={() => setPage('focus')}>
            <Play size={15}/> Focus
          </button>
          <button className="btn" onClick={() => setPage('tasks')}>
            <Plus size={15}/> Task
          </button>
          <button className="btn" onClick={() => setPage('nutrition')}>
            <Flame size={15}/> Log Food
          </button>
          <button className="btn" onClick={() => setPage('analytics')}>
            <TrendingUp size={15}/> Analytics
          </button>
        </div>
      </motion.div>

      {/* ── Habits ────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="glass-card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">
            <span className="icon-box sm green"><Target size={14}/></span>
            Today's Habits
          </div>
          <span className="badge badge-accent">{habitsDone} / {habits.length}</span>
        </div>

        {habits.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div className="empty-icon"><Target size={36}/></div>
            <p className="empty-text">No habits yet — add them in the Habits page</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 6 }}>
            {habits.map(h => {
              const done = !!h.completedDays?.[d];
              return (
                <motion.div
                  key={h.id}
                  className="list-item"
                  onClick={() => toggleHabit(h.id)}
                  style={{ cursor: 'pointer' }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`checkbox ${done ? 'checked' : ''}`}>
                    {done && <Check size={12}/>}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: 500,
                    color: done ? 'var(--text-3)' : 'var(--text-2)',
                    textDecoration: done ? 'line-through' : 'none',
                  }}>{h.name}</span>
                  {done && <span style={{ fontSize: 10, color: 'var(--violet-light)', fontWeight: 700 }}>✓</span>}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Activity Timeline ──────────────────────────────── */}
      {timeline.length > 0 && (
        <motion.div variants={fadeUp} className="glass-card">
          <div className="section-header">
            <div className="section-title">
              <span className="icon-box sm rose"><Activity size={14}/></span>
              Today's Activity
            </div>
          </div>
          <div>
            {timeline.map((e, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '9px 0',
                borderBottom: i < timeline.length - 1 ? '1px solid var(--glass-border)' : 'none',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: e.color, flexShrink: 0, boxShadow: `0 0 8px ${e.color}60` }} />
                <span style={{ width: 62, flexShrink: 0, fontSize: 11, color: 'var(--text-4)', fontVariantNumeric: 'tabular-nums' }}>
                  {e.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ color: e.color, display: 'flex', flexShrink: 0 }}>{e.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{e.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
