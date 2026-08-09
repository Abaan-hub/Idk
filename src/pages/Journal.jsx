import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { today, JOURNAL_MOODS, JOURNAL_PROMPTS } from '../utils';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Journal() {
  const { journalEntries, addJournal, updateJournal, removeJournal } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', content: '', mood: '', tags: '' });
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const prompt = useMemo(() => JOURNAL_PROMPTS[new Date().getDay() % JOURNAL_PROMPTS.length], []);

  const filteredEntries = useMemo(() => {
    return (journalEntries || []).filter(entry => {
      const matchSearch = entry.title.toLowerCase().includes(search.toLowerCase()) || entry.content.toLowerCase().includes(search.toLowerCase());
      const matchMood = moodFilter ? entry.mood === moodFilter : true;
      return matchSearch && matchMood;
    }).sort((a, b) => new Date(b.date || today()) - new Date(a.date || today()));
  }, [journalEntries, search, moodFilter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.mood) {
      showToast('Please fill all required fields');
      return;
    }
    const payload = {
      title: formData.title,
      content: formData.content,
      mood: formData.mood,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (editingId) {
      updateJournal(editingId, payload);
      showToast('Entry updated');
    } else {
      addJournal({ ...payload, date: today() });
      showToast('Entry added');
    }
    
    setIsModalOpen(false);
    setFormData({ title: '', content: '', mood: '', tags: '' });
    setEditingId(null);
  };

  const openEdit = (entry) => {
    setFormData({ title: entry.title, content: entry.content, mood: entry.mood, tags: (entry.tags || []).join(', ') });
    setEditingId(entry.id);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 flex flex-col gap-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Journal</h1>
        <button className="btn btn-primary btn-sm flex items-center gap-sm" onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ title: '', content: '', mood: '', tags: '' }); }}>
          <Plus size={16} /> New Entry
        </button>
      </div>

      <Card className="glass-card bg-accent/10 p-4">
        <p className="text-sm font-semibold text-accent mb-1">Today's Prompt</p>
        <p className="text-lg italic">{prompt}</p>
      </Card>

      <div className="flex gap-sm items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" className="input pl-10 w-full" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-sm overflow-x-auto pb-1">
          <button className={`chip ${!moodFilter ? 'active' : ''}`} onClick={() => setMoodFilter('')}>All</button>
          {JOURNAL_MOODS.map(m => (
            <button key={m.label} className={`chip flex items-center gap-1 ${moodFilter === m.label ? 'active' : ''}`} onClick={() => setMoodFilter(m.label)}>
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-sm scroll-area">
        {filteredEntries.length === 0 ? (
          <div className="empty-state p-8 text-center text-muted">
            <p>No journal entries found.</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <Card key={entry.id} className="glass-card p-4 transition-all">
              <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                <div>
                  <div className="flex items-center gap-sm mb-1">
                    <span className="text-sm text-muted">{entry.date}</span>
                    <span title={entry.mood}>{JOURNAL_MOODS.find(m => m.label === entry.mood)?.emoji}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{entry.title}</h3>
                </div>
                <button className="btn btn-ghost btn-icon text-muted">
                  {expandedId === entry.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              
              {expandedId === entry.id ? (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="whitespace-pre-wrap mb-3">{entry.content}</p>
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {(entry.tags || []).map(t => <span key={t} className="badge badge-accent">{t}</span>)}
                  </div>
                  <div className="flex justify-end gap-sm">
                    <button className="btn btn-sm btn-ghost flex items-center gap-1" onClick={(e) => { e.stopPropagation(); openEdit(entry); }}><Edit2 size={14}/> Edit</button>
                    <button className="btn btn-sm btn-danger flex items-center gap-1" onClick={(e) => { e.stopPropagation(); removeJournal(entry.id); showToast('Entry deleted'); }}><Trash2 size={14}/> Delete</button>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-sm mt-1 truncate max-w-full">{entry.content.substring(0, 80)}{entry.content.length > 80 ? '...' : ''}</p>
              )}
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Entry" : "New Journal Entry"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md p-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input type="text" className="input w-full" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Mood</label>
            <div className="flex gap-2 justify-between">
              {JOURNAL_MOODS.map(m => (
                <button key={m.label} type="button" className={`text-2xl p-2 rounded-xl transition-all ${formData.mood === m.label ? 'bg-accent/20 border-2 border-accent' : 'hover:bg-white/5 border-2 border-transparent'}`} onClick={() => setFormData({ ...formData, mood: m.label })} title={m.label}>
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Content</label>
            <textarea className="input w-full min-h-[150px] resize-y" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Tags (comma separated)</label>
            <input type="text" className="input w-full" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="grateful, workout, idea" />
          </div>
          <div className="flex justify-end gap-sm mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
