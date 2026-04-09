// Elements and State
const elements = {
    navLinks: document.querySelectorAll('.nav-links li[data-page]'),
    pages: document.querySelectorAll('.page'),
    pageTitle: document.getElementById('page-title'),
    openModalBtns: [document.getElementById('open-modal-btn'), document.getElementById('nav-add-transaction')],
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalOverlay: document.getElementById('transaction-modal'),
    form: document.getElementById('transaction-form'),
    typeRadios: document.getElementsByName('type'),
    expenseCategories: document.getElementById('expense-categories'),
    incomeCategories: document.getElementById('income-categories'),
    categorySelect: document.getElementById('category'),
    totalBalance: document.getElementById('total-balance'),
    totalIncome: document.getElementById('total-income'),
    totalExpense: document.getElementById('total-expense'),
    recentTxList: document.getElementById('recent-transaction-list'),
    allTxList: document.getElementById('all-transaction-list'),
    filterType: document.getElementById('filter-type'),
    modalTitle: document.getElementById('modal-title'),

    // Categories and Settings
    categoriesGrid: document.getElementById('categories-grid'),
    addCategoryBtn: document.getElementById('add-category-btn'),
    categoryModal: document.getElementById('category-modal'),
    closeCatModalBtn: document.getElementById('close-cat-modal-btn'),
    categoryForm: document.getElementById('category-form'),
    currencySelect: document.getElementById('currency-select'),
    clearDataBtn: document.getElementById('clear-data-btn')
};

const defaultCategories = [
    { name: 'Food', icon: 'fa-coffee', style: 'red', budget: 400 },
    { name: 'Transport', icon: 'fa-car', style: 'blue', budget: 300 },
    { name: 'Entertainment', icon: 'fa-film', style: 'yellow', budget: 300 },
    { name: 'Shopping', icon: 'fa-shopping-bag', style: 'green', budget: 200 },
    { name: 'Utilities', icon: 'fa-bolt', style: 'purple', budget: 100 }
];

let state = {
    transactions: JSON.parse(localStorage.getItem('fintrack_transactions')) || [],
    categories: JSON.parse(localStorage.getItem('fintrack_categories')) || defaultCategories,
    currency: localStorage.getItem('fintrack_currency') || '$',
    currentEditId: null,
    expenseChart: null,
    lineChart: null
};

// Seed Dummy Data to match screenshot if empty (only first load)
if (!localStorage.getItem('fintrack_transactions') && state.transactions.length === 0) {
    state.transactions = [
        { id: '1', type: 'expense', amount: 120.50, category: 'Food', date: '2023-10-25', description: 'Grocery Shopping' },
        { id: '2', type: 'income', amount: 1500.00, category: 'Freelance', date: '2023-10-24', description: 'Freelance Payment' },
        { id: '3', type: 'expense', amount: 15.99, category: 'Entertainment', date: '2023-10-22', description: 'Netflix Subscription' },
        { id: '4', type: 'expense', amount: 200.00, category: 'Shopping', date: '2023-10-20', description: 'New Shoes' },
        { id: '5', type: 'income', amount: 4350.00, category: 'Salary', date: '2023-10-01', description: 'Monthly Salary' },
        { id: '6', type: 'expense', amount: 450.00, category: 'Utilities', date: '2023-10-15', description: 'Electricity & Water' },
        { id: '7', type: 'expense', amount: 1558.51, category: 'Other', date: '2023-09-15', description: 'Misc Expenses' }
    ];
}

// Format Currency Utility
function formatCurrency(amount) {
    return state.currency + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function init() {
    elements.currencySelect.value = state.currency;
    setupEventListeners();
    updateUI();
}

function setupEventListeners() {
    // Navigation Routing
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            elements.navLinks.forEach(l => l.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');

            const pageId = target.dataset.page;
            elements.pages.forEach(p => p.classList.remove('active'));
            document.getElementById(`${pageId}-page`).classList.add('active');

            elements.pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);

            if (pageId === 'transactions') renderAllTransactions();
            if (pageId === 'categories') renderCategories();
        });
    });

    if (document.getElementById('view-all-link')) {
        document.getElementById('view-all-link').addEventListener('click', () => {
            document.querySelector('[data-page="transactions"]').click();
        });
    }

    // Modal Control (Transactions)
    elements.openModalBtns.forEach(btn => btn?.addEventListener('click', openModal));
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });

    // Forms
    elements.form.addEventListener('submit', handleFormSubmit);

    // Type Toggle
    document.querySelectorAll('.type-toggle input').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const type = e.target.value;
            elements.expenseCategories.style.display = type === 'expense' ? 'block' : 'none';
            elements.incomeCategories.style.display = type === 'income' ? 'block' : 'none';
            elements.categorySelect.value = '';
        });
    });

    // Filters
    elements.filterType.addEventListener('change', renderAllTransactions);

    // Dropdowns
    const notifBtn = document.getElementById('notifications-btn');
    const notifDrop = document.getElementById('notifications-dropdown');
    const profBtn = document.getElementById('profile-btn');
    const profDrop = document.getElementById('profile-dropdown');

    if (notifBtn && profBtn) {
        notifBtn.addEventListener('click', (e) => { e.stopPropagation(); notifDrop.classList.toggle('active'); profDrop.classList.remove('active'); });
        profBtn.addEventListener('click', (e) => { e.stopPropagation(); profDrop.classList.toggle('active'); notifDrop.classList.remove('active'); });
        document.addEventListener('click', () => { notifDrop.classList.remove('active'); profDrop.classList.remove('active'); });
        notifDrop.addEventListener('click', e => e.stopPropagation());
        profDrop.addEventListener('click', e => e.stopPropagation());
    }

    // Settings
    elements.currencySelect.addEventListener('change', (e) => {
        state.currency = e.target.value;
        updateUI();
    });

    elements.clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you strictly sure? All transactions and custom categories will be deleted FOREVER.')) {
            state.transactions = [];
            state.categories = defaultCategories;
            updateUI();
        }
    });

    // Category Modal
    elements.addCategoryBtn.addEventListener('click', () => {
        elements.categoryModal.classList.add('active');
        elements.categoryForm.reset();
    });

    elements.closeCatModalBtn.addEventListener('click', () => {
        elements.categoryModal.classList.remove('active');
    });

    elements.categoryModal.addEventListener('click', (e) => {
        if (e.target === elements.categoryModal) elements.categoryModal.classList.remove('active');
    });

    elements.categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value;
        const budget = parseFloat(document.getElementById('cat-budget').value);
        const style = document.getElementById('cat-color').value;

        let icon = 'fa-tag';
        if (name.toLowerCase().includes('food') || name.toLowerCase().includes('drink')) icon = 'fa-coffee';
        else if (name.toLowerCase().includes('travel') || name.toLowerCase().includes('car')) icon = 'fa-car';
        else if (name.toLowerCase().includes('sport') || name.toLowerCase().includes('gym')) icon = 'fa-dumbbell';
        else if (name.toLowerCase().includes('home') || name.toLowerCase().includes('rent')) icon = 'fa-home';

        state.categories.push({ name, icon, style, budget });
        updateCategorySelects();
        elements.categoryModal.classList.remove('active');
        updateUI();
    });
}

function updateUI() {
    saveData();
    updateSummary();
    renderRecentTransactions();
    if (document.getElementById('transactions-page').classList.contains('active')) renderAllTransactions();
    if (document.getElementById('categories-page').classList.contains('active')) renderCategories();
    updateCharts();
    updateCategorySelects();
}

function saveData() {
    localStorage.setItem('fintrack_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('fintrack_categories', JSON.stringify(state.categories));
    localStorage.setItem('fintrack_currency', state.currency);
}

function updateCategorySelects() {
    const expGrp = document.getElementById('expense-categories');
    expGrp.innerHTML = '';
    state.categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name; opt.textContent = c.name;
        expGrp.appendChild(opt);
    });
    expGrp.innerHTML += '<option value="Other">Other</option>';
}

function updateSummary() {
    const income = state.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = state.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    elements.totalBalance.textContent = formatCurrency(balance);
    elements.totalIncome.textContent = formatCurrency(income);
    elements.totalExpense.textContent = formatCurrency(expense);
}

// Categories Render
function renderCategories() {
    elements.categoriesGrid.innerHTML = state.categories.map(cat => {
        const spent = state.transactions
            .filter(t => t.type === 'expense' && t.category === cat.name)
            .reduce((sum, t) => sum + t.amount, 0);

        let perc = (spent / cat.budget) * 100;
        if (perc > 100) perc = 100;

        return `
            <div class="category-card">
                <div class="cat-icon-container cat-${cat.style}">
                    <i class="fas ${cat.icon}"></i>
                </div>
                <h3>${cat.name}</h3>
                <p>Budget: ${formatCurrency(cat.budget)}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar pb-${cat.style}" style="width: ${perc}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Transaction Rendering
function createTransactionItem(tr, showActions = false) {
    const isIncome = tr.type === 'income';
    const typeClass = isIncome ? 'income' : 'expense';
    const sign = isIncome ? '+' : '-';
    let initial = 'T';
    if (tr.description) {
        initial = tr.description.charAt(0).toUpperCase();
    } else if (tr.category) {
        initial = tr.category.charAt(0).toUpperCase();
    }
    const initialClass = isIncome ? 'initial-income' : 'initial-expense';

    let html = `
        <li class="transaction-item" data-id="${tr.id}">
            <div class="transaction-info">
                <div class="tx-initial ${initialClass}">${initial}</div>
                <div class="transaction-details">
                    <h4>${tr.description || tr.category}</h4>
                    <p>${tr.date} • ${tr.category}</p>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="amount ${typeClass}">${sign}${formatCurrency(tr.amount)}</span>
    `;

    if (showActions) {
        html += `
                <div class="tx-actions">
                    <button class="icon-btn-action" onclick="editTransaction('${tr.id}')"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn-action" onclick="deleteTransaction('${tr.id}')"><i class="fas fa-trash"></i></button>
                </div>
        `;
    }

    html += `</div></li>`;
    return html;
}

function renderRecentTransactions() {
    const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 4);

    if (recent.length === 0) {
        elements.recentTxList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No recent transactions.</p>';
        return;
    }

    elements.recentTxList.innerHTML = recent.map(tr => createTransactionItem(tr)).join('');
}

function renderAllTransactions() {
    const typeFilter = elements.filterType.value;
    let filtered = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter);

    if (filtered.length === 0) {
        elements.allTxList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No transactions found.</p>';
        return;
    }

    elements.allTxList.innerHTML = filtered.map(tr => createTransactionItem(tr, true)).join('');
}

function handleFormSubmit(e) {
    e.preventDefault();
    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    if (!amount || !category || !date) return alert('Please fill required fields.');

    const newTx = { type, amount, category, date, description };

    if (state.currentEditId) {
        const idx = state.transactions.findIndex(t => t.id === state.currentEditId);
        state.transactions[idx] = { ...state.transactions[idx], ...newTx };
    } else {
        newTx.id = Math.random().toString(36).substr(2, 9);
        state.transactions.push(newTx);
    }

    closeModal();
    updateUI();
}

window.deleteTransaction = function (id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        updateUI();
    }
}

window.editTransaction = function (id) {
    const tr = state.transactions.find(t => t.id === id);
    if (!tr) return;

    state.currentEditId = tr.id;
    elements.modalTitle.textContent = 'Edit Transaction';

    document.getElementById(`type-${tr.type}`).checked = true;
    document.getElementById(`type-${tr.type}`).dispatchEvent(new Event('change'));

    setTimeout(() => {
        document.getElementById('amount').value = tr.amount;
        document.getElementById('category').value = tr.category;
        document.getElementById('date').value = tr.date;
        document.getElementById('description').value = tr.description;
    }, 50);

    openModal();
}

function updateCharts() {
    updateExpenseChart();
    updateLineChart();
}

function updateExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const expenses = state.transactions.filter(t => t.type === 'expense');

    if (state.expenseChart) state.expenseChart.destroy();

    const categoryTotals = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    const chartColors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#0ea5e9', '#ec4899'];

    state.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: chartColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#7e8299', font: { family: "'Inter', sans-serif", weight: '600' }, usePointStyle: true, boxWidth: 8 }
                }
            }
        }
    });
}

function updateLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    if (state.lineChart) state.lineChart.destroy();

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const expenseData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
    const incomeData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];

    state.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Expense', data: expenseData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 2, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#ef4444', pointBorderWidth: 2, pointRadius: 4, fill: false },
                { label: 'Income', data: incomeData, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 2, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#10b981', pointBorderWidth: 2, pointRadius: 4, fill: false }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'bottom', labels: { color: '#7e8299', font: { family: "'Inter', sans-serif", weight: '600', size: 12 }, usePointStyle: true, boxWidth: 8 } } },
            scales: {
                x: { grid: { display: false, drawBorder: false }, ticks: { color: '#a1a5b7', font: { family: "'Inter', sans-serif" } } },
                y: { grid: { color: '#f1f1f4', borderDash: [5, 5], drawBorder: false }, ticks: { color: '#a1a5b7', font: { family: "'Inter', sans-serif" }, callback: function (value) { return state.currency + value; }, stepSize: 2500 }, min: 0, max: 10000 }
            }
        }
    });
}

function openModal() {
    elements.modalOverlay.classList.add('active');
    if (!state.currentEditId) {
        elements.modalTitle.textContent = 'Add Transaction';
        elements.form.reset();
        document.getElementById('date').valueAsDate = new Date();
    }
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    state.currentEditId = null;
    setTimeout(() => elements.form.reset(), 300);
}

init();
