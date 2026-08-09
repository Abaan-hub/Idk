import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, SkipForward, Settings, Volume2, CloudRain, Coffee, TreePine, Headphones } from 'lucide-react';
import { useStore } from '../store';
import { formatTime, today } from '../utils';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { showToast } from '../components/Toast';

export default function Focus() {
  const { pomoSessions, pomoSettings, addPomoSession, updatePomoSettings } = useStore();
  const [timeLeft, setTimeLeft] = useState(pomoSettings.focusMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('work'); // 'work', 'break', 'longbreak'
  const [sessionCount, setSessionCount] = useState(0);
  const [activeSound, setActiveSound] = useState('None');
  const [showSettings, setShowSettings] = useState(false);
  
  const audioCtx = useRef(null);

  const playBeep = () => {
    if (pomoSettings.sound) {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtx.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      [0, 0.2, 0.4].forEach(d => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 800;
        g.gain.setValueAtTime(0.3, ctx.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + d + 0.15);
        o.start(ctx.currentTime + d);
        o.stop(ctx.currentTime + d + 0.15);
      });
    }
  };

  const getDurationForPhase = (p) => {
    switch (p) {
      case 'work': return pomoSettings.focusMin * 60;
      case 'break': return pomoSettings.breakMin * 60;
      case 'longbreak': return pomoSettings.longBreakMin * 60;
      default: return 25 * 60;
    }
  };

  const handlePhaseComplete = () => {
    if (phase === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      addPomoSession({ duration_min: pomoSettings.focusMin, phase: 'work' });
      
      if (newCount > 0 && newCount % pomoSettings.sessionsBeforeLong === 0) {
        setPhase('longbreak');
        setTimeLeft(getDurationForPhase('longbreak'));
      } else {
        setPhase('break');
        setTimeLeft(getDurationForPhase('break'));
      }
      
      if (!pomoSettings.autoStartBreak) {
        setIsRunning(false);
      }
    } else {
      setPhase('work');
      setTimeLeft(getDurationForPhase('work'));
      setIsRunning(false);
    }
    playBeep();
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForPhase(phase));
    }
  }, [pomoSettings.focusMin, pomoSettings.breakMin, pomoSettings.longBreakMin, phase]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForPhase(phase));
  };
  
  const skipPhase = () => {
    handlePhaseComplete();
  };

  const totalDuration = getDurationForPhase(phase);
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  const todaySessions = (pomoSessions || []).filter(s => s.date === today() && s.phase === 'work');
  const todayMinutes = todaySessions.reduce((acc, curr) => acc + curr.duration_min, 0);

  const phaseColors = {
    work: 'var(--color-primary, #6366f1)',
    break: 'var(--color-success, #22c55e)',
    longbreak: 'var(--color-accent, #8b5cf6)'
  };

  return (
    <motion.div className="page page-container" style={{padding: '24px'}} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
      <div className="flex items-center gap-md" style={{justifyContent: 'space-between', marginBottom: '24px'}}>
        <h1><span className="gradient-text">Focus</span></h1>
        <button className="btn btn-ghost btn-icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={20} />
        </button>
      </div>

      <div className="grid-3" style={{marginBottom: '24px'}}>
        <div className="stat-card">
          <div className="stat-label text-muted text-sm">Today's Focus</div>
          <div className="stat-value">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</div>
        </div>
        <div className="stat-card">
          <div className="stat-label text-muted text-sm">Sessions Completed</div>
          <div className="stat-value">{todaySessions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label text-muted text-sm">Current Streak</div>
          <div className="stat-value">{sessionCount}</div>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns: '1fr', gap: '24px', '@media(min-width: 768px)': {gridTemplateColumns: '2fr 1fr'}}}>
        <Card className="glass-card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px'}}>
          <div style={{marginBottom: '24px', display: 'flex', gap: '8px'}} className="flex gap-sm">
            {['work', 'break', 'longbreak'].map(p => (
              <div 
                key={p} 
                onClick={() => { if(!isRunning) { setPhase(p); setTimeLeft(getDurationForPhase(p)); } }}
                className={`badge ${phase === p ? 'active' : ''}`}
                style={{
                  cursor: isRunning ? 'default' : 'pointer',
                  backgroundColor: phase === p ? phaseColors[p] : 'transparent',
                  color: phase === p ? 'white' : 'var(--text-muted)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: `1px solid ${phase === p ? phaseColors[p] : 'var(--border-color)'}`
                }}
              >
                {p === 'work' ? 'Focus' : p === 'break' ? 'Short Break' : 'Long Break'}
              </div>
            ))}
          </div>

          <div style={{position: 'relative', margin: '32px 0'}}>
            <ProgressRing 
              size={220} 
              progress={progress} 
              strokeWidth={12}
              color={phaseColors[phase]}
              label={formatTime(timeLeft)}
            />
          </div>

          <div className="flex gap-md items-center" style={{marginTop: '24px', display: 'flex', gap: '16px'}}>
            <button className="btn btn-ghost btn-icon" onClick={resetTimer} title="Reset">
              <Square size={24} />
            </button>
            <button 
              className="btn btn-primary" 
              style={{width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: phaseColors[phase]}} 
              onClick={toggleTimer}
            >
              {isRunning ? <Pause size={32} /> : <Play size={32} style={{marginLeft: '4px'}} />}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={skipPhase} title="Skip">
              <SkipForward size={24} />
            </button>
          </div>
          
          <div className="flex gap-sm" style={{marginTop: '24px', display: 'flex', gap: '8px'}}>
            {Array.from({length: pomoSettings.sessionsBeforeLong}).map((_, i) => (
              <div key={i} style={{
                width: '12px', height: '12px', borderRadius: '50%', 
                backgroundColor: i < (sessionCount % pomoSettings.sessionsBeforeLong) ? phaseColors.work : 'var(--border-color)'
              }} />
            ))}
          </div>
        </Card>

        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          {showSettings && (
            <Card className="glass-card">
              <h3 style={{marginBottom: '16px'}}>Settings</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label className="text-sm text-muted">Focus Duration (min)</label>
                  <input type="number" className="input" style={{width: '100%', marginTop: '4px'}} value={pomoSettings.focusMin} onChange={e => updatePomoSettings({focusMin: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-sm text-muted">Short Break (min)</label>
                  <input type="number" className="input" style={{width: '100%', marginTop: '4px'}} value={pomoSettings.breakMin} onChange={e => updatePomoSettings({breakMin: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-sm text-muted">Long Break (min)</label>
                  <input type="number" className="input" style={{width: '100%', marginTop: '4px'}} value={pomoSettings.longBreakMin} onChange={e => updatePomoSettings({longBreakMin: Number(e.target.value)})} />
                </div>
                <div className="flex items-center" style={{justifyContent: 'space-between', marginTop: '8px'}}>
                  <label className="text-sm">Sound & Notifications</label>
                  <input type="checkbox" checked={pomoSettings.sound} onChange={e => updatePomoSettings({sound: e.target.checked})} />
                </div>
                <div className="flex items-center" style={{justifyContent: 'space-between', marginTop: '8px'}}>
                  <label className="text-sm">Auto-start Breaks</label>
                  <input type="checkbox" checked={pomoSettings.autoStartBreak} onChange={e => updatePomoSettings({autoStartBreak: e.target.checked})} />
                </div>
              </div>
            </Card>
          )}

          <Card className="glass-card">
            <h3 style={{marginBottom: '16px'}}>Ambient Sound</h3>
            <div className="grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
              {[
                {id: 'Rain', icon: CloudRain},
                {id: 'Cafe', icon: Coffee},
                {id: 'Forest', icon: TreePine},
                {id: 'Lo-fi', icon: Headphones},
                {id: 'None', icon: Volume2}
              ].map(s => (
                <button 
                  key={s.id}
                  className={`btn btn-sm ${activeSound === s.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveSound(s.id)}
                  style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start'}}
                >
                  <s.icon size={16} /> {s.id}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
