import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus, Trash2, Target, TrendingUp, GlassWater } from 'lucide-react';
import { useStore } from '../store';
import { today, daysAgo } from '../utils';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { showToast } from '../components/Toast';

export default function Hydration() {
  const { waterLogs, waterGoal, addWater, removeWater, setWaterGoal } = useStore();
  const [customAmount, setCustomAmount] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const todayLogs = waterLogs.filter(log => log.date === today());
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const remaining = Math.max(0, waterGoal - todayTotal);
  
  // Calculate 7-day average
  const last7DaysLogs = waterLogs.filter(log => {
    const logDate = new Date(log.date);
    const date7DaysAgo = new Date(daysAgo(7));
    return logDate >= date7DaysAgo;
  });
  const avg7Days = Math.round(last7DaysLogs.reduce((sum, log) => sum + log.amount_ml, 0) / 7);

  const fillPercentage = Math.min((todayTotal / waterGoal) * 100, 100);

  const handleQuickAdd = (amount) => {
    addWater({ amount_ml: amount, date: today(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    showToast(`Added ${amount}ml of water!`, 'success');
  };

  const handleCustomAdd = (e) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (amount > 0) {
      handleQuickAdd(amount);
      setCustomAmount('');
    }
  };

  const handleGoalUpdate = (e) => {
    e.preventDefault();
    const goal = parseInt(newGoal);
    if (goal > 0) {
      setWaterGoal(goal);
      setNewGoal('');
      showToast(`Water goal updated to ${goal}ml!`, 'success');
    }
  };

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hydration</h1>
          <p className="text-muted">Track your daily water intake</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-full">
          <Droplets size={32} className="text-blue-500" />
        </div>
      </div>

      <div className="grid-2 gap-lg mb-8">
        <Card className="glass-card flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <h2 className="text-xl font-semibold mb-6 z-10">Today's Progress</h2>
          <div className="flex flex-col md:flex-row items-center gap-10 z-10">
            <div className="relative">
              <ProgressRing size={160} progress={fillPercentage} color="#38bdf8" trackColor="rgba(56, 189, 248, 0.1)" strokeWidth={12} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">{fillPercentage.toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="water-bottle w-24 h-48 border-4 border-blue-400/30 rounded-[40px] relative overflow-hidden bg-blue-950/20 backdrop-blur-sm">
              <motion.div 
                className="water-bottle-fill absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 opacity-80"
                initial={{ height: 0 }}
                animate={{ height: `${fillPercentage}%` }}
                transition={{ duration: 1, type: "spring" }}
              >
                <div className="w-full h-2 bg-blue-300/50 absolute top-0 rounded-full" />
              </motion.div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-md">
          <Card className="glass-card flex-1">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <GlassWater size={20} className="text-blue-400" />
              Quick Add
            </h3>
            <div className="grid-2 gap-sm mb-4">
              {[250, 500, 750, 1000].map((amount) => (
                <button 
                  key={amount}
                  onClick={() => handleQuickAdd(amount)}
                  className="btn btn-ghost hover:bg-blue-500/10 border border-blue-500/20 py-3 rounded-xl transition-all hover:scale-105"
                >
                  <Plus size={16} className="text-blue-400 mr-1" /> {amount} ml
                </button>
              ))}
            </div>
            
            <form onSubmit={handleCustomAdd} className="flex gap-sm">
              <input 
                type="number" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom amount (ml)"
                className="input flex-1 bg-white/5 border-white/10"
              />
              <button type="submit" className="btn btn-primary bg-blue-500 hover:bg-blue-600">Add</button>
            </form>
          </Card>

          <Card className="glass-card flex-1">
             <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-400" />
              Daily Goal
            </h3>
            <form onSubmit={handleGoalUpdate} className="flex gap-sm">
              <input 
                type="number" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder={`Current: ${waterGoal}ml`}
                className="input flex-1 bg-white/5 border-white/10"
              />
              <button type="submit" className="btn btn-ghost border border-white/10 hover:bg-white/5">Update</button>
            </form>
          </Card>
        </div>
      </div>

      <div className="grid-4 gap-md mb-8">
        <Card className="stat-card glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label text-muted">Today Total</span>
            <GlassWater size={20} className="text-blue-400" />
          </div>
          <div className="stat-value text-2xl font-bold">{todayTotal} <span className="text-sm font-normal text-muted">ml</span></div>
        </Card>
        
        <Card className="stat-card glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label text-muted">Daily Goal</span>
            <Target size={20} className="text-purple-400" />
          </div>
          <div className="stat-value text-2xl font-bold">{waterGoal} <span className="text-sm font-normal text-muted">ml</span></div>
        </Card>

        <Card className="stat-card glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label text-muted">Remaining</span>
            <Droplets size={20} className="text-cyan-400" />
          </div>
          <div className="stat-value text-2xl font-bold">{remaining} <span className="text-sm font-normal text-muted">ml</span></div>
        </Card>

        <Card className="stat-card glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label text-muted">7-Day Avg</span>
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
          <div className="stat-value text-2xl font-bold">{avg7Days} <span className="text-sm font-normal text-muted">ml</span></div>
        </Card>
      </div>

      <Card className="glass-card">
        <h2 className="text-xl font-semibold mb-4">Today's History</h2>
        
        {todayLogs.length > 0 ? (
          <div className="flex flex-col gap-sm">
            <AnimatePresence>
              {todayLogs.slice().reverse().map(log => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="list-item flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Droplets size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">{log.amount_ml} ml</div>
                      <div className="text-sm text-muted">{log.time}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeWater(log.id)}
                    className="delete-btn btn btn-icon btn-ghost text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="empty-state text-center py-12 text-muted flex flex-col items-center">
            <GlassWater size={48} className="opacity-20 mb-4" />
            <p>No water logged today yet.</p>
            <p className="text-sm mt-1">Stay hydrated!</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
