import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Moon, Sun, Clock, Trash2, Info } from 'lucide-react';
import { useStore } from '../store';
import { today } from '../utils';
import Card from '../components/Card';
import { showToast } from '../components/Toast';

export default function Sleep() {
  const { sleepLogs, addSleep, removeSleep } = useStore();
  
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');

  const calculateDurationHours = (bed, wake) => {
    if (!bed || !wake) return 0;
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    
    let bedDate = new Date();
    bedDate.setHours(bH, bM, 0, 0);
    
    let wakeDate = new Date();
    wakeDate.setHours(wH, wM, 0, 0);
    
    if (wakeDate <= bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }
    
    const diffMs = wakeDate - bedDate;
    return diffMs / (1000 * 60 * 60);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const duration = calculateDurationHours(bedtime, wakeTime);
    if (duration > 24) {
      showToast('Duration cannot exceed 24 hours');
      return;
    }
    addSleep({ sleep_time: bedtime, wake_time: wakeTime, quality, notes });
    showToast('Sleep logged successfully');
    setNotes('');
  };

  const getDurationColor = (hours) => {
    if (hours < 6) return 'var(--color-danger, #ef4444)';
    if (hours < 7) return 'var(--color-warning, #f59e0b)';
    if (hours < 8) return 'var(--color-accent, #8b5cf6)';
    return 'var(--color-success, #22c55e)';
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const safeLogs = sleepLogs || [];

  const avgDuration = safeLogs.length > 0 
    ? safeLogs.reduce((acc, log) => acc + calculateDurationHours(log.sleep_time, log.wake_time), 0) / safeLogs.length 
    : 0;

  const avgQuality = safeLogs.length > 0
    ? safeLogs.reduce((acc, log) => acc + log.quality, 0) / safeLogs.length
    : 0;

  const bestNight = safeLogs.length > 0
    ? [...safeLogs].sort((a, b) => b.quality - a.quality || calculateDurationHours(b.sleep_time, b.wake_time) - calculateDurationHours(a.sleep_time, a.wake_time))[0]
    : null;

  return (
    <motion.div className="page" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
      <div className="flex items-center gap-md" style={{marginBottom: '24px'}}>
        <h1><span className="gradient-text">Sleep Tracker</span></h1>
      </div>

      <div className="grid-4" style={{marginBottom: '24px', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
        <div className="stat-card">
          <div className="stat-icon" style={{marginBottom: '8px'}}><Clock size={20} className="text-muted" /></div>
          <div className="stat-label text-sm text-muted">Avg Duration</div>
          <div className="stat-value" style={{color: getDurationColor(avgDuration), fontSize: '1.5rem', fontWeight: 'bold'}}>{formatDuration(avgDuration)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{marginBottom: '8px'}}><Star size={20} className="text-muted" /></div>
          <div className="stat-label text-sm text-muted">Avg Quality</div>
          <div className="stat-value" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{avgQuality.toFixed(1)} / 5</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{marginBottom: '8px'}}><Moon size={20} className="text-muted" /></div>
          <div className="stat-label text-sm text-muted">Best Night</div>
          <div className="stat-value text-sm" style={{fontSize: '1.2rem', fontWeight: 'bold', minHeight: '36px', display: 'flex', alignItems: 'center'}}>
            {bestNight ? `${formatDuration(calculateDurationHours(bestNight.sleep_time, bestNight.wake_time))} (${bestNight.quality}★)` : '-'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{marginBottom: '8px'}}><Info size={20} className="text-muted" /></div>
          <div className="stat-label text-sm text-muted">Total Logs</div>
          <div className="stat-value" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{safeLogs.length}</div>
        </div>
      </div>

      <div className="grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '24px', '@media(min-width: 768px)': {gridTemplateColumns: '1fr 2fr'}}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          <Card className="glass-card">
            <h3 style={{marginBottom: '16px'}}>Log Sleep</h3>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div>
                <label className="text-sm text-muted">Bedtime</label>
                <input 
                  type="time" 
                  className="input" 
                  style={{width: '100%', marginTop: '4px'}}
                  value={bedtime} 
                  onChange={e => setBedtime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted">Wake Time</label>
                <input 
                  type="time" 
                  className="input" 
                  style={{width: '100%', marginTop: '4px'}}
                  value={wakeTime} 
                  onChange={e => setWakeTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted">Sleep Quality</label>
                <div className="flex gap-sm" style={{marginTop: '8px', display: 'flex', gap: '8px'}}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      className="btn btn-ghost btn-icon"
                      style={{padding: '4px'}}
                      onClick={() => setQuality(star)}
                    >
                      <Star 
                        size={24} 
                        fill={star <= quality ? 'var(--color-warning, #f59e0b)' : 'none'} 
                        color={star <= quality ? 'var(--color-warning, #f59e0b)' : 'var(--text-muted)'} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted">Notes (Optional)</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  style={{width: '100%', marginTop: '4px', resize: 'vertical'}}
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How did you feel when waking up?"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{marginTop: '8px', width: '100%'}}>Save Sleep Log</button>
            </form>
          </Card>

          <Card className="glass-card" style={{backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)'}}>
            <div className="flex items-center gap-sm" style={{marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center'}}>
              <Info size={20} className="text-accent" style={{color: 'var(--color-accent)'}} />
              <h3 className="text-accent" style={{color: 'var(--color-accent)', margin: 0}}>Sleep Tips</h3>
            </div>
            <ul className="text-sm text-muted" style={{display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px', margin: 0}}>
              <li>Keep a consistent sleep schedule, even on weekends.</li>
              <li>Limit screen time 1 hour before bed.</li>
              <li>Keep your bedroom cool, dark, and quiet.</li>
              <li>Avoid large meals and caffeine before bedtime.</li>
            </ul>
          </Card>
        </div>

        <Card className="glass-card">
          <h3 style={{marginBottom: '16px'}}>Sleep History</h3>
          <div className="scroll-area" style={{maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {safeLogs.length === 0 ? (
              <div className="empty-state text-muted" style={{padding: '32px', textAlign: 'center'}}>No sleep logs yet. Add one to get started!</div>
            ) : (
              [...safeLogs].reverse().map(log => {
                const duration = calculateDurationHours(log.sleep_time, log.wake_time);
                return (
                  <div key={log.id} className="list-item flex items-center" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)'}}>
                    <div className="flex gap-md" style={{display: 'flex', gap: '16px', alignItems: 'stretch'}}>
                      <div 
                        style={{
                          width: '4px', 
                          borderRadius: '4px',
                          backgroundColor: getDurationColor(duration)
                        }}
                      />
                      <div>
                        <div className="text-sm text-muted" style={{marginBottom: '4px'}}>{log.date || today()}</div>
                        <div className="flex items-center gap-sm" style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem'}}>
                          <Moon size={16} className="text-muted"/> {log.sleep_time} 
                          <span className="text-muted" style={{margin: '0 4px'}}>→</span>
                          <Sun size={16} className="text-muted"/> {log.wake_time}
                        </div>
                        <div style={{marginTop: '6px'}}>
                          <span style={{fontWeight: 'bold', color: getDurationColor(duration)}}>
                            {formatDuration(duration)}
                          </span>
                        </div>
                        {log.notes && <div className="text-sm text-muted" style={{marginTop: '8px', fontStyle: 'italic'}}>"{log.notes}"</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-md" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                      <div className="flex" style={{display: 'flex'}}>
                        {Array.from({length: 5}).map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < log.quality ? 'var(--color-warning, #f59e0b)' : 'none'} 
                            color={i < log.quality ? 'var(--color-warning, #f59e0b)' : 'var(--border-color)'} 
                          />
                        ))}
                      </div>
                      <button 
                        className="btn btn-ghost btn-icon delete-btn text-danger"
                        style={{color: 'var(--color-danger)'}}
                        onClick={() => removeSleep(log.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
