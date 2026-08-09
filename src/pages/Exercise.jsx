import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { today, daysAgo } from '../utils';
import Card from '../components/Card';
import { showToast } from '../components/Toast';
import { Activity, Flame, Clock, Calendar, Trash2, Plus } from 'lucide-react';

const TYPES = ['Cardio', 'Strength', 'Flexibility', 'Sports', 'Other'];

export default function Exercise() {
  const { exerciseLogs, addExercise, removeExercise } = useStore();
  const [formData, setFormData] = useState({ type: 'Cardio', name: '', duration_min: '', calories_burned: '' });

  const todaysLogs = useMemo(() => (exerciseLogs || []).filter(l => l.date === today()), [exerciseLogs]);
  
  const stats = useMemo(() => {
    const todayDur = todaysLogs.reduce((sum, l) => sum + Number(l.duration_min || 0), 0);
    const todayCal = todaysLogs.reduce((sum, l) => sum + Number(l.calories_burned || 0), 0);
    
    const weekAgo = daysAgo(7);
    const weekLogs = (exerciseLogs || []).filter(l => l.date >= weekAgo);
    const weekTotal = weekLogs.reduce((sum, l) => sum + Number(l.duration_min || 0), 0);
    
    let streak = 0;
    let d = 0;
    while(true) {
      const dt = daysAgo(d);
      if ((exerciseLogs || []).some(l => l.date === dt)) {
        streak++;
        d++;
      } else {
        if (d === 0) d++; // Allow missing today
        else break;
      }
    }

    return { todayDur, todayCal, weekTotal, streak };
  }, [exerciseLogs, todaysLogs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.duration_min) {
      showToast('Please enter at least name and duration');
      return;
    }
    addExercise({
      type: formData.type,
      name: formData.name,
      duration_min: Number(formData.duration_min),
      calories_burned: Number(formData.calories_burned) || 0,
      date: today()
    });
    setFormData({ type: 'Cardio', name: '', duration_min: '', calories_burned: '' });
    showToast('Exercise logged');
  };

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = daysAgo(6 - i);
    const hasLog = (exerciseLogs || []).some(l => l.date === d);
    return { date: d, active: hasLog };
  });

  return (
    <div className="p-4 flex flex-col gap-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Exercise</h1>

      <div className="grid-4 mb-4">
        <Card className="stat-card glass-card p-4">
          <Clock className="text-accent mb-2" size={24} />
          <div className="stat-value text-2xl font-bold">{stats.todayDur} <span className="text-sm font-normal text-muted">min</span></div>
          <div className="stat-label text-sm text-muted">Today's Duration</div>
        </Card>
        <Card className="stat-card glass-card p-4">
          <Flame className="text-orange-500 mb-2" size={24} />
          <div className="stat-value text-2xl font-bold">{stats.todayCal} <span className="text-sm font-normal text-muted">kcal</span></div>
          <div className="stat-label text-sm text-muted">Today's Calories</div>
        </Card>
        <Card className="stat-card glass-card p-4">
          <Activity className="text-green-500 mb-2" size={24} />
          <div className="stat-value text-2xl font-bold">{stats.weekTotal} <span className="text-sm font-normal text-muted">min</span></div>
          <div className="stat-label text-sm text-muted">Week Total</div>
        </Card>
        <Card className="stat-card glass-card p-4">
          <Calendar className="text-purple-500 mb-2" size={24} />
          <div className="stat-value text-2xl font-bold">{stats.streak} <span className="text-sm font-normal text-muted">days</span></div>
          <div className="stat-label text-sm text-muted">Current Streak</div>
        </Card>
      </div>

      <div className="flex gap-2 justify-center mb-6">
        {last7Days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${d.active ? 'bg-accent text-white' : 'bg-white/10 text-muted'}`}>
              {d.date.split('-')[2]}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <Card className="glass-card p-5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Log Exercise</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
            <div className="flex gap-sm">
              <select className="select flex-1" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input type="text" className="input" placeholder="Workout Name (e.g. Morning Run)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <div className="flex gap-sm">
              <input type="number" className="input flex-1" placeholder="Duration (min)" min="1" value={formData.duration_min} onChange={e => setFormData({...formData, duration_min: e.target.value})} required />
              <input type="number" className="input flex-1" placeholder="Calories (optional)" min="0" value={formData.calories_burned} onChange={e => setFormData({...formData, calories_burned: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary mt-2 flex items-center justify-center gap-2">
              <Plus size={18} /> Add Log
            </button>
          </form>
        </Card>

        <Card className="glass-card p-5 flex flex-col h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Today's Logs</h2>
          <div className="flex-1 overflow-y-auto scroll-area pr-2 flex flex-col gap-2">
            {todaysLogs.length === 0 ? (
              <div className="empty-state h-full flex items-center justify-center text-muted">
                <p>No exercises logged today.</p>
              </div>
            ) : (
              todaysLogs.map(log => (
                <div key={log.id} className="list-item bg-white/5 p-3 rounded-lg flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-accent text-xs">{log.type}</span>
                      <span className="font-semibold">{log.name}</span>
                    </div>
                    <div className="text-sm text-muted mt-1 flex gap-3">
                      <span><Clock size={12} className="inline mr-1"/>{log.duration_min} min</span>
                      {log.calories_burned > 0 && <span><Flame size={12} className="inline mr-1"/>{log.calories_burned} kcal</span>}
                    </div>
                  </div>
                  <button className="delete-btn btn btn-ghost btn-icon text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeExercise(log.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
