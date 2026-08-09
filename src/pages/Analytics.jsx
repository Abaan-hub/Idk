import React, { useMemo } from 'react';
import { useStore } from '../store';
import { daysAgo, today, getProductivityScore } from '../utils';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { BarChart3, TrendingUp, Activity, Droplets, Flame, Target } from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  Filler 
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  Filler
);

const Analytics = () => {
  const { habits, todos, pomoSessions, waterLogs, foodLogs } = useStore();

  const productivityScore = getProductivityScore(habits, todos, pomoSessions);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
        beginAtZero: true
      }
    }
  };

  const chartData = useMemo(() => {
    // Generate last 14 days labels (MM-DD)
    const labels = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    // Generate dates string array for matching
    const dates = Array.from({ length: 14 }, (_, i) => daysAgo(13 - i));

    // Focus Time Data
    const focusData = dates.map(date => {
      return pomoSessions
        .filter(p => p.date === date)
        .reduce((sum, p) => sum + (p.duration_min || 0), 0);
    });

    // Habit Completion Data
    const habitData = dates.map(date => {
      return habits.filter(h => h.completedDays?.[date]).length;
    });

    // Water Data
    const waterData = dates.map(date => {
      return waterLogs
        .filter(w => w.date === date)
        .reduce((sum, w) => sum + w.amount_ml, 0);
    });

    // Calorie Data
    const calorieData = dates.map(date => {
      return foodLogs
        .filter(f => f.date === date)
        .reduce((sum, f) => sum + f.calories, 0);
    });

    return {
      labels,
      focus: {
        labels,
        datasets: [{
          data: focusData,
          backgroundColor: 'rgba(129,140,248,0.6)',
          borderRadius: 4
        }]
      },
      habits: {
        labels,
        datasets: [{
          data: habitData,
          backgroundColor: 'rgba(52,211,153,0.6)',
          borderRadius: 4
        }]
      },
      water: {
        labels,
        datasets: [{
          data: waterData,
          borderColor: 'rgba(56,189,248,1)',
          backgroundColor: 'rgba(56,189,248,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      calories: {
        labels,
        datasets: [{
          data: calorieData,
          borderColor: 'rgba(251,191,36,1)',
          backgroundColor: 'rgba(251,191,36,0.1)',
          fill: true,
          tension: 0.4
        }]
      }
    };
  }, [pomoSessions, habits, waterLogs, foodLogs]);

  return (
    <div className="analytics-page scroll-area" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <BarChart3 size={32} color="#818CF8" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>Analytics</h1>
      </header>

      {/* Summary Cards */}
      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Card className="glass-card flex items-center justify-between p-4">
          <div>
            <div className="text-muted text-sm mb-1 flex items-center gap-sm">
              <Activity size={16} /> Productivity
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{productivityScore}%</div>
          </div>
          <ProgressRing progress={productivityScore} size={80} strokeWidth={8} color="#818CF8" />
        </Card>

        <Card className="glass-card p-4">
          <div className="text-muted text-sm mb-1 flex items-center gap-sm">
            <TrendingUp size={16} color="#34D399" /> Weekly Habit Avg
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {(chartData.habits.datasets[0].data.slice(-7).reduce((a,b)=>a+b,0) / 7).toFixed(1)} <span className="text-sm text-muted">/ day</span>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="text-muted text-sm mb-1 flex items-center gap-sm">
            <Flame size={16} color="#FBBF24" /> Avg Calories (7d)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {Math.round(chartData.calories.datasets[0].data.slice(-7).reduce((a,b)=>a+b,0) / 7)} <span className="text-sm text-muted">kcal</span>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Focus Time Chart */}
        <Card className="glass-card">
          <h3 className="flex items-center gap-sm mb-4">
            <TrendingUp size={20} color="#818CF8" /> Focus Time (14 Days)
          </h3>
          <div className="chart-container" style={{ height: '200px' }}>
            <Bar data={chartData.focus} options={chartOptions} />
          </div>
        </Card>

        {/* Habit Completion Chart */}
        <Card className="glass-card">
          <h3 className="flex items-center gap-sm mb-4">
            <Target size={20} color="#34D399" /> Habits Completed (14 Days)
          </h3>
          <div className="chart-container" style={{ height: '200px' }}>
            <Bar data={chartData.habits} options={chartOptions} />
          </div>
        </Card>

        {/* Water Chart */}
        <Card className="glass-card">
          <h3 className="flex items-center gap-sm mb-4">
            <Droplets size={20} color="#38BDF8" /> Water Intake (14 Days)
          </h3>
          <div className="chart-container" style={{ height: '200px' }}>
            <Line data={chartData.water} options={chartOptions} />
          </div>
        </Card>

        {/* Calories Chart */}
        <Card className="glass-card">
          <h3 className="flex items-center gap-sm mb-4">
            <Flame size={20} color="#FBBF24" /> Calorie Intake (14 Days)
          </h3>
          <div className="chart-container" style={{ height: '200px' }}>
            <Line data={chartData.calories} options={chartOptions} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
