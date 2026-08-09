import React, { useRef } from 'react';
import { useStore } from '../store';
import Card from '../components/Card';
import { showToast } from '../components/Toast';
import { User, Moon, Sun, Palette, Clock, Bell, Quote, Cloud, Target, Download, Upload, Trash2 } from 'lucide-react';

const COLORS = ['#818cf8', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8', '#f472b6'];

export default function Settings() {
  const { 
    theme, toggleTheme, 
    settings, updateSettings, 
    pomoSettings, updatePomoSettings, 
    waterGoal, setWaterGoal, 
    calorieGoal, setCalorieGoal, 
    accentColor, setAccent,
    exportData, importData, resetData 
  } = useStore();

  const fileInputRef = useRef(null);

  const handleColorChange = (c) => {
    document.documentElement.style.setProperty('--accent', c);
    setAccent(c);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          importData(data);
          showToast('Data imported successfully');
        } catch (err) {
          showToast('Failed to import data. Invalid format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prodigy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to completely reset all your data? This cannot be undone.')) {
      resetData();
      showToast('All data has been reset');
    }
  };

  return (
    <div className="p-4 flex flex-col gap-md max-w-3xl mx-auto pb-12">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <Card className="glass-card p-5 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><User size={20}/> Profile & Appearance</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {(settings?.name || 'User').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-muted mb-1">Display Name</label>
            <input type="text" className="input max-w-xs w-full" value={settings?.name || ''} onChange={e => updateSettings({ name: e.target.value })} placeholder="Your Name" />
          </div>
        </div>

        <div className="divider my-4 border-t border-white/10"></div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-medium">Dark Mode</div>
            <div className="text-sm text-muted">Toggle application theme</div>
          </div>
          <button className={`toggle ${theme === 'dark' ? 'on' : ''} w-12 h-6 rounded-full bg-white/20 relative transition-colors`} onClick={toggleTheme}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform flex items-center justify-center text-gray-800 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`}>
              {theme === 'dark' ? <Moon size={12}/> : <Sun size={12}/>}
            </div>
          </button>
        </div>

        <div>
          <div className="font-medium mb-2 flex items-center gap-2"><Palette size={16}/> Accent Color</div>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`} style={{ backgroundColor: c }} onClick={() => handleColorChange(c)} />
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-card p-5 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Clock size={20}/> Pomodoro Settings</h2>
        <div className="grid grid-cols-3 gap-sm">
          <div>
            <label className="block text-sm text-muted mb-1">Focus (min)</label>
            <input type="number" className="input w-full" value={pomoSettings?.focusMin || 25} onChange={e => updatePomoSettings({ focusMin: Number(e.target.value) })} min="1" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Short Break</label>
            <input type="number" className="input w-full" value={pomoSettings?.breakMin || 5} onChange={e => updatePomoSettings({ breakMin: Number(e.target.value) })} min="1" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Long Break</label>
            <input type="number" className="input w-full" value={pomoSettings?.longBreakMin || 15} onChange={e => updatePomoSettings({ longBreakMin: Number(e.target.value) })} min="1" />
          </div>
        </div>
      </Card>

      <Card className="glass-card p-5 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Target size={20}/> Goals & Preferences</h2>
        
        <div className="grid grid-cols-2 gap-sm mb-6">
          <div>
            <label className="block text-sm text-muted mb-1">Daily Water Goal (ml)</label>
            <input type="number" className="input w-full" value={waterGoal || 2000} onChange={e => setWaterGoal(Number(e.target.value))} step="100" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Daily Calorie Goal</label>
            <input type="number" className="input w-full" value={calorieGoal || 2000} onChange={e => setCalorieGoal ? setCalorieGoal(Number(e.target.value)) : updateSettings({ calorieGoal: Number(e.target.value) })} step="50" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2"><Bell size={18} className="text-muted"/> Sound Effects</div>
            <button className={`toggle ${settings?.sound ? 'on' : ''} w-10 h-5 rounded-full bg-white/20 relative`} onClick={() => updateSettings({ sound: !settings?.sound })}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${settings?.sound ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2"><Quote size={18} className="text-muted"/> Motivational Quotes</div>
            <button className={`toggle ${settings?.showQuotes ? 'on' : ''} w-10 h-5 rounded-full bg-white/20 relative`} onClick={() => updateSettings({ showQuotes: !settings?.showQuotes })}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${settings?.showQuotes ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2"><Cloud size={18} className="text-muted"/> Show Weather</div>
            <button className={`toggle ${settings?.showWeather ? 'on' : ''} w-10 h-5 rounded-full bg-white/20 relative`} onClick={() => updateSettings({ showWeather: !settings?.showWeather })}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${settings?.showWeather ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-5 border border-red-500/20">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Data Management</h2>
        <div className="flex flex-wrap gap-sm">
          <button className="btn btn-secondary flex items-center gap-2" onClick={handleExport}><Download size={16}/> Export Data</button>
          
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
          <button className="btn btn-secondary flex items-center gap-2" onClick={handleImportClick}><Upload size={16}/> Import Data</button>
          
          <button className="btn btn-danger flex items-center gap-2 ml-auto" onClick={handleReset}><Trash2 size={16}/> Reset All Data</button>
        </div>
      </Card>

      <div className="text-center text-sm text-muted mt-8">
        Prodigy v2.0
      </div>
    </div>
  );
}
