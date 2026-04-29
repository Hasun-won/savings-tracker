// Shared utilities for the savings tracker app

// Constants
const SALARY = 3500;
const START = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Current month start

const PLAN_COLORS = ['#378ADD', '#3B6D11', '#BA7517', '#7F77DD', '#D85A30', '#2A9D8F', '#B07AA1'];

// Global state
window.currentMonthIndex = 0;

// Default plans
const DEFAULT_ACCOUNTS = [
  {
    id: 'daily',
    name: 'Daily savings',
    color: '#378ADD',
    dotColor: '#378ADD',
    amount: 30,
    freq: 'daily',
    startDate: `${new Date().getFullYear()}-04-20`,
    durationValue: 100,
    durationUnit: 'day',
    total: 3000
  },
  {
    id: 'monthly200',
    name: 'Monthly savings',
    color: '#3B6D11',
    dotColor: '#639922',
    amount: 200,
    freq: 'monthly',
    startDate: `${new Date().getFullYear()}-04-01`,
    durationValue: 12,
    durationUnit: 'month',
    total: 2400
  },
  {
    id: 'monthly500',
    name: 'May savings',
    color: '#BA7517',
    dotColor: '#EF9F27',
    amount: 500,
    freq: 'monthly',
    startDate: `${new Date().getFullYear()}-05-01`,
    durationValue: 12,
    durationUnit: 'month',
    total: 6000
  },
  {
    id: 'stocks',
    name: 'Stocks',
    color: '#7F77DD',
    dotColor: '#7F77DD',
    amount: 500,
    freq: 'monthly',
    startDate: `${new Date().getFullYear()}-04-01`,
    durationValue: 12,
    durationUnit: 'month',
    total: 6000
  },
  {
    id: 'crypto',
    name: 'Crypto',
    color: '#D85A30',
    dotColor: '#D85A30',
    amount: 500,
    freq: 'monthly',
    startDate: `${new Date().getFullYear()}-04-01`,
    durationValue: 12,
    durationUnit: 'month',
    total: 6000
  }
];

// Default transactions
const DEFAULT_TRANSACTIONS = [
  { date: '2025-04-20', desc: 'Monthly salary', amount: 3500, type: 'in' },
  { date: '2025-04-20', desc: 'Daily savings (start)', amount: 30, type: 'out' },
  { date: '2025-04-20', desc: 'Monthly savings $200', amount: 200, type: 'out' },
  { date: '2025-04-20', desc: 'Stocks', amount: 500, type: 'out' },
  { date: '2025-04-20', desc: 'Crypto', amount: 500, type: 'out' }
];

// localStorage keys
const STORAGE_KEYS = {
  ACCOUNTS: 'savings_accounts',
  TRANSACTIONS: 'savings_transactions'
};

function parseDate(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateString(date) {
  return date.toISOString().split('T')[0];
}

function formatMoney(n) {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getMonthDate(offset = 0) {
  const d = new Date(START);
  d.setMonth(d.getMonth() + offset);
  return d;
}

function addDuration(date, value, unit) {
  const d = new Date(date);
  if (unit === 'day') {
    d.setDate(d.getDate() + value);
    return d;
  }
  if (unit === 'week') {
    d.setDate(d.getDate() + value * 7);
    return d;
  }
  if (unit === 'month') {
    d.setMonth(d.getMonth() + value);
    return d;
  }
  if (unit === 'year') {
    d.setFullYear(d.getFullYear() + value);
    return d;
  }
  return d;
}

function planEndDate(plan) {
  const start = parseDate(plan.startDate);
  const end = addDuration(start, plan.durationValue, plan.durationUnit);
  end.setDate(end.getDate() - 1);
  return end;
}

function normalizePlan(raw) {
  const plan = { ...raw };
  if (!plan.startDate) {
    const start = new Date(START);
    if (typeof plan.startM === 'number') start.setMonth(plan.startM);
    start.setDate(plan.startD || 1);
    plan.startDate = toDateString(start);
  }
  if (!plan.durationValue || !plan.durationUnit) {
    if (plan.freq === 'daily') {
      plan.durationValue = plan.days || 100;
      plan.durationUnit = 'day';
    } else {
      plan.durationValue = plan.months || 12;
      plan.durationUnit = 'month';
    }
  }
  if (!plan.total) {
    const end = planEndDate(plan);
    const occurrences = countPlanOccurrencesInRange(plan, parseDate(plan.startDate), end);
    plan.total = plan.amount * occurrences;
  }
  if (!plan.color) plan.color = plan.dotColor || PLAN_COLORS[0];
  if (!plan.dotColor) plan.dotColor = plan.color;
  if (!plan.freq) plan.freq = 'monthly';
  return plan;
}

function rangeDays(start, end) {
  return Math.floor((end - start) / 86400000);
}

function countPlanOccurrencesInRange(plan, rangeStart, rangeEnd) {
  const start = parseDate(plan.startDate);
  const end = planEndDate(plan);
  if (rangeEnd < start || rangeStart > end) return 0;

  const from = rangeStart > start ? rangeStart : start;
  const to = rangeEnd < end ? rangeEnd : end;

  if (plan.freq === 'daily') {
    return rangeDays(from, to) + 1;
  }

  if (plan.freq === 'weekly') {
    const offsetDays = rangeDays(start, from);
    const firstOccurrence = new Date(start);
    if (offsetDays > 0) {
      const weeks = Math.ceil(offsetDays / 7);
      firstOccurrence.setDate(firstOccurrence.getDate() + weeks * 7);
    }
    if (firstOccurrence > to) return 0;
    return Math.floor(rangeDays(firstOccurrence, to) / 7) + 1;
  }

  if (plan.freq === 'monthly') {
    let count = 0;
    const planStart = parseDate(plan.startDate);
    const targetDay = planStart.getDate();
    let cursor = new Date(from.getFullYear(), from.getMonth(), targetDay);
    if (cursor < from) cursor.setMonth(cursor.getMonth() + 1);

    while (cursor <= to) {
      let candidate = new Date(cursor.getFullYear(), cursor.getMonth(), targetDay);
      if (candidate.getMonth() !== cursor.getMonth()) {
        candidate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      }
      if (candidate > to) break;
      if (candidate >= from) count += 1;
      cursor.setMonth(cursor.getMonth() + 1);
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    }
    return count;
  }

  return 0;
}

function planOccursOnDate(plan, dateStr) {
  const date = parseDate(dateStr);
  const start = parseDate(plan.startDate);
  const end = planEndDate(plan);
  if (date < start || date > end) return false;

  if (plan.freq === 'daily') return true;
  if (plan.freq === 'weekly') {
    return rangeDays(start, date) % 7 === 0;
  }
  if (plan.freq === 'monthly') {
    const targetDay = start.getDate();
    let candidate = new Date(date.getFullYear(), date.getMonth(), targetDay);
    if (candidate.getMonth() !== date.getMonth()) {
      candidate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    return candidate.getTime() === date.getTime();
  }
  return false;
}

function getMonthRange(mIdx) {
  const monthStart = getMonthDate(mIdx);
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  return { start: monthStart, end: monthEnd };
}

function monthOutflows(accounts, mIdx) {
  const { start, end } = getMonthRange(mIdx);
  return accounts.reduce((sum, plan) => {
    const count = countPlanOccurrencesInRange(plan, start, end);
    return sum + count * plan.amount;
  }, 0);
}

function getAccountBalance(acc, mIdx) {
  const { end } = getMonthRange(mIdx);
  const start = parseDate(acc.startDate);
  if (end < start) return 0;
  return countPlanOccurrencesInRange(acc, start, end) * acc.amount;
}

function getAccountProgress(acc, mIdx) {
  return acc.total > 0 ? Math.min(1, getAccountBalance(acc, mIdx) / acc.total) : 0;
}

function getPlanSummary(plan) {
  return `${plan.amount}/${plan.freq}`;
}

function getRandomPlanColor() {
  return PLAN_COLORS[Math.floor(Math.random() * PLAN_COLORS.length)];
}

function generatePlanId() {
  return `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// localStorage functions
function loadAccounts() {
  const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  return (stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS).map(normalizePlan);
}

function saveAccounts(accounts) {
  const normalized = accounts.map(normalizePlan);
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(normalized));
}

function loadTransactions() {
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return stored ? JSON.parse(stored) : DEFAULT_TRANSACTIONS;
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Export for use in other scripts
window.AppUtils = {
  SALARY,
  START,
  formatMoney,
  parseDate,
  rangeDays,
  getMonthDate,
  monthOutflows,
  getAccountBalance,
  getAccountProgress,
  getPlanSummary,
  planOccursOnDate,
  countPlanOccurrencesInRange,
  planEndDate,
  getRandomPlanColor,
  generatePlanId,
  loadAccounts,
  saveAccounts,
  loadTransactions,
  saveTransactions
};