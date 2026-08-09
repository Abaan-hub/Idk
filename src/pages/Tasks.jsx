import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { TASK_CATEGORIES } from '../utils';
import Card from '../components/Card';
import { showToast } from '../components/Toast';
import { 
  Plus, Search, CheckCircle, Circle, Trash2, 
  Calendar, ListTodo, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

const Tasks = () => {
  const { todos, addTodo, toggleTodo, removeTodo, clearDoneTodos, addSubtask, toggleSubtask } = useStore();
  
  const [newTask, setNewTask] = useState({ title: '', priority: 'Med', category: TASK_CATEGORIES[0]?.[0] || '📝', due: '' });
  const [filter, setFilter] = useState({ search: '', priority: 'All', status: 'All', category: 'All' });
  const [expandedId, setExpandedId] = useState(null);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return showToast('Task title is required', 'error');
    addTodo(newTask);
    setNewTask({ ...newTask, title: '', due: '' });
    showToast('Task added successfully', 'success');
  };

  const handleAddSubtask = (e, todoId) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtask(todoId, newSubtask);
    setNewSubtask('');
  };

  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      if (filter.status === 'Active' && t.done) return false;
      if (filter.status === 'Done' && !t.done) return false;
      if (filter.priority !== 'All' && t.priority !== filter.priority) return false;
      if (filter.category !== 'All' && t.category !== filter.category) return false;
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }, [todos, filter]);

  const doneCount = todos.filter(t => t.done).length;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  const getPriorityClass = (p) => {
    switch(p) {
      case 'ASAP': return 'priority-asap badge-danger';
      case 'High': return 'priority-high badge-warning';
      case 'Low': return 'priority-low badge-success';
      default: return 'priority-med badge-primary';
    }
  };

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-sm">
          <ListTodo className="text-primary" /> <span className="gradient-text">Tasks</span>
        </h1>
        {todos.length > 0 && (
          <button className="btn btn-ghost btn-sm text-muted" onClick={clearDoneTodos}>
            Clear Completed
          </button>
        )}
      </div>

      <Card className="mb-6 p-4">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-sm items-center">
          <input 
            type="text" 
            className="input flex-1 min-w-[200px]" 
            placeholder="What needs to be done?" 
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
          />
          <select 
            className="select"
            value={newTask.category}
            onChange={e => setNewTask({...newTask, category: e.target.value})}
          >
            {TASK_CATEGORIES.map(([emoji, name]) => (
              <option key={name} value={emoji}>{emoji} {name}</option>
            ))}
          </select>
          <select 
            className="select"
            value={newTask.priority}
            onChange={e => setNewTask({...newTask, priority: e.target.value})}
          >
            <option value="Low">Low</option>
            <option value="Med">Med</option>
            <option value="High">High</option>
            <option value="ASAP">ASAP</option>
          </select>
          <input 
            type="date" 
            className="input"
            value={newTask.due}
            onChange={e => setNewTask({...newTask, due: e.target.value})}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={20} /> Add
          </button>
        </form>
      </Card>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              className="input w-full pl-9" 
              placeholder="Search tasks..." 
              value={filter.search}
              onChange={e => setFilter({...filter, search: e.target.value})}
            />
          </div>
          
          <div className="tabs bg-surface p-1 rounded-lg">
            {['All', 'Active', 'Done'].map(s => (
              <button 
                key={s} 
                className={`tab ${filter.status === s ? 'active' : ''}`}
                onClick={() => setFilter({...filter, status: s})}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-sm">
          <div className="flex gap-2 items-center text-sm text-muted">
            <AlertCircle size={14} /> Priority:
          </div>
          {['All', 'Low', 'Med', 'High', 'ASAP'].map(p => (
            <button 
              key={p} 
              className={`chip ${filter.priority === p ? 'active' : ''}`}
              onClick={() => setFilter({...filter, priority: p})}
            >
              {p}
            </button>
          ))}
          
          <div className="divider w-px h-6 bg-border mx-2"></div>
          
          {[{emoji:'All', name:'All'}, ...TASK_CATEGORIES.map(([e, n]) => ({emoji:e, name:n}))].map(c => (
            <button 
              key={c.name} 
              className={`chip ${filter.category === c.emoji || (c.name === 'All' && filter.category === 'All') ? 'active' : ''}`}
              onClick={() => setFilter({...filter, category: c.name === 'All' ? 'All' : c.emoji})}
            >
              {c.emoji !== 'All' ? c.emoji : ''} {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progress</span>
          <span className="text-muted">{doneCount} of {todos.length} tasks completed</span>
        </div>
        <div className="progress-bar h-2 bg-surface rounded-full overflow-hidden">
          <motion.div 
            className="progress-fill h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="scroll-area space-y-3 pb-20">
        <AnimatePresence>
          {filteredTodos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="empty-state p-12 text-center text-muted border-2 border-dashed border-border rounded-xl"
            >
              <ListTodo size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">No tasks found</h3>
              <p className="text-sm">Try adjusting your filters or add a new task.</p>
            </motion.div>
          ) : (
            filteredTodos.map(todo => (
              <motion.div 
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card list-item p-4 rounded-xl border ${todo.done ? 'bg-surface/50 border-border' : 'border-border/50 shadow-sm'} transition-all`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    className={`checkbox flex-shrink-0 ${todo.done ? 'text-primary' : 'text-muted hover:text-primary'}`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.done ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="text-2xl" title="Category">{todo.category}</span>
                    <div className="flex-1">
                      <h3 className={`font-medium truncate ${todo.done ? 'line-through text-muted' : ''}`}>
                        {todo.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        {todo.due && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {new Date(todo.due).toLocaleDateString()}
                          </span>
                        )}
                        {todo.subtasks?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ListTodo size={12} /> {todo.subtasks.filter(s => s.done).length}/{todo.subtasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs px-2 py-1 rounded-full ${getPriorityClass(todo.priority)}`}>
                      {todo.priority}
                    </span>
                    <button 
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                    >
                      {expandedId === todo.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button 
                      className="btn btn-ghost btn-icon btn-sm btn-danger text-danger hover:bg-danger/10"
                      onClick={() => removeTodo(todo.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === todo.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-border pl-11">
                        <div className="space-y-2 mb-3">
                          {todo.subtasks?.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2 text-sm group">
                              <button 
                                className={`checkbox ${sub.done ? 'text-primary' : 'text-muted group-hover:text-primary'}`}
                                onClick={() => toggleSubtask(todo.id, sub.id)}
                              >
                                {sub.done ? <CheckCircle size={16} /> : <Circle size={16} />}
                              </button>
                              <span className={sub.done ? 'line-through text-muted' : ''}>{sub.title}</span>
                            </div>
                          ))}
                        </div>
                        <form onSubmit={(e) => handleAddSubtask(e, todo.id)} className="flex gap-2">
                          <input 
                            type="text" 
                            className="input input-sm flex-1 text-sm bg-surface" 
                            placeholder="Add a subtask..." 
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                          />
                          <button type="submit" className="btn btn-primary btn-sm">Add</button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Tasks;
