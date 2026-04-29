export interface Account {
  id: string;
  name: string;
  color: string;
  dotColor: string;
  amount: number;
  freq: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  durationValue: number;
  durationUnit: 'day' | 'week' | 'month' | 'year';
  total: number;
}

export interface Transaction {
  date: string;
  desc: string;
  amount: number;
  type: 'in' | 'out';
}

export const SALARY = 3500;
export const PLAN_COLORS = ['#378ADD', '#3B6D11', '#BA7517', '#7F77DD', '#D85A30', '#2A9D8F', '#B07AA1'];

export const DEFAULT_ACCOUNTS: Account[] = [
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

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { date: '2025-04-20', desc: 'Monthly salary', amount: 3500, type: 'in' },
  { date: '2025-04-20', desc: 'Daily savings (start)', amount: 30, type: 'out' },
  { date: '2025-04-20', desc: 'Monthly savings $200', amount: 200, type: 'out' },
  { date: '2025-04-20', desc: 'Stocks', amount: 500, type: 'out' },
  { date: '2025-04-20', desc: 'Crypto', amount: 500, type: 'out' }
];