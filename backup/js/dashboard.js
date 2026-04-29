// Dashboard functionality

let overviewChart = null;
let accounts = [];

function initDashboard() {
  accounts = AppUtils.loadAccounts();
  renderOverview();
}

function changeMonth(dir) {
  window.currentMonthIndex = Math.max(0, Math.min(11, window.currentMonthIndex + dir));
  renderOverview();
}

function renderOverview() {
  const d = AppUtils.getMonthDate(window.currentMonthIndex);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('month-label').textContent = months[d.getMonth()] + ' ' + d.getFullYear();
  const mIdx = window.currentMonthIndex;
  const out = AppUtils.monthOutflows(accounts, mIdx);
  const takehome = AppUtils.SALARY - out;
  const cumSaved = Array.from({ length: mIdx + 1 }, (_, i) => AppUtils.monthOutflows(accounts, i)).reduce((a, b) => a + b, 0);

  const m = document.getElementById('metrics');
  m.innerHTML = `
    <div class="metric"><div class="metric-label">Monthly income</div><div class="metric-value blue">${AppUtils.formatMoney(AppUtils.SALARY)}</div></div>
    <div class="metric"><div class="metric-label">Total saved/invested</div><div class="metric-value red">${AppUtils.formatMoney(out)}</div></div>
    <div class="metric"><div class="metric-label">Take-home left</div><div class="metric-value green">${AppUtils.formatMoney(Math.max(0, takehome))}</div></div>
    <div class="metric"><div class="metric-label">Cumul. saved</div><div class="metric-value">${AppUtils.formatMoney(cumSaved)}</div></div>
  `;

  renderChart();
  renderAccounts();
}

function renderChart() {
  const labels = [];
  const takeHome = [];
  const saved = [];
  const cumul = [];
  let cum = 0;
  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

  for (let i = 0; i < 12; i++) {
    labels.push(months[i]);
    const out = AppUtils.monthOutflows(accounts, i);
    cum += out;
    takeHome.push(Math.max(0, AppUtils.SALARY - out));
    saved.push(out);
    cumul.push(cum);
  }

  if (overviewChart) overviewChart.destroy();
  overviewChart = new Chart(document.getElementById('overviewChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Take-home', data: takeHome, backgroundColor: '#639922', stack: 'a' },
        { label: 'Saved/Invested', data: saved, backgroundColor: '#E24B4A', stack: 'a' },
        { label: 'Cumul. savings', data: cumul, type: 'line', borderColor: '#378ADD', backgroundColor: 'rgba(55,138,221,0.08)', pointBackgroundColor: '#378ADD', tension: 0.3, yAxisID: 'y2', pointRadius: 3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': $' + ctx.parsed.y.toLocaleString()
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { stacked: true, grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { font: { size: 11 }, callback: v => '$' + v } },
        y2: { position: 'right', grid: { display: false }, ticks: { font: { size: 11 }, callback: v => '$' + v } }
      }
    }
  });
}

function renderAccounts() {
  const mIdx = window.currentMonthIndex;
  const grid = document.getElementById('accounts-grid');
  grid.innerHTML = accounts.map(plan => {
    const bal = AppUtils.getAccountBalance(plan, mIdx);
    const prog = AppUtils.getAccountProgress(plan, mIdx);
    const start = new Date(plan.startDate);
    const end = AppUtils.planEndDate(plan);
    const scheduleLabel = `${plan.amount}/${plan.freq}`;

    return `<div class="account-card">
      <div class="account-name"><span class="account-dot" style="background:${plan.dotColor}"></span>${plan.name}</div>
      <div class="account-detail">${scheduleLabel} · ${plan.durationValue} ${plan.durationUnit}${plan.durationValue !== 1 ? 's' : ''}<br>Target: ${AppUtils.formatMoney(plan.total)}</div>
      <div class="account-balance">${AppUtils.formatMoney(bal)}</div>
      <div class="account-progress"><div class="account-progress-fill" style="width:${Math.round(prog * 100)}%;background:${plan.dotColor}"></div></div>
      <div style="font-size:10px;color:var(--color-text-secondary);margin-top:4px;">${Math.round(prog * 100)}% complete</div>
      <div style="font-size:10px;color:var(--color-text-secondary);margin-top:4px;">${start.toLocaleDateString()} → ${end.toLocaleDateString()}</div>
    </div>`;
  }).join('');

  const ts = document.getElementById('timeline-section');
  ts.innerHTML = accounts.map(plan => {
    const start = AppUtils.parseDate(plan.startDate);
    const end = AppUtils.planEndDate(plan);
    const timelineStart = AppUtils.parseDate(AppUtils.START.toISOString().split('T')[0]);
    const timelineEnd = new Date(AppUtils.START.getFullYear(), AppUtils.START.getMonth() + 12, 0);
    const totalDays = Math.max(1, AppUtils.rangeDays(timelineStart, timelineEnd));
    const startPct = Math.max(0, Math.min(100, (AppUtils.rangeDays(timelineStart, start) / totalDays) * 100));
    const durPct = Math.max(0, Math.min(100, (AppUtils.rangeDays(start, end) / totalDays) * 100));

    return `<div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-secondary);margin-bottom:4px;">
        <span style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:${plan.dotColor};display:inline-block;"></span>${plan.name}</span>
        <span>${AppUtils.formatMoney(plan.amount)}/${plan.freq}</span>
      </div>
      <div class="timeline-bar">
        <div class="timeline-bar-fill" style="left:${startPct}%;width:${durPct}%;background:${plan.dotColor};"></div>
      </div>
    </div>`;
  }).join('') + `<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--color-text-secondary);margin-top:-8px;">
    <span>Apr 25</span><span>Jul 25</span><span>Oct 25</span><span>Jan 26</span><span>Apr 26</span>
  </div>`;
}

document.addEventListener('DOMContentLoaded', initDashboard);