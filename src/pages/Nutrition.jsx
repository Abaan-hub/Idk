import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Plus, Trash2, Star, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { useStore } from '../store';
import { today } from '../utils';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';

export default function Nutrition() {
  const { 
    foodLogs, calorieGoal, proteinGoal, carbsGoal, fatGoal, 
    addFood, removeFood, savedMeals, addSavedMeal, removeSavedMeal 
  } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealType, setMealType] = useState('Breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const todayMeals = foodLogs.filter(log => log.date === today());
  
  const todayTotals = todayMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const mealTypes = [
    { name: 'Breakfast', icon: Coffee, color: 'text-amber-400' },
    { name: 'Lunch', icon: Sun, color: 'text-orange-400' },
    { name: 'Dinner', icon: Moon, color: 'text-indigo-400' },
    { name: 'Snack', icon: Cookie, color: 'text-pink-400' }
  ];

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!mealName || !calories) return;

    const newMeal = {
      meal_type: mealType,
      name: mealName,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      date: today(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addFood(newMeal);
    
    if (saveAsTemplate) {
      addSavedMeal({
        name: mealName,
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        meal_type: mealType
      });
      showToast('Meal logged and saved as template!', 'success');
    } else {
      showToast('Meal logged successfully!', 'success');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSaveAsTemplate(false);
  };

  const quickAddSaved = (meal) => {
    addFood({
      ...meal,
      date: today(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    showToast(`Quick added ${meal.name}!`, 'success');
  };

  const macroProgress = (current, goal) => Math.min((current / goal) * 100, 100);

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nutrition</h1>
          <p className="text-muted">Track your daily food intake and macros</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 px-6 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Plus size={20} /> Add Meal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-8">
        {/* Main Calorie Ring */}
        <Card className="glass-card lg:col-span-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <h2 className="text-xl font-semibold mb-6 z-10 w-full text-center">Calories</h2>
          <div className="relative z-10">
            <ProgressRing 
              size={200} 
              progress={(todayTotals.calories / calorieGoal) * 100} 
              color="#10b981" 
              trackColor="rgba(16, 185, 129, 0.1)" 
              strokeWidth={14} 
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-green-400">{todayTotals.calories}</span>
              <span className="text-sm text-muted">/ {calorieGoal} kcal</span>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted">
            {calorieGoal - todayTotals.calories} kcal remaining
          </div>
        </Card>

        {/* Macros */}
        <Card className="glass-card lg:col-span-2 p-8">
          <h2 className="text-xl font-semibold mb-6">Macronutrients</h2>
          <div className="flex flex-col gap-6">
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                  Protein
                </span>
                <span className="text-sm"><span className="text-indigo-400 font-bold">{todayTotals.protein}g</span> / {proteinGoal}g</span>
              </div>
              <div className="progress-bar w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="progress-fill h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${macroProgress(todayTotals.protein, proteinGoal)}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  Carbs
                </span>
                <span className="text-sm"><span className="text-amber-400 font-bold">{todayTotals.carbs}g</span> / {carbsGoal}g</span>
              </div>
              <div className="progress-bar w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="progress-fill h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${macroProgress(todayTotals.carbs, carbsGoal)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  Fat
                </span>
                <span className="text-sm"><span className="text-red-400 font-bold">{todayTotals.fat}g</span> / {fatGoal}g</span>
              </div>
              <div className="progress-bar w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="progress-fill h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${macroProgress(todayTotals.fat, fatGoal)}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>

          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-8">
        
        {/* Today's Log */}
        <Card className="glass-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-green-400" />
              Today's Meals
            </h2>
          </div>

          {todayMeals.length > 0 ? (
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {todayMeals.slice().reverse().map(meal => {
                  const typeInfo = mealTypes.find(t => t.name === meal.meal_type) || mealTypes[0];
                  const Icon = typeInfo.icon;
                  return (
                    <motion.div 
                      key={meal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="list-item bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between gap-4 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-white/5 rounded-xl ${typeInfo.color}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">{meal.name}</h4>
                          <div className="flex gap-2 items-center mt-1">
                            <span className="badge text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted">{meal.meal_type}</span>
                            <span className="text-xs text-muted">{meal.time}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                        <div className="flex gap-4 text-sm text-muted">
                          <div className="flex flex-col items-center">
                            <span className="text-green-400 font-bold">{meal.calories}</span>
                            <span className="text-[10px] uppercase tracking-wider">kcal</span>
                          </div>
                          <div className="w-px h-8 bg-white/10"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-indigo-400">{meal.protein}g</span>
                            <span className="text-[10px] uppercase tracking-wider">P</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-amber-400">{meal.carbs}g</span>
                            <span className="text-[10px] uppercase tracking-wider">C</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-red-400">{meal.fat}g</span>
                            <span className="text-[10px] uppercase tracking-wider">F</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFood(meal.id)}
                          className="delete-btn p-2 rounded-lg text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="empty-state text-center py-16 text-muted border border-dashed border-white/10 rounded-2xl">
              <UtensilsCrossed size={48} className="opacity-20 mx-auto mb-4" />
              <p>No meals logged today yet.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-green-400 hover:text-green-300 font-medium"
              >
                + Add your first meal
              </button>
            </div>
          )}
        </Card>

        {/* Saved Meals */}
        <Card className="glass-card h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star size={20} className="text-yellow-400" />
            Saved Meals
          </h2>
          
          <div className="scroll-area max-h-[400px] overflow-y-auto pr-2 -mr-2">
            {savedMeals && savedMeals.length > 0 ? (
              <div className="flex flex-col gap-3">
                {savedMeals.map(meal => (
                  <div key={meal.id} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{meal.name}</h4>
                      <button 
                        onClick={() => removeSavedMeal(meal.id)}
                        className="text-red-400/0 group-hover:text-red-400/50 hover:!text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-400 font-semibold">{meal.calories} kcal</span>
                      <button 
                        onClick={() => quickAddSaved(meal)}
                        className="btn btn-sm bg-white/10 hover:bg-white/20 text-xs py-1 px-3 rounded-full flex items-center gap-1"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted">
                Save meals as templates to quickly add them later.
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* Add Meal Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Meal">
          <form onSubmit={handleAddMeal} className="flex flex-col gap-4">
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted">Meal Type</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scroll-area">
                {mealTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.name}
                      type="button"
                      onClick={() => setMealType(type.name)}
                      className={`chip flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full border transition-all whitespace-nowrap ${
                        mealType === type.name 
                          ? `bg-white/10 border-${type.color.split('-')[1]}-400/50 ${type.color}` 
                          : 'border-white/10 hover:bg-white/5 text-muted'
                      }`}
                    >
                      <Icon size={16} />
                      {type.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted">Food Name *</label>
              <input 
                type="text" 
                required
                value={mealName}
                onChange={e => setMealName(e.target.value)}
                className="input w-full bg-white/5 border-white/10 focus:border-green-500/50" 
                placeholder="e.g. Oatmeal with berries" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted">Calories (kcal) *</label>
              <input 
                type="number" 
                required
                min="0"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                className="input w-full bg-white/5 border-white/10 focus:border-green-500/50" 
                placeholder="0" 
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-indigo-400/80">Protein (g)</label>
                <input 
                  type="number"
                  min="0" 
                  value={protein}
                  onChange={e => setProtein(e.target.value)}
                  className="input w-full bg-white/5 border-white/10 focus:border-indigo-500/50" 
                  placeholder="0" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-amber-400/80">Carbs (g)</label>
                <input 
                  type="number" 
                  min="0"
                  value={carbs}
                  onChange={e => setCarbs(e.target.value)}
                  className="input w-full bg-white/5 border-white/10 focus:border-amber-500/50" 
                  placeholder="0" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-red-400/80">Fat (g)</label>
                <input 
                  type="number" 
                  min="0"
                  value={fat}
                  onChange={e => setFat(e.target.value)}
                  className="input w-full bg-white/5 border-white/10 focus:border-red-500/50" 
                  placeholder="0" 
                />
              </div>
            </div>

            <div className="divider my-2 h-px bg-white/10 w-full" />

            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${saveAsTemplate ? 'bg-green-500 border-green-500' : 'border-white/20 bg-white/5'}`}>
                {saveAsTemplate && <Star size={12} className="text-white fill-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={saveAsTemplate}
                onChange={e => setSaveAsTemplate(e.target.checked)}
              />
              <span className="text-sm text-muted">Save as quick-add template</span>
            </label>

            <div className="flex gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="btn flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/20"
              >
                Log Meal
              </button>
            </div>
          </form>
        </Modal>
      )}

    </motion.div>
  );
}
