import React, { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import * as utils from '../utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { accounts, currentMonthIndex, setCurrentMonthIndex } = useApp();
  const chartRef = useRef<ChartJS<'bar', number[], string> | null>(null);

  const changeMonth = (dir: number) => {
    setCurrentMonthIndex(Math.max(0, Math.min(11, currentMonthIndex + dir)));
  };

  const renderChart = () => {
    const labels: string[] = [];
    const takeHome: number[] = [];
    const saved: number[] = [];
    const cumul: number[] = [];
    let cum = 0;
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

    for (let i = 0; i < 12; i++) {
      labels.push(months[i]);
      const out = utils.monthOutflows(accounts, i);
      cum += out;
      takeHome.push(Math.max(0, utils.SALARY - out));
      saved.push(out);
      cumul.push(cum);
    }

    return {
      labels,
      datasets: [
        { label: 'Take-home', data: takeHome, backgroundColor: '#639922' },
        { label: 'Saved/Invested', data: saved, backgroundColor: '#E24B4A' },
        {
          label: 'Cumul. savings',
          data: cumul,
          type: 'line' as const,
          borderColor: '#378ADD',
          backgroundColor: 'rgba(55,138,221,0.08)',
          pointBackgroundColor: '#378ADD',
          tension: 0.3,
          yAxisID: 'y2',
          pointRadius: 3
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ctx.dataset.label + ': $' + ctx.parsed.y.toLocaleString()
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { stacked: true, grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { font: { size: 11 }, callback: (v: any) => '$' + v } },
      y2: { position: 'right' as const, grid: { display: false }, ticks: { font: { size: 11 }, callback: (v: any) => '$' + v } }
    }
  };

  const d = utils.getMonthDate(currentMonthIndex);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = months[d.getMonth()] + ' ' + d.getFullYear();
  const out = utils.monthOutflows(accounts, currentMonthIndex);
  const takehome = utils.SALARY - out;
  const cumSaved = Array.from({ length: currentMonthIndex + 1 }, (_, i) => utils.monthOutflows(accounts, i)).reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Savings Tracker Dashboard</h1>

      <div className="flex items-center justify-center mb-6">
        <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-200 rounded-l">←</button>
        <span className="px-4 py-2 bg-gray-100">{monthLabel}</span>
        <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-200 rounded-r">→</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Monthly income</div>
          <div className="text-2xl font-bold text-blue-600">{utils.formatMoney(utils.SALARY)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total saved/invested</div>
          <div className="text-2xl font-bold text-red-600">{utils.formatMoney(out)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Take-home left</div>
          <div className="text-2xl font-bold text-green-600">{utils.formatMoney(Math.max(0, takehome))}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Cumul. saved</div>
          <div className="text-2xl font-bold">{utils.formatMoney(cumSaved)}</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Monthly cash flow</h2>
      <div className="mb-4">
        <span className="inline-block w-4 h-4 bg-green-600 mr-2"></span>Take-home (after savings)
        <span className="inline-block w-4 h-4 bg-red-600 ml-4 mr-2"></span>Total saved/invested
        <span className="inline-block w-4 h-4 bg-blue-600 ml-4 mr-2"></span>Cumulative savings
      </div>
      <div className="h-64 mb-6">
        <Chart ref={chartRef} type="bar" data={renderChart()} options={chartOptions} />
      </div>

      <h2 className="text-xl font-semibold mb-4">Active savings plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {accounts.map(plan => {
          const bal = utils.getAccountBalance(plan, currentMonthIndex);
          const prog = utils.getAccountProgress(plan, currentMonthIndex);
          const start = new Date(plan.startDate);
          const end = utils.planEndDate(plan);
          const scheduleLabel = `${plan.amount}/${plan.freq}`;

          return (
            <div key={plan.id} className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: plan.dotColor }}></span>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {scheduleLabel} · {plan.durationValue} {plan.durationUnit}{plan.durationValue !== 1 ? 's' : ''}<br />
                Target: {utils.formatMoney(plan.total)}
              </div>
              <div className="text-lg font-bold mb-2">{utils.formatMoney(bal)}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div className="h-2 rounded-full" style={{ width: `${Math.round(prog * 100)}%`, backgroundColor: plan.dotColor }}></div>
              </div>
              <div className="text-xs text-gray-500">{Math.round(prog * 100)}% complete</div>
              <div className="text-xs text-gray-500">{start.toLocaleDateString()} → {end.toLocaleDateString()}</div>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-semibold mb-4">Savings timeline (12 months from Apr 2025)</h2>
      <div className="space-y-4">
        {accounts.map(plan => {
          const start = utils.parseDate(plan.startDate);
          const end = utils.planEndDate(plan);
          const timelineStart = utils.parseDate(utils.getMonthDate(0).toISOString().split('T')[0]);
          const timelineEnd = new Date(utils.getMonthDate(0).getFullYear(), utils.getMonthDate(0).getMonth() + 12, 0);
          const totalDays = Math.max(1, utils.rangeDays(timelineStart, timelineEnd));
          const startPct = Math.max(0, Math.min(100, (utils.rangeDays(timelineStart, start) / totalDays) * 100));
          const durPct = Math.max(0, Math.min(100, (utils.rangeDays(start, end) / totalDays) * 100));

          return (
            <div key={plan.id}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.dotColor }}></span>
                  {plan.name}
                </span>
                <span>{utils.formatMoney(plan.amount)}/{plan.freq}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 relative">
                <div className="h-2 rounded-full absolute" style={{ left: `${startPct}%`, width: `${durPct}%`, backgroundColor: plan.dotColor }}></div>
              </div>
            </div>
          );
        })}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Apr 25</span><span>Jul 25</span><span>Oct 25</span><span>Jan 26</span><span>Apr 26</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;