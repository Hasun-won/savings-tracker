import React, { useRef } from 'react';
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
  ChartOptions,
  ChartData
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { SALARY } from '../types';
import * as utils from '../utils';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import PlanCard from '../components/PlanCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const DashboardPage: React.FC = () => {
  const { accounts, currentMonthIndex, setCurrentMonthIndex } = useApp();
  const chartRef = useRef<ChartJS<'bar' | 'line', number[], string> | null>(null);

  const changeMonth = (delta: number) => {
    setCurrentMonthIndex(Math.max(0, Math.min(11, currentMonthIndex + delta)));
  };

  const renderChart = (): ChartData<'bar' | 'line', number[], string> => {
    const labels: string[] = [];
    const takeHome: number[] = [];
    const saved: number[] = [];
    const cumul: number[] = [];
    let cum = 0;
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

    for (let i = 0; i < 12; i += 1) {
      labels.push(months[i]);
      const out = utils.monthOutflows(accounts, i);
      cum += out;
      takeHome.push(Math.max(0, SALARY - out));
      saved.push(out);
      cumul.push(cum);
    }

    return {
      labels,
      datasets: [
        // saved/invested should form the bottom of the stacked bars
        {
          label: 'Saved/Invested',
          data: saved,
          backgroundColor: '#ef4444',
          stack: 'stack1',
          barThickness: 18,
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Take-home',
          data: takeHome,
          backgroundColor: '#059669',
          stack: 'stack1',
          barThickness: 18,
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Cumulative savings',
          data: cumul,
          type: 'line' as const,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.12)',
          pointBackgroundColor: '#2563eb',
          tension: 0.3,
          yAxisID: 'y2',
          pointRadius: 4
        }
      ]
    };
  };

  const chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      // enable stacking to ensure bars stack vertically and align neatly
      x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
      y: { stacked: true, grid: { color: 'rgba(148,163,184,0.12)' }, ticks: { callback: (value: any) => `$${value}` } },
      y2: { position: 'right' as const, grid: { display: false }, ticks: { callback: (value: any) => `$${value}` } }
    }
  };

  const currentDate = utils.getMonthDate(currentMonthIndex);
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const outflows = utils.monthOutflows(accounts, currentMonthIndex);
  const takehome = Math.max(0, SALARY - outflows);
  const cumSaved = Array.from({ length: currentMonthIndex + 1 }, (_, idx) => utils.monthOutflows(accounts, idx)).reduce((sum, value) => sum + value, 0);
  const takehomePct = Math.round((takehome / SALARY) * 100);
  const savedPct = Math.round((outflows / SALARY) * 100);

  return (
    <section className="dashboard-page">
      <SectionHeader title="Savings Tracker Dashboard" description="Your monthly income, savings, and active plans in one clean view." />

      <div className="month-selector">
        <button type="button" onClick={() => changeMonth(-1)} className="month-action">←</button>
        <span className="month-label">{monthLabel}</span>
        <button type="button" onClick={() => changeMonth(1)} className="month-action">→</button>
      </div>

      <div className="summary-grid">
        <StatCard label="Monthly income" value={utils.formatMoney(SALARY)} accent="primary" />
        <StatCard
          label="Total saved/invested"
          value={utils.formatMoney(outflows)}
          accent="warning"
          extra={(
            <div className="ratio-row">
              <div className="ratio-pill" style={{ backgroundColor: '#ef4444' }}>{`${savedPct}% saved`}</div>
            </div>
          )}
        />
        <StatCard
          label="Take-home left"
          value={utils.formatMoney(takehome)}
          accent="success"
          extra={(
            <div className="ratio-row">
              <div className="ratio-pill" style={{ backgroundColor: '#059669' }}>{`${takehomePct}% take-home`}</div>
            </div>
          )}
        />
        <StatCard label="Cumulative saved" value={utils.formatMoney(cumSaved)} accent="neutral" />
      </div>

      <div className="section-block">
        <SectionHeader title="Monthly cash flow" description="Compare take-home, savings, and cumulative results over the year." />
        <div className="chart-panel">
          <Chart ref={chartRef} type="bar" data={renderChart()} options={chartOptions} />
        </div>
      </div>

      <div className="section-block">
        <SectionHeader title="Active savings plans" description="Track each plan’s progress and balance." />
        <div className="plans-grid">
          {accounts.map(plan => (
            <PlanCard key={plan.id} plan={plan} currentMonthIndex={currentMonthIndex} />
          ))}
        </div>
      </div>

      <div className="section-block">
        <SectionHeader title="Savings timeline" description="Timeline for the next 12 months from April 2025." />
        <div className="timeline-grid">
          {accounts.map(plan => {
            const start = utils.parseDate(plan.startDate);
            const end = utils.planEndDate(plan);
            const timelineStart = utils.parseDate(utils.getMonthDate(0).toISOString().split('T')[0]);
            const timelineEnd = new Date(utils.getMonthDate(0).getFullYear(), utils.getMonthDate(0).getMonth() + 12, 0);
            const totalDays = Math.max(1, utils.rangeDays(timelineStart, timelineEnd));
            const startPct = Math.max(0, Math.min(100, (utils.rangeDays(timelineStart, start) / totalDays) * 100));
            const durPct = Math.max(0, Math.min(100, (utils.rangeDays(start, end) / totalDays) * 100));

            return (
              <div key={plan.id} className="timeline-row">
                <div className="timeline-meta">
                  <span className="timeline-color" style={{ backgroundColor: plan.dotColor }} />
                  <div>
                    <div className="timeline-name">{plan.name}</div>
                    <div className="timeline-subtitle">{plan.amount}/{plan.freq}</div>
                  </div>
                </div>
                <div className="timeline-bar">
                  <div className="timeline-track">
                    <div className="timeline-fill" style={{ left: `${startPct}%`, width: `${durPct}%`, backgroundColor: plan.dotColor }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
