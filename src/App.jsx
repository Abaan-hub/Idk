import { useStore } from './store';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Hydration from './pages/Hydration';
import Nutrition from './pages/Nutrition';
import Exercise from './pages/Exercise';
import Tasks from './pages/Tasks';
import Habits from './pages/Habits';
import Focus from './pages/Focus';
import Sleep from './pages/Sleep';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { AnimatePresence } from 'framer-motion';

const PAGES = {
  dashboard: Dashboard,
  hydration: Hydration,
  nutrition: Nutrition,
  exercise: Exercise,
  tasks: Tasks,
  habits: Habits,
  focus: Focus,
  sleep: Sleep,
  journal: Journal,
  analytics: Analytics,
  settings: Settings,
};

export default function App() {
  const activePage = useStore(s => s.activePage);
  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <ErrorBoundary key={activePage}>
          <AnimatePresence mode="wait">
            <PageComponent key={activePage} />
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <MobileNav />
      <Toast />
    </div>
  );
}
