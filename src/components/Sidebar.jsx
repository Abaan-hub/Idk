import { useStore } from '../store';
import {
  LayoutDashboard, Droplets, UtensilsCrossed, Dumbbell,
  CheckSquare, Target, Timer, Moon, BookOpen, BarChart3,
  Settings, Sun, MoonStar, Zap
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Wellness',
    items: [
      { id: 'hydration', label: 'Hydration', icon: Droplets },
      { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
      { id: 'exercise', label: 'Exercise', icon: Dumbbell },
      { id: 'sleep', label: 'Sleep', icon: Moon },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      { id: 'habits', label: 'Habits', icon: Target },
      { id: 'focus', label: 'Focus', icon: Timer },
      { id: 'journal', label: 'Journal', icon: BookOpen },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const activePage = useStore(s => s.activePage);
  const setPage = useStore(s => s.setPage);
  const theme = useStore(s => s.theme);
  const toggleTheme = useStore(s => s.toggleTheme);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={20} color="#fff" />
          </div>
          <span className="sidebar-logo-text">Prodigy</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                >
                  <span className="nav-icon"><Icon size={18} /></span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          className="nav-item"
          onClick={toggleTheme}
          style={{ justifyContent: 'center' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <MoonStar size={16} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </div>
      </div>
    </aside>
  );
}

export { NAV_SECTIONS };
