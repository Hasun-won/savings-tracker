import React from 'react';
import { Account, Transaction } from '../types';
import * as utils from '../utils';

interface RegisterCalendarProps {
  currentMonthIndex: number;
  accounts: Account[];
  transactions: Transaction[];
  onSelectDate: (date: string) => void;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RegisterCalendar: React.FC<RegisterCalendarProps> = ({ currentMonthIndex, accounts, transactions, onSelectDate }) => {
  const currentDate = utils.getMonthDate(currentMonthIndex);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const days: React.ReactNode[] = [];
  let dayPointer = new Date(startDate);

  for (let i = 0; i < 42; i += 1) {
    const dateStr = dayPointer.toISOString().split('T')[0];
    const isCurrentMonth = dayPointer.getMonth() === month;
    const dayTransactions = transactions.filter(tx => tx.date === dateStr);
    const dayPlans = accounts.filter(plan => utils.planOccursOnDate(plan, dateStr));

    days.push(
      <button
        type="button"
        key={dateStr}
        onClick={() => onSelectDate(dateStr)}
        className={`calendar-cell ${isCurrentMonth ? '' : 'calendar-cell-muted'}`}
      >
        <div className="calendar-date">{dayPointer.getDate()}</div>
        <div className="event-list">
          {dayPlans.slice(0, 2).map(plan => (
            <span key={plan.id} className="event-pill" style={{ borderColor: plan.dotColor, color: plan.dotColor }}>
              {plan.name}
            </span>
          ))}
          {dayTransactions.slice(0, 2).map(tx => (
            <span key={`${tx.date}-${tx.desc}`} className={`event-pill ${tx.type === 'in' ? 'event-income' : 'event-expense'}`}>
              {tx.type === 'in' ? '+' : '-'}{utils.formatMoney(tx.amount)}
            </span>
          ))}
          {dayPlans.length + dayTransactions.length > 2 && (
            <span className="event-pill event-summary">+{dayPlans.length + dayTransactions.length - 2} more</span>
          )}
        </div>
      </button>
    );

    dayPointer.setDate(dayPointer.getDate() + 1);
  }

  return (
    <div className="calendar-panel">
      <div className="calendar-grid">
        {dayNames.map(name => (
          <div key={name} className="calendar-header-cell">{name}</div>
        ))}
        {days}
      </div>
    </div>
  );
};

export default RegisterCalendar;
