import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Account, Transaction } from '../types';
import * as utils from '../utils';
import SectionHeader from '../components/SectionHeader';
import TabToggle from '../components/TabToggle';
import RegisterCalendar from '../components/RegisterCalendar';
import PlanCard from '../components/PlanCard';

const RegisterPage: React.FC = () => {
  const { accounts, transactions, currentMonthIndex, setCurrentMonthIndex, updateAccounts, updateTransactions } = useApp();
  const [activeTab, setActiveTab] = useState<'transactions' | 'plans'>('transactions');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const changeMonth = (delta: number) => {
    setCurrentMonthIndex(Math.max(0, Math.min(11, currentMonthIndex + delta)));
  };

  const openModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const createTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const desc = (form.elements.namedItem('desc') as HTMLInputElement).value.trim();
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const type = (form.elements.namedItem('type') as HTMLSelectElement).value as 'in' | 'out';

    if (!desc || !amount) return;

    const newTransaction: Transaction = { date: selectedDate, desc, amount, type };
    updateTransactions([...transactions, newTransaction]);
    closeModal();
  };

  const createSavePlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = (form.elements.namedItem('plan-name') as HTMLInputElement).value.trim();
    const amount = parseFloat((form.elements.namedItem('plan-amount') as HTMLInputElement).value);
    const freq = (form.elements.namedItem('plan-frequency') as HTMLSelectElement).value as Account['freq'];
    const durationValue = parseInt((form.elements.namedItem('plan-duration') as HTMLInputElement).value, 10);
    const durationUnit = (form.elements.namedItem('plan-duration-unit') as HTMLSelectElement).value as Account['durationUnit'];
    const startDate = (form.elements.namedItem('plan-start-date') as HTMLInputElement).value;

    if (!name || !amount || !durationValue || !startDate) return;

    if (editingPlanId) {
      const updatedAccounts = accounts.map(plan =>
        plan.id === editingPlanId
          ? {
              ...plan,
              name,
              amount,
              freq,
              startDate,
              durationValue,
              durationUnit,
              total: amount * utils.countPlanOccurrencesInRange({
                ...plan,
                amount,
                freq,
                startDate,
                durationValue,
                durationUnit
              }, utils.parseDate(startDate), utils.planEndDate({
                ...plan,
                amount,
                freq,
                startDate,
                durationValue,
                durationUnit
              }))
            }
          : plan
      );
      updateAccounts(updatedAccounts);
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
      plan.total = amount * utils.countPlanOccurrencesInRange(plan, utils.parseDate(startDate), utils.planEndDate(plan));
      updateAccounts([...accounts, plan]);
    }

    form.reset();
    setActiveTab('transactions');
  };

  const deletePlan = (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this savings plan?')) return;
    updateAccounts(accounts.filter(plan => plan.id !== planId));
  };

  const currentCalendarDate = utils.getMonthDate(currentMonthIndex);

  return (
    <section className="register-page">
      <SectionHeader title="Transaction registration" description="Log cash flow and manage your savings with a clean monthly calendar." />
      <TabToggle
        items={[
          { key: 'transactions', label: 'Transactions' },
          { key: 'plans', label: 'Savings plans' }
        ]}
        activeKey={activeTab}
        onChange={key => setActiveTab(key as 'transactions' | 'plans')}
      />

      {activeTab === 'transactions' ? (
        <div className="transactions-panel">
          <div className="month-selector">
            <button type="button" onClick={() => changeMonth(-1)} className="month-action">← Previous</button>
            <span className="month-label">{currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button type="button" onClick={() => changeMonth(1)} className="month-action">Next →</button>
          </div>
          <RegisterCalendar
            currentMonthIndex={currentMonthIndex}
            accounts={accounts}
            transactions={transactions}
            onSelectDate={openModal}
          />
        </div>
      ) : (
        <div className="plans-panel">
          <div className="plan-form-panel">
            <h3>New savings plan</h3>
            <form onSubmit={createSavePlan} className="plan-form">
              <label>
                Plan name
                <input name="plan-name" type="text" required />
              </label>
              <label>
                Amount
                <input name="plan-amount" type="number" step="0.01" required />
              </label>
              <label>
                Frequency
                <select name="plan-frequency">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <label>
                Duration
                <input name="plan-duration" type="number" min="1" required />
              </label>
              <label>
                Duration unit
                <select name="plan-duration-unit">
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                  <option value="year">Year(s)</option>
                </select>
              </label>
              <label>
                Start date
                <input name="plan-start-date" type="date" required />
              </label>
              <button type="submit" className="submit-button">
                {editingPlanId ? 'Update plan' : 'Save plan'}
              </button>
            </form>
          </div>

          <div className="plan-list-panel">
            <h3>Your savings plans</h3>
            <div className="plan-list">
              {accounts.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currentMonthIndex={currentMonthIndex}
                  actions={(
                    <div className="plan-actions">
                      <button type="button" onClick={() => setEditingPlanId(plan.id)} className="action-button">
                        Edit
                      </button>
                      <button type="button" onClick={() => deletePlan(plan.id)} className="action-button danger">
                        Delete
                      </button>
                    </div>
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <h3>Add transaction for {selectedDate}</h3>
            <form onSubmit={createTransaction}>
              <label>
                Description
                <input name="desc" type="text" required />
              </label>
              <label>
                Amount
                <input name="amount" type="number" step="0.01" required />
              </label>
              <label>
                Type
                <select name="type">
                  <option value="out">Expense</option>
                  <option value="in">Income</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={closeModal} className="secondary-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default RegisterPage;
