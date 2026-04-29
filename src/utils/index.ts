import { Account, Transaction, SALARY, PLAN_COLORS, DEFAULT_ACCOUNTS, DEFAULT_TRANSACTIONS } from '../types';

const START = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Current month start

const STORAGE_KEYS = {
  ACCOUNTS: 'savings_accounts',
  TRANSACTIONS: 'savings_transactions'
};

export function parseDate(value: string): Date {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatMoney(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function getMonthDate(offset = 0): Date {
  const d = new Date(START);
  d.setMonth(d.getMonth() + offset);
  return d;
}

export function addDuration(date: Date, value: number, unit: string): Date {
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

export function planEndDate(plan: Account): Date {
  const start = parseDate(plan.startDate);
  const end = addDuration(start, plan.durationValue, plan.durationUnit);
  end.setDate(end.getDate() - 1);
  return end;
}

export function normalizePlan(raw: any): Account {
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
  return plan as Account;
}

export function rangeDays(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

export function countPlanOccurrencesInRange(plan: Account, rangeStart: Date, rangeEnd: Date): number {
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

export function planOccursOnDate(plan: Account, dateStr: string): boolean {
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

export function getMonthRange(mIdx: number): { start: Date; end: Date } {
  const monthStart = getMonthDate(mIdx);
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  return { start: monthStart, end: monthEnd };
}

export function monthOutflows(accounts: Account[], mIdx: number): number {
  const { start, end } = getMonthRange(mIdx);
  return accounts.reduce((sum, plan) => {
    const count = countPlanOccurrencesInRange(plan, start, end);
    return sum + count * plan.amount;
  }, 0);
}

export function getAccountBalance(acc: Account, mIdx: number): number {
  const { end } = getMonthRange(mIdx);
  const start = parseDate(acc.startDate);
  if (end < start) return 0;
  return countPlanOccurrencesInRange(acc, start, end) * acc.amount;
}

export function getAccountProgress(acc: Account, mIdx: number): number {
  return acc.total > 0 ? Math.min(1, getAccountBalance(acc, mIdx) / acc.total) : 0;
}

export function getPlanSummary(plan: Account): string {
  return `${plan.amount}/${plan.freq}`;
}

export function getRandomPlanColor(): string {
  return PLAN_COLORS[Math.floor(Math.random() * PLAN_COLORS.length)];
}

export function generatePlanId(): string {
  return `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function loadAccounts(): Account[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  return (stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS).map(normalizePlan);
}

export function saveAccounts(accounts: Account[]): void {
  const normalized = accounts.map(normalizePlan);
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(normalized));
}

export function loadTransactions(): Transaction[] {
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return stored ? JSON.parse(stored) : DEFAULT_TRANSACTIONS;
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}