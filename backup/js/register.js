// Registration page functionality

let transactions = [];
let accounts = [];
let editingPlanId = null;

function initRegister() {
  accounts = AppUtils.loadAccounts();
  transactions = AppUtils.loadTransactions();
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('plan-start-date').value = today;
  renderCalendar();
  renderPlanList();
  setupModal();
  switchRegisterTab('transactions');
}

function switchRegisterTab(tab) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.page-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('tab-btn-' + tab).classList.add('active');
}

function changeMonth(delta) {
  window.currentMonthIndex += delta;
  renderCalendar();
}

function renderCalendar() {
  const currentCalendarDate = AppUtils.getMonthDate(window.currentMonthIndex);
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  document.getElementById('calendar-title').textContent =
    currentCalendarDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const header = document.createElement('div');
    header.className = 'day-cell calendar-header-cell';
    header.textContent = day;
    grid.appendChild(header);
  });

  const currentDate = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.onclick = () => openModal(dateStr);

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = currentDate.getDate();
    dayCell.appendChild(dayNumber);

    if (currentDate.getMonth() !== month) {
      dayCell.style.opacity = '0.5';
    }

    const dayTransactions = transactions.filter(tx => tx.date === dateStr);
    const dayPlans = accounts.filter(plan => AppUtils.planOccursOnDate(plan, dateStr));

    if (dayPlans.length > 0) {
      const planDiv = document.createElement('div');
      planDiv.className = 'day-transactions';
      dayPlans.slice(0, 2).forEach(plan => {
        const pill = document.createElement('div');
        pill.className = 'event-pill';
        pill.textContent = `${plan.name} (${plan.freq})`;
        pill.style.background = plan.color + '22';
        pill.style.color = plan.color;
        planDiv.appendChild(pill);
      });
      if (dayPlans.length > 2) {
        const moreDiv = document.createElement('div');
        moreDiv.textContent = `+${dayPlans.length - 2} more plans`;
        planDiv.appendChild(moreDiv);
      }
      dayCell.appendChild(planDiv);
    }

    if (dayTransactions.length > 0) {
      const transactionsDiv = document.createElement('div');
      transactionsDiv.className = 'day-transactions';
      dayTransactions.slice(0, 2).forEach(tx => {
        const txDiv = document.createElement('div');
        txDiv.textContent = `${tx.desc}: ${tx.type === 'in' ? '+' : '-'}${AppUtils.formatMoney(tx.amount)}`;
        txDiv.style.color = tx.type === 'in' ? '#3B6D11' : '#A32D2D';
        transactionsDiv.appendChild(txDiv);
      });
      if (dayTransactions.length > 2) {
        const moreDiv = document.createElement('div');
        moreDiv.textContent = `+${dayTransactions.length - 2} more`;
        transactionsDiv.appendChild(moreDiv);
      }
      const total = dayTransactions.reduce((sum, tx) => sum + (tx.type === 'in' ? tx.amount : -tx.amount), 0);
      const totalDiv = document.createElement('div');
      totalDiv.className = `day-total ${total >= 0 ? 'in' : 'out'}`;
      totalDiv.textContent = AppUtils.formatMoney(Math.abs(total));
      transactionsDiv.appendChild(totalDiv);
      dayCell.appendChild(transactionsDiv);
    }

    grid.appendChild(dayCell);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function setupModal() {
  const modal = document.getElementById('transaction-modal');
  const form = document.getElementById('transaction-form');

  form.onsubmit = (e) => {
    e.preventDefault();
    const date = document.getElementById('tx-date').value;
    const desc = document.getElementById('tx-desc').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const type = document.getElementById('tx-type').value;

    if (date && desc && amount) {
      const newTx = { date, desc, amount: Math.abs(amount), type };
      transactions.push(newTx);
      AppUtils.saveTransactions(transactions);
      renderCalendar();
      closeModal();
    }
  };
}

function openModal(date) {
  const modal = document.getElementById('transaction-modal');
  document.getElementById('tx-date').value = date;
  document.getElementById('tx-desc').value = '';
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-type').value = 'out';
  document.getElementById('modal-title').textContent = `Add Transaction for ${new Date(date).toLocaleDateString()}`;
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('transaction-modal').style.display = 'none';
}

function createSavePlan(event) {
  event.preventDefault();
  const name = document.getElementById('plan-name').value.trim();
  const amount = parseFloat(document.getElementById('plan-amount').value);
  const freq = document.getElementById('plan-frequency').value;
  const durationValue = parseInt(document.getElementById('plan-duration').value, 10);
  const durationUnit = document.getElementById('plan-duration-unit').value;
  const startDate = document.getElementById('plan-start-date').value;

  if (!name || !amount || !durationValue || !startDate) return;

  if (editingPlanId) {
    // Update existing plan
    const planIndex = accounts.findIndex(p => p.id === editingPlanId);
    if (planIndex !== -1) {
      accounts[planIndex] = {
        ...accounts[planIndex],
        name,
        amount,
        freq,
        startDate,
        durationValue,
        durationUnit
      };
      accounts[planIndex].total = amount * AppUtils.countPlanOccurrencesInRange(accounts[planIndex], AppUtils.parseDate(startDate), AppUtils.planEndDate(accounts[planIndex]));
    }
    editingPlanId = null;
    document.getElementById('plan-form').querySelector('button[type="submit"]').textContent = 'Save plan';
  } else {
    // Create new plan
    const plan = {
      id: AppUtils.generatePlanId(),
      name,
      amount,
      freq,
      startDate,
      durationValue,
      durationUnit,
      color: AppUtils.getRandomPlanColor(),
      dotColor: AppUtils.getRandomPlanColor()
    };
    plan.total = amount * AppUtils.countPlanOccurrencesInRange(plan, AppUtils.parseDate(plan.startDate), AppUtils.planEndDate(plan));
    accounts.push(plan);
  }

  AppUtils.saveAccounts(accounts);
  renderPlanList();
  renderCalendar();
  document.getElementById('plan-form').reset();
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('plan-start-date').value = today;
  switchRegisterTab('transactions');
}

function editPlan(planId) {
  const plan = accounts.find(p => p.id === planId);
  if (!plan) return;

  editingPlanId = planId;
  document.getElementById('plan-name').value = plan.name;
  document.getElementById('plan-amount').value = plan.amount;
  document.getElementById('plan-frequency').value = plan.freq;
  document.getElementById('plan-duration').value = plan.durationValue;
  document.getElementById('plan-duration-unit').value = plan.durationUnit;
  document.getElementById('plan-start-date').value = plan.startDate;
  document.getElementById('plan-form').querySelector('button[type="submit"]').textContent = 'Update plan';
  switchRegisterTab('plans');
}

function deletePlan(planId) {
  if (!confirm('Are you sure you want to delete this savings plan?')) return;

  accounts = accounts.filter(p => p.id !== planId);
  AppUtils.saveAccounts(accounts);
  renderPlanList();
  renderCalendar();
}

function renderPlanList() {
  const list = document.getElementById('plan-list');
  list.innerHTML = accounts.map(plan => {
    const schedule = `${plan.amount}/${plan.freq}`;
    return `<div class="account-card">
      <div class="account-name"><span class="account-dot" style="background:${plan.dotColor}"></span>${plan.name}</div>
      <div class="account-detail">${schedule} · ${plan.durationValue} ${plan.durationUnit}${plan.durationValue !== 1 ? 's' : ''}<br>Target: ${AppUtils.formatMoney(plan.total)}</div>
      <div style="font-size:10px;color:var(--color-text-secondary);margin-top:4px;">Starts ${new Date(plan.startDate).toLocaleDateString()}</div>
      <div style="margin-top:8px;">
        <button class="nav-btn" onclick="editPlan('${plan.id}')">Edit</button>
        <button class="nav-btn" onclick="deletePlan('${plan.id}')" style="margin-left:8px;">Delete</button>
      </div>
    </div>`;
  }).join('');
}

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById('transaction-modal');
  if (event.target === modal) {
    closeModal();
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initRegister);