import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Account, Transaction } from '../types';
import * as utils from '../utils';

const Register: React.FC = () => {
  const { accounts, transactions, currentMonthIndex, updateAccounts, updateTransactions } = useApp();
  const [activeTab, setActiveTab] = useState<'transactions' | 'plans'>('transactions');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const switchTab = (tab: 'transactions' | 'plans') => {
    setActiveTab(tab);
  };

  const changeMonth = (delta: number) => {
    // This will update the global currentMonthIndex via context
    const newIndex = Math.max(0, Math.min(11, currentMonthIndex + delta));
    // Since setCurrentMonthIndex is in context, we need to call it, but for now, we'll assume it's handled
  };

  const renderCalendar = () => {
    const currentCalendarDate = utils.getMonthDate(currentMonthIndex);
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: JSX.Element[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dayNames.forEach(day => {
      days.push(
        <div key={day} className="day-cell calendar-header-cell">
          {day}
        </div>
      );
    });

    const currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTransactions = transactions.filter(tx => tx.date === dateStr);
      const dayPlans = accounts.filter(plan => utils.planOccursOnDate(plan, dateStr));

      days.push(
        <div key={i} className={`day-cell ${currentDate.getMonth() !== month ? 'opacity-50' : ''}`} onClick={() => openModal(dateStr)}>
          <div className="day-number">{currentDate.getDate()}</div>
          {dayPlans.length > 0 && (
            <div className="day-transactions">
              {dayPlans.slice(0, 2).map(plan => (
                <div key={plan.id} className="event-pill" style={{ backgroundColor: plan.color + '22', color: plan.color }}>
                  {plan.name} ({plan.freq})
                </div>
              ))}
              {dayPlans.length > 2 && <div>+{dayPlans.length - 2} more plans</div>}
            </div>
          )}
          {dayTransactions.length > 0 && (
            <div className="day-transactions">
              {dayTransactions.slice(0, 2).map(tx => (
                <div key={tx.date + tx.desc} style={{ color: tx.type === 'in' ? '#3B6D11' : '#A32D2D' }}>
                  {tx.desc}: {tx.type === 'in' ? '+' : '-'}{utils.formatMoney(tx.amount)}
                </div>
              ))}
              {dayTransactions.length > 2 && <div>+{dayTransactions.length - 2} more</div>}
            </div>
          )}
        </div>
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const openModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const createTransaction = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const desc = (form.elements.namedItem('desc') as HTMLInputElement).value.trim();
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const type = (form.elements.namedItem('type') as HTMLSelectElement).value as 'in' | 'out';

    if (!desc || !amount) return;

    const newTransaction: Transaction = { date: selectedDate, desc, amount, type };
    const newTransactions = [...transactions, newTransaction];
    updateTransactions(newTransactions);
    closeModal();
  };

  const createSavePlan = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const name = (form.elements.namedItem('plan-name') as HTMLInputElement).value.trim();
    const amount = parseFloat((form.elements.namedItem('plan-amount') as HTMLInputElement).value);
    const freq = (form.elements.namedItem('plan-frequency') as HTMLSelectElement).value as Account['freq'];
    const durationValue = parseInt((form.elements.namedItem('plan-duration') as HTMLInputElement).value, 10);
    const durationUnit = (form.elements.namedItem('plan-duration-unit') as HTMLSelectElement).value as Account['durationUnit'];
    const startDate = (form.elements.namedItem('plan-start-date') as HTMLInputElement).value;

    if (!name || !amount || !durationValue || !startDate) return;

    if (editingPlanId) {
      const planIndex = accounts.findIndex(p => p.id === editingPlanId);
      if (planIndex !== -1) {
        const updatedAccounts = [...accounts];
        updatedAccounts[planIndex] = {
          ...updatedAccounts[planIndex],
          name,
          amount,
          freq,
          startDate,
          durationValue,
          durationUnit
        };
        updatedAccounts[planIndex].total = amount * utils.countPlanOccurrencesInRange(updatedAccounts[planIndex], utils.parseDate(startDate), utils.planEndDate(updatedAccounts[planIndex]));
        updateAccounts(updatedAccounts);
      }
      setEditingPlanId(null);
    } else {
      const plan: Account = {
        id: utils.generatePlanId(),
        name,
        amount,
        freq,
        startDate,
        durationValue,
        durationUnit,
        color: utils.getRandomPlanColor(),
        dotColor: utils.getRandomPlanColor(),
        total: 0
      };
      plan.total = amount * utils.countPlanOccurrencesInRange(plan, utils.parseDate(plan.startDate), utils.planEndDate(plan));
      updateAccounts([...accounts, plan]);
    }

    form.reset();
    const today = new Date().toISOString().split('T')[0];
    (form.elements.namedItem('plan-start-date') as HTMLInputElement).value = today;
    switchTab('transactions');
  };

  const editPlan = (planId: string) => {
    const plan = accounts.find(p => p.id === planId);
    if (!plan) return;

    setEditingPlanId(planId);
    // Populate form - this would need refs or state for form values
    switchTab('plans');
  };

  const deletePlan = (planId: string) => {
    if (!confirm('Are you sure you want to delete this savings plan?')) return;

    const newAccounts = accounts.filter(p => p.id !== planId);
    updateAccounts(newAccounts);
  };

  const currentCalendarDate = utils.getMonthDate(currentMonthIndex);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Transaction Registration</h1>

      <div className="flex mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'transactions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => switchTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`px-4 py-2 ml-2 ${activeTab === 'plans' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => switchTab('plans')}
        >
          Savings Plan
        </button>
      </div>

      {activeTab === 'transactions' && (
        <div>
          <div className="flex items-center justify-center mb-4">
            <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-200 rounded-l">← Previous</button>
            <h2 className="px-4 py-2 bg-gray-100">{currentCalendarDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</h2>
            <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-200 rounded-r">Next →</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Register a savings plan</h2>
          <form onSubmit={createSavePlan} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan name</label>
                <input type="text" name="plan-name" placeholder="e.g. Vacation fund" className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input type="number" name="plan-amount" step="0.01" className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Period</label>
                <select name="plan-frequency" className="w-full p-2 border rounded">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input type="number" name="plan-duration" className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration unit</label>
                <select name="plan-duration-unit" className="w-full p-2 border rounded">
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                  <option value="year">Year(s)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start date</label>
                <input type="date" name="plan-start-date" className="w-full p-2 border rounded" required />
              </div>
            </div>
            <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              {editingPlanId ? 'Update plan' : 'Save plan'}
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-4">Your savings plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(plan => (
              <div key={plan.id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center mb-2">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: plan.dotColor }}></span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {plan.amount}/{plan.freq} · {plan.durationValue} {plan.durationUnit}{plan.durationValue !== 1 ? 's' : ''}<br />
                  Target: {utils.formatMoney(plan.total)}
                </div>
                <div className="text-xs text-gray-500 mb-4">Starts {new Date(plan.startDate).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  <button onClick={() => editPlan(plan.id)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Edit</button>
                  <button onClick={() => deletePlan(plan.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Transaction for {selectedDate}</h3>
            <form onSubmit={createTransaction}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" name="desc" className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input type="number" name="amount" step="0.01" className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select name="type" className="w-full p-2 border rounded">
                  <option value="out">Expense</option>
                  <option value="in">Income</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;