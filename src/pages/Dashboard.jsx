import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { today, formatDate, getGreeting, getGreetingEmoji, getProductivityScore, QUOTES } from '../utils';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { showToast } from '../components/Toast';
import { Droplets, Timer, CheckSquare, Target, TrendingUp, Sparkles, Plus, Clock, Zap } from 'lucide-react';

const Dashboard = () => {
  const { 
    habits, 
    todos, 
    pomoSessions, 
    waterLogs, 
    quoteIdx, 
    nextQuote, 
    toggleHabit, 
    addWater, 
    setPage 
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dToday = today();
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Stats calculations
  const focusTimeToday = pomoSessions
    .filter(p => p.date === dToday)
    .reduce((acc, p) => acc + p.duration, 0);
  
  const tasksToday = todos.filter(t => t.date === dToday);
  const tasksDone = tasksToday.filter(t => t.completed).length;
  
  const habitsDone = habits.filter(h => h.completedDays && h.completedDays.includes(dToday)).length;
  const habitsTotal = habits.length;

  const waterToday = waterLogs
    .filter(w => w.date === dToday)
    .reduce((acc, w) => acc + w.amount_ml, 0);

  const productivityScore = getProductivityScore(habits, todos, pomoSessions);

  const handleAddWater = () => {
    addWater({ amount_ml: 250, date: dToday });
    showToast('250ml water added!', 'success');
  };

  return (
    <div className="dashboard-page scroll-area" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>
            {getGreeting()} {getGreetingEmoji()}
          </h1>
          <p className="text-muted" style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>
            {formatDate()}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="flex items-center gap-sm" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            <Clock size={24} />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card className="stat-card glass-card">
          <div className="flex items-center gap-sm text-muted mb-2">
            <Timer className="stat-icon" size={20} color="#818CF8" />
            <span className="stat-label">Focus Time</span>
          </div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {focusTimeToday} <span className="text-sm text-muted">min</span>
          </div>
        </Card>
        
        <Card className="stat-card glass-card">
          <div className="flex items-center gap-sm text-muted mb-2">
            <CheckSquare className="stat-icon" size={20} color="#34D399" />
            <span className="stat-label">Tasks Done</span>
          </div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {tasksDone} <span className="text-sm text-muted">/ {tasksToday.length}</span>
          </div>
        </Card>

        <Card className="stat-card glass-card">
          <div className="flex items-center gap-sm text-muted mb-2">
            <Target className="stat-icon" size={20} color="#FBBF24" />
            <span className="stat-label">Habits</span>
          </div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {habitsDone} <span className="text-sm text-muted">/ {habitsTotal}</span>
          </div>
        </Card>

        <Card className="stat-card glass-card">
          <div className="flex items-center gap-sm text-muted mb-2">
            <Droplets className="stat-icon" size={20} color="#38BDF8" />
            <span className="stat-label">Water</span>
          </div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {waterToday} <span className="text-sm text-muted">ml</span>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Productivity Score */}
        <Card className="glass-card flex flex-col items-center justify-center" style={{ padding: '2rem' }}>
          <h3 className="mb-4 text-muted flex items-center gap-sm">
            <Zap size={20} /> Productivity Score
          </h3>
          <ProgressRing progress={productivityScore} size={140} strokeWidth={12} color="#818CF8" />
        </Card>

        {/* Quote & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="flex justify-between items-start">
              <Sparkles size={24} color="#FBBF24" style={{ marginBottom: '1rem' }} />
              <button className="btn btn-ghost btn-sm" onClick={nextQuote}>Next</button>
            </div>
            <p style={{ fontSize: '1.25rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              "{QUOTES[quoteIdx]?.text || 'Stay focused and never give up.'}"
            </p>
            <p className="text-sm text-muted">- {QUOTES[quoteIdx]?.author || 'Unknown'}</p>
          </Card>

          <Card className="glass-card">
            <h3 className="mb-3 text-sm text-muted">Quick Actions</h3>
            <div className="flex gap-md" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary flex items-center gap-sm" onClick={handleAddWater}>
                <Droplets size={16} /> +250ml Water
              </button>
              <button className="btn flex items-center gap-sm" onClick={() => setPage('pomodoro')} style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Timer size={16} /> Focus
              </button>
              <button className="btn flex items-center gap-sm" onClick={() => setPage('tasks')} style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Plus size={16} /> Add Task
              </button>
              <button className="btn flex items-center gap-sm" onClick={() => setPage('analytics')} style={{ background: 'rgba(255,255,255,0.1)' }}>
                <TrendingUp size={16} /> Analytics
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Today's Habits */}
      <Card className="glass-card">
        <h2 className="flex items-center gap-sm mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          <Target size={24} color="#34D399" /> Today's Habits
        </h2>
        {habits.length === 0 ? (
          <p className="text-muted">No habits added yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {habits.map(habit => {
              const isChecked = habit.completedDays?.includes(dToday);
              return (
                <div 
                  key={habit.id} 
                  className="flex items-center gap-md p-3" 
                  style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <div className={`checkbox ${isChecked ? 'checked' : ''}`} style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    border: `2px solid ${isChecked ? habit.color || '#34D399' : 'rgba(255,255,255,0.3)'}`,
                    background: isChecked ? habit.color || '#34D399' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isChecked && <CheckSquare size={14} color="#fff" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.6 : 1 }}>
                      {habit.name}
                    </div>
                  </div>
                  {habit.icon && <span style={{ fontSize: '1.2rem' }}>{habit.icon}</span>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
