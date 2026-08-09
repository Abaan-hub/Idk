import { useStore } from '../store';
import {
  LayoutDashboard, Droplets, UtensilsCrossed,
  CheckSquare, Target, Timer, BarChart3, Settings, MoreHorizontal
} from 'lucide-react';

const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'hydration', label: 'Water', icon: Droplets },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

const MORE_ITEMS = [
  { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const activePage = useStore(s => s.activePage);
  const setPage = useStore(s => s.setPage);

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-inner">
        {MOBILE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.id === 'more'
            ? MORE_ITEMS.some(m => m.id === activePage)
            : activePage === tab.id;

          return (
            <button
              key={tab.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (tab.id === 'more') {
                  // Cycle through more items
                  const currentIdx = MORE_ITEMS.findIndex(m => m.id === activePage);
                  const nextIdx = (currentIdx + 1) % MORE_ITEMS.length;
                  setPage(MORE_ITEMS[nextIdx].id);
                } else {
                  setPage(tab.id);
                }
              }}
            >
              <span className="nav-icon"><Icon size={20} /></span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
