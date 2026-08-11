import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { daysAgo, getProductivityScore } from '../utils';
import ProgressRing from '../components/ProgressRing';
import { BarChart3, TrendingUp, Activity, Droplets, Flame, Target, Timer } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(13,18,37,0.97)',
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(124,58,237,0.25)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      displayColors: false,
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#334155', font: { size: 10 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: '#334155', font: { size: 10 } },
      border: { display: false },
      beginAtZero: true,
    }
  }
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export default function Analytics() {
  const habits = useStore(s => s.habits);
  const todos = useStore(s => s.todos);
  const pomoSessions = useStore(s => s.pomoSessions);
  const waterLogs = useStore(s => s.waterLogs);
  const foodLogs = useStore(s => s.foodLogs);

  const score = getProductivityScore(habits, todos, pomoSessions);

  const chartData = useMemo(() => {
    const dates = Array.from({ length: 14 }, (_, i) => daysAgo(13 - i));
    const labels = dates.map(d => d.slice(5));

    const focusData = dates.map(date =>
      pomoSessions.filter(p => p.date === date).reduce((s, p) => s + (p.duration_min || 0), 0)
    );
    const habitData = dates.map(date =>
      habits.filter(h => h.completedDays?.[date]).length
    );
    const waterData = dates.map(date =>
      waterLogs.filter(w => w.date === date).reduce((s, w) => s + w.amount_ml, 0)
    );
    const calorieData = dates.map(date =>
      foodLogs.filter(f => f.date === date).reduce((s, f) => s + (f.calories || 0), 0)
    );

    return { labels, focusData, habitData, waterData, calorieData };
  }, [pomoSessions, habits, waterLogs, foodLogs]);

  const mkBar = (data, color) => ({
    labels: chartData.labels,
    datasets: [{
      data, backgroundColor: color, borderRadius: 6, borderSkipped: false,
      hoverBackgroundColor: color.replace('0.5', '0.8'),
    }],
  });

  const mkLine = (data, color) => ({
    labels: chartData.labels,
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: color.replace('1)', '0.08)'),
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      borderWidth: 2,
    }],
  });

  const weekFocus = chartData.focusData.slice(-7).reduce((a, b) => a + b, 0);
  const weekHabits = chartData.habitData.slice(-7).reduce((a, b) => a + b, 0);
  const weekWater = chartData.waterData.slice(-7).reduce((a, b) => a + b, 0);
  const weekCal = chartData.calorieData.slice(-7).reduce((a, b) => a + b, 0);

  const charts = [
    { title: 'Focus Time', icon: <Timer size={18} />, cls: 'purple', data: mkBar(chartData.focusData, 'rgba(139,92,246,0.5)'), type: 'bar', sub: `${weekFocus}m this week` },
    { title: 'Habits Completed', icon: <Target size={18} />, cls: 'green', data: mkBar(chartData.habitData, 'rgba(52,211,153,0.5)'), type: 'bar', sub: `${weekHabits} this week` },
    { title: 'Water Intake', icon: <Droplets size={18} />, cls: 'cyan', data: mkLine(chartData.waterData, 'rgba(34,211,238,1)'), type: 'line', sub: `${Math.round(weekWater / 7)}ml avg/day` },
    { title: 'Calories', icon: <Flame size={18} />, cls: 'amber', data: mkLine(chartData.calorieData, 'rgba(251,191,36,1)'), type: 'line', sub: `${Math.round(weekCal / 7)} avg/day` },
  ];

  return (
    <motion.div className="page" initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp}>
        <div className="page-header">
          <h1><span className="gradient-text">Analytics</span></h1>
          <p className="text-muted">14-day overview of your progress</p>
        </div>
      </motion.div>

      {/* Score + Summary */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="glow-card animated-border" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, minWidth: 160 }}>
          <ProgressRing progress={score / 100} size={100} strokeWidth={8} label={`${score}`} sublabel="score" color="#a78bfa" />
        </div>
        {[
          { label: 'Focus This Week', value: `${weekFocus}m`, icon: <Timer size={16} />, cls: 'purple' },
          { label: 'Avg Water/Day', value: `${Math.round(weekWater / 7)}ml`, icon: <Droplets size={16} />, cls: 'cyan' },
          { label: 'Avg Calories/Day', value: `${Math.round(weekCal / 7)}`, icon: <Flame size={16} />, cls: 'amber' },
        ].map(s => (
          <div key={s.label} className={`stat-card-premium ${s.cls}`}>
            <div className="stat-card-label">
              <span className={`icon-box sm ${s.cls}`}>{s.icon}</span>
              {s.label}
            </div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        {charts.map((c, i) => (
          <motion.div
            key={c.title}
            className="glow-card"
            variants={fadeUp}
          >
            <div className="section-header">
              <div className="section-title">
                <span className={`icon-box sm ${c.cls}`}>{c.icon}</span>
                {c.title}
              </div>
              <span className="text-sm text-muted">{c.sub}</span>
            </div>
            <div style={{ height: 200, position: 'relative' }}>
              {c.type === 'bar'
                ? <Bar data={c.data} options={chartOptions} />
                : <Line data={c.data} options={chartOptions} />
              }
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
