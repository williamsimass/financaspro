// --- Configuração --- 
const API_BASE_URL = "."; // Assume que o backend está na mesma origem ou configurado via proxy
// Para teste local com backend rodando em outra porta (ex: 3000) e frontend estático:
// const API_BASE_URL = "http://localhost:3000"; // Descomente e ajuste se necessário

// --- Utilitários ---
function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);
}

function getCurrentMonthYear() {
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Data inválida";
    }
    const adjustedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return adjustedDate.toLocaleDateString("pt-BR");
}

// --- Estado da Aplicação ---
let state = {
    transactions: [],
    theme: localStorage.getItem("financas-theme") || "light",
    transactionType: "expense",
    user: null, // Guarda { username, firstName, lastName }
    token: localStorage.getItem("financas-token") || null,
    currentSection: "dashboard" // Seção ativa da UI
};

// --- Elementos DOM (cache) ---
const elements = {};
function cacheDOMElements() {
    elements.body = document.body;
    elements.modalOverlay = document.getElementById("modal-overlay");
    elements.loginModal = document.getElementById("login-modal");
    elements.registerModal = document.getElementById("register-modal");
    elements.loginForm = document.getElementById("login-form");
    elements.registerForm = document.getElementById("register-form");
    elements.loginError = document.getElementById("login-error");
    elements.registerError = document.getElementById("register-error");
    elements.registerSuccess = document.getElementById("register-success");
    elements.authContainer = document.getElementById("auth-container");
    elements.loginBtn = document.getElementById("login-btn");
    elements.userInfo = document.getElementById("user-info");
    elements.userGreeting = document.getElementById("user-greeting");
    elements.logoutBtn = document.getElementById("logout-btn");
    elements.themeToggle = document.getElementById("theme-toggle");
    elements.mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    elements.mobileMenu = document.querySelector(".mobile-menu");
    elements.navItems = document.querySelectorAll(".nav-item");
    elements.appSections = document.querySelectorAll(".app-section");
    elements.currentMonth = document.getElementById("current-month");
    elements.trendMonth = document.getElementById("trend-month");
    elements.currentYear = document.getElementById("current-year");
    elements.balanceAmount = document.getElementById("balance-amount");
    elements.incomeAmount = document.getElementById("income-amount");
    elements.expenseAmount = document.getElementById("expense-amount");
    elements.incomeTrend = document.getElementById("income-trend");
    elements.expenseTrend = document.getElementById("expense-trend");
    elements.expenseTrendChartCanvas = document.getElementById("expense-trend-chart");
    elements.expenseCategoryChartCanvas = document.getElementById("expense-category-chart");
    elements.categoryLegend = document.getElementById("category-legend");
    elements.transactionForm = document.getElementById("transaction-form");
    elements.transactionDate = document.getElementById("transaction-date");
    elements.transactionDescription = document.getElementById("transaction-description");
    elements.transactionAmount = document.getElementById("transaction-amount");
    elements.transactionCategory = document.getElementById("transaction-category");
    elements.transactionTypeButtons = document.querySelectorAll(".toggle-btn");
    elements.transactionsList = document.getElementById("transactions-list");
}

// --- Funções de API --- 
async function apiRequest(endpoint, method = "GET", body = null, requireAuth = true) {
    const headers = {
        "Content-Type": "application/json",
    };
    if (requireAuth && state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            // Token inválido ou expirado, deslogar
            console.warn("Token inválido ou expirado. Deslogando...");
            handleLogout();
            return null; // Indica falha na autenticação
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`API Error ${response.status}:`, errorData);
            throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
        }

        // Se for DELETE bem sucedido (200 ou 204), não precisa de JSON
        if (method === "DELETE" && (response.status === 200 || response.status === 204)) {
            return { success: true };
        }

        // Para outras requisições OK, parsear JSON
        return await response.json();

    } catch (error) {
        console.error("Erro na requisição API:", error);
        throw error; // Re-throw para ser pego onde a função foi chamada
    }
}

// --- Funções de Autenticação --- 
async function checkLoginStatus() {
    if (state.token) {
        try {
            // Verifica se o token ainda é válido no backend
            const data = await apiRequest("/api/auth/verify", "GET");
            if (data && data.valid) {
                state.user = data.user; // Armazena dados do usuário do token verificado
                console.log("Token verificado. Usuário logado:", state.user.username);
                await loadDataFromServer();
                updateUIForLoggedInState();
            } else {
                // Token inválido ou expirado pelo backend
                handleLogout(); // Limpa estado e UI
            }
        } catch (error) {
            console.error("Erro ao verificar token:", error);
            handleLogout(); // Desloga em caso de erro na verificação
        }
    } else {
        console.log("Nenhum token encontrado. Usuário deslogado.");
        updateUIForLoggedOutState();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    clearAuthMessages();
    const username = elements.loginForm.elements["login-username"].value;
    const password = elements.loginForm.elements["login-password"].value;

    try {
        const data = await apiRequest("/api/auth/login", "POST", { username, password }, false);
        if (data && data.token) {
            state.token = data.token;
            state.user = data.user; // Armazena dados do usuário retornados pelo login
            localStorage.setItem("financas-token", state.token);
            console.log("Login bem-sucedido para:", state.user.username);
            closeModal("login-modal");
            await loadDataFromServer();
            updateUIForLoggedInState();
            navigateToSection("dashboard"); // Vai para o dashboard após login
        } else {
             elements.loginError.textContent = "Resposta inválida do servidor.";
        }
    } catch (error) {
        elements.loginError.textContent = error.message || "Erro ao fazer login.";
    }
}

async function handleRegister(event) {
    event.preventDefault();
    clearAuthMessages();
    const firstName = elements.registerForm.elements["register-firstName"].value;
    const lastName = elements.registerForm.elements["register-lastName"].value;
    const username = elements.registerForm.elements["register-username"].value;
    const email = elements.registerForm.elements["register-email"].value;
    const password = elements.registerForm.elements["register-password"].value;

    try {
        const data = await apiRequest("/api/auth/register", "POST", {
            firstName, lastName, username, email, password
        }, false);

        if (data) {
            elements.registerSuccess.textContent = "Registro bem-sucedido! Você já pode fazer login.";
            elements.registerForm.reset();
            // Opcional: Mudar para a modal de login automaticamente
            // setTimeout(() => switchModal("register-modal", "login-modal"), 2000);
        }
    } catch (error) {
        elements.registerError.textContent = error.message || "Erro ao registrar.";
    }
}

function handleLogout() {
    state.user = null;
    state.token = null;
    state.transactions = [];
    localStorage.removeItem("financas-token");
    console.log("Usuário deslogado.");
    updateUIForLoggedOutState();
    navigateToSection("dashboard"); // Ou redirecionar para uma página inicial se houver
}

// --- Funções de Dados --- 
async function loadDataFromServer() {
    if (!state.user || !state.token) return;
    console.log("Carregando transações do servidor...");
    try {
        const transactions = await apiRequest("/api/transactions", "GET");
        if (transactions) {
            // Converte amount para número, pois pode vir como string do JSON
            state.transactions = transactions.map(t => ({ ...t, amount: parseFloat(t.amount) }));
            console.log("Transações carregadas:", state.transactions.length);
            updateUI(); // Atualiza toda a UI com os novos dados
        }
    } catch (error) {
        console.error("Erro ao carregar transações:", error);
        alert("Não foi possível carregar suas transações. Tente novamente mais tarde.");
        // Poderia tentar carregar do localStorage como fallback?
    }
}

async function addTransaction(event) {
    event.preventDefault();
    if (!state.user || !state.token) return;

    const description = elements.transactionDescription.value.trim();
    const amount = parseFloat(elements.transactionAmount.value);
    const category = elements.transactionCategory.value;
    const date = elements.transactionDate.value; // Formato YYYY-MM-DD
    const type = state.transactionType;

    if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const newTransactionData = { description, amount, category, date, type };

    try {
        console.log("Enviando nova transação:", newTransactionData);
        const createdTransaction = await apiRequest("/api/transactions", "POST", newTransactionData);
        if (createdTransaction) {
            console.log("Transação adicionada com sucesso:", createdTransaction);
            // Adiciona a nova transação (com _id do backend) ao estado local
            state.transactions.push({ ...createdTransaction, amount: parseFloat(createdTransaction.amount) });
            updateUI(); // Atualiza a UI
            elements.transactionForm.reset(); // Limpa o formulário
            elements.transactionDate.valueAsDate = new Date(); // Reseta data para hoje
        } else {
             alert("Falha ao adicionar transação. Resposta inválida do servidor.");
        }
    } catch (error) {
        console.error("Erro ao adicionar transação:", error);
        alert(`Erro ao adicionar transação: ${error.message}`);
    }
}

async function deleteTransaction(id) {
    if (!state.user || !state.token || !id) return;

    // Confirmação
    if (!confirm("Tem certeza que deseja excluir esta transação?")) {
        return;
    }

    try {
        console.log("Tentando excluir transação ID:", id);
        const result = await apiRequest(`/api/transactions/${id}`, "DELETE");
        if (result && result.success) {
            console.log("Transação excluída com sucesso, ID:", id);
            // Remove a transação do estado local
            state.transactions = state.transactions.filter(t => t._id !== id);
            updateUI(); // Atualiza a UI
        } else {
             alert("Falha ao excluir transação. Resposta inválida do servidor.");
        }
    } catch (error) {
        console.error("Erro ao excluir transação:", error);
        alert(`Erro ao excluir transação: ${error.message}`);
    }
}

// --- Funções de UI --- 
function updateUI() {
    if (!state.user) {
        updateUIForLoggedOutState();
        return;
    }
    // Se logado, atualiza componentes que dependem dos dados
    updateDateElements();
    updateFinancialSummary();
    renderTransactionsList();
    updateCategorySelect();
    renderCharts();
    updateNavigation();
}

function updateUIForLoggedInState() {
    elements.authContainer.classList.add("logged-in");
    elements.loginBtn.classList.add("hidden");
    elements.userInfo.classList.remove("hidden");
    // Exibe saudação com o primeiro nome
    elements.userGreeting.textContent = `Olá, ${state.user.firstName || state.user.username}!`;
    // Garante que as seções principais estejam visíveis (exceto FAQ inicialmente)
    elements.appSections.forEach(section => {
        if (section.id !== "faq") {
            section.classList.remove("hidden");
        }
    });
    // Fecha modais caso estejam abertos
    closeModal("login-modal");
    closeModal("register-modal");
    updateUI(); // Atualiza o restante da UI (dados financeiros, etc.)
}

function updateUIForLoggedOutState() {
    elements.authContainer.classList.remove("logged-in");
    elements.loginBtn.classList.remove("hidden");
    elements.userInfo.classList.add("hidden");
    elements.userGreeting.textContent = "";
    // Esconde seções que exigem login, mostra FAQ
    elements.appSections.forEach(section => {
        section.classList.add("hidden");
    });
    // Opcional: Mostrar uma seção de "bem-vindo" ou manter tudo escondido até login
    // Por enquanto, vamos mostrar o FAQ mesmo deslogado
    const faqSection = document.getElementById("faq");
    if (faqSection) faqSection.classList.remove("hidden");
    state.currentSection = "faq"; // Define FAQ como seção inicial deslogado
    updateNavigation();
    // Limpa dados financeiros da tela
    if(elements.balanceAmount) elements.balanceAmount.textContent = formatCurrency(0);
    if(elements.incomeAmount) elements.incomeAmount.textContent = formatCurrency(0);
    if(elements.expenseAmount) elements.expenseAmount.textContent = formatCurrency(0);
    if(elements.transactionsList) elements.transactionsList.innerHTML = 
        '<p class="empty-state">Faça login para ver suas transações.</p>';
    renderCharts(); // Limpa ou mostra estado vazio dos gráficos
}

function updateDateElements() {
    if (elements.currentMonth) elements.currentMonth.textContent = getCurrentMonthYear();
    if (elements.trendMonth) elements.trendMonth.textContent = getCurrentMonthYear();
    if (elements.currentYear) elements.currentYear.textContent = new Date().getFullYear();
    if (elements.transactionDate) {
        try {
            elements.transactionDate.valueAsDate = new Date();
        } catch (e) {
            elements.transactionDate.value = new Date().toISOString().split("T")[0];
        }
    }
}

function updateFinancialSummary() {
    const income = state.transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
    const expenses = state.transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    if(elements.balanceAmount) elements.balanceAmount.textContent = formatCurrency(balance);
    if(elements.incomeAmount) elements.incomeAmount.textContent = formatCurrency(income);
    if(elements.expenseAmount) elements.expenseAmount.textContent = formatCurrency(expenses);

    // TODO: Implementar cálculo real de tendências se necessário
    if(elements.incomeTrend) elements.incomeTrend.textContent = "- %";
    if(elements.expenseTrend) elements.expenseTrend.textContent = "- %";
}

function renderTransactionsList() {
    if (!elements.transactionsList) return;
    elements.transactionsList.innerHTML = "";

    const sortedTransactions = [...state.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedTransactions.length === 0) {
        elements.transactionsList.innerHTML = 
            state.user ? 
            '<p class="empty-state">Nenhuma transação registrada.</p>' :
            '<p class="empty-state">Faça login para ver suas transações.</p>';
        return;
    }

    sortedTransactions.forEach(transaction => {
        const item = document.createElement("div");
        item.className = "transaction-item animate-in";
        item.dataset.id = transaction._id; // Usa _id do MongoDB

        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas ${transaction.type === "income" ? "fa-plus" : "fa-minus"}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-meta">
                        ${transaction.category} • ${formatDate(transaction.date)}
                    </div>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}
            </div>
            <button class="delete-btn" data-id="${transaction._id}">
              <i class="fas fa-trash-alt"></i>
            </button>
        `;
        elements.transactionsList.appendChild(item);
    });
}

function updateCategorySelect() {
    if (!elements.transactionCategory) return;
    const categories = state.transactionType === "expense" ? expenseCategories : incomeCategories;
    elements.transactionCategory.innerHTML = 
        '<option value="" disabled selected>Selecione uma categoria</option>';
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        elements.transactionCategory.appendChild(option);
    });
}

// --- Funções de Gráficos --- 
let expenseTrendChartInstance = null;
let expenseCategoryChartInstance = null;

function renderCharts() {
    if (expenseTrendChartInstance) expenseTrendChartInstance.destroy();
    if (expenseCategoryChartInstance) expenseCategoryChartInstance.destroy();

    // Só renderiza gráficos se o usuário estiver logado
    if (state.user) {
        renderExpenseTrendChart();
        renderExpenseCategoryChart();
    } else {
        // Limpa área dos gráficos se deslogado
        clearChartCanvas(elements.expenseTrendChartCanvas);
        clearChartCanvas(elements.expenseCategoryChartCanvas);
        if (elements.categoryLegend) elements.categoryLegend.innerHTML = "";
    }
}

function clearChartCanvas(canvas) {
    if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Opcional: Mostrar mensagem
        // ctx.font = "16px Inter, sans-serif";
        // ctx.fillStyle = "#888";
        // ctx.textAlign = "center";
        // ctx.fillText("Faça login para ver os gráficos.", canvas.width / 2, canvas.height / 2);
    }
}

function renderExpenseTrendChart() {
    if (!elements.expenseTrendChartCanvas) return;
    const ctx = elements.expenseTrendChartCanvas.getContext("2d");
    const expenses = state.transactions.filter(t => t.type === "expense");

    if (expenses.length === 0) {
        ctx.clearRect(0, 0, elements.expenseTrendChartCanvas.width, elements.expenseTrendChartCanvas.height);
        // Opcional: Mostrar mensagem "Sem dados"
        return;
    }

    // Agrupa por dia (simplificado)
    const expensesByDay = {};
    expenses.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(t => {
        const day = formatDate(t.date);
        expensesByDay[day] = (expensesByDay[day] || 0) + t.amount;
    });

    const trendData = {
        labels: Object.keys(expensesByDay),
        data: Object.values(expensesByDay)
    };

    expenseTrendChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: trendData.labels,
            datasets: [{
                label: "Gastos",
                data: trendData.data,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#3B82F6",
                backgroundColor: "transparent",
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { callback: value => formatCurrency(value) } } },
            plugins: {
                legend: { display: trendData.data.length > 0 },
                tooltip: { callbacks: { label: context => formatCurrency(context.raw) } }
            }
        }
    });
}

function renderExpenseCategoryChart() {
    if (!elements.expenseCategoryChartCanvas) return;
    const ctx = elements.expenseCategoryChartCanvas.getContext("2d");
    const expenses = state.transactions.filter(t => t.type === "expense");

    if (expenses.length === 0) {
        ctx.clearRect(0, 0, elements.expenseCategoryChartCanvas.width, elements.expenseCategoryChartCanvas.height);
        if (elements.categoryLegend) elements.categoryLegend.innerHTML = 
            '<p class="empty-state">Sem categorias para exibir.</p>';
        return;
    }

    const expensesByCategory = {};
    expenses.forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    let chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
    chartData.sort((a, b) => b.value - a.value); // Ordena por valor

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

    expenseCategoryChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: chartData.map(d => d.name),
            datasets: [{
                data: chartData.map(d => d.value),
                backgroundColor: chartData.map((_, i) => colors[i % colors.length]),
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    renderCategoryLegend(chartData, colors);
}

function renderCategoryLegend(data, colors) {
    if (!elements.categoryLegend) return;
    elements.categoryLegend.innerHTML = "";
    if (data.length === 0) {
        elements.categoryLegend.innerHTML = 
            '<p class="empty-state">Sem categorias para exibir.</p>';
        return;
    }
    data.forEach((category, index) => {
        const color = colors[index % colors.length];
        const item = document.createElement("div");
        item.className = "category-item";
        item.innerHTML = `
            <div class="category-color" style="background-color: ${color}"></div>
            <div class="category-details">
                <div class="category-name">${category.name}</div>
                <div class="category-value">${formatCurrency(category.value)}</div>
            </div>
        `;
        elements.categoryLegend.appendChild(item);
    });
}

// --- Funções de Modal --- 
function openModal(modalId) {
    clearAuthMessages();
    const modal = document.getElementById(modalId);
    if (modal && elements.modalOverlay) {
        elements.modalOverlay.classList.remove("hidden");
        modal.classList.remove("hidden");
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal && elements.modalOverlay) {
        modal.classList.add("hidden");
        // Esconde overlay apenas se nenhuma outra modal estiver aberta
        if (!document.querySelector(".modal:not(.hidden)")) {
            elements.modalOverlay.classList.add("hidden");
        }
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    openModal(toModalId);
}

function clearAuthMessages() {
    if(elements.loginError) elements.loginError.textContent = "";
    if(elements.registerError) elements.registerError.textContent = "";
    if(elements.registerSuccess) elements.registerSuccess.textContent = "";
}

// --- Navegação e Event Listeners --- 
function navigateToSection(sectionId) {
    if (!state.user && sectionId !== "faq") {
        console.log("Redirecionando para FAQ (usuário deslogado)");
        sectionId = "faq"; // Força FAQ se deslogado e tentando acessar outra seção
    }
    
    state.currentSection = sectionId;
    console.log("Navegando para:", sectionId);
    elements.appSections.forEach(section => {
        section.classList.toggle("hidden", section.id !== sectionId);
    });
    updateNavigation();
}

function updateNavigation() {
    elements.navItems.forEach(item => {
        item.classList.toggle("active", item.dataset.section === state.currentSection);
        // Esconde itens de navegação que exigem login se usuário estiver deslogado
        if (!state.user && (item.dataset.section === "dashboard" || item.dataset.section === "transacoes")) {
             item.style.display = "none";
        } else {
             item.style.display = ""; // Mostra o item
        }
    });
    // Fecha menu mobile após clicar em um item
    if (elements.mobileMenu && elements.mobileMenu.classList.contains("open")) {
        toggleMobileMenu();
    }
}

function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    elements.body.className = `${state.theme}-theme`;
    localStorage.setItem("financas-theme", state.theme);
    renderCharts(); // Re-renderiza gráficos para aplicar cores do novo tema
}

function toggleMobileMenu() {
    if (elements.mobileMenu && elements.mobileMenuBtn) {
        elements.mobileMenu.classList.toggle("open");
        const icon = elements.mobileMenuBtn.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-times");
        }
    }
}

function handleTransactionTypeToggle(event) {
    const button = event.currentTarget;
    const type = button.dataset.type;
    if (!type || type === state.transactionType) return;

    state.transactionType = type;
    elements.transactionTypeButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    updateCategorySelect();
}

function setupEventListeners() {
    // Modals
    if (elements.modalOverlay) elements.modalOverlay.addEventListener("click", () => {
        closeModal("login-modal");
        closeModal("register-modal");
    });
    if (elements.loginForm) elements.loginForm.addEventListener("submit", handleLogin);
    if (elements.registerForm) elements.registerForm.addEventListener("submit", handleRegister);

    // Auth Buttons
    if (elements.logoutBtn) elements.logoutBtn.addEventListener("click", handleLogout);

    // Theme
    if (elements.themeToggle) elements.themeToggle.addEventListener("click", toggleTheme);

    // Mobile Menu
    if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener("click", toggleMobileMenu);

    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const sectionId = item.dataset.section;
            if (sectionId) {
                navigateToSection(sectionId);
            }
        });
    });

    // Transaction Form
    if (elements.transactionForm) elements.transactionForm.addEventListener("submit", addTransaction);
    elements.transactionTypeButtons.forEach(btn => {
        btn.addEventListener("click", handleTransactionTypeToggle);
    });

    // Transaction List (Event Delegation for Delete)
    if (elements.transactionsList) {
        elements.transactionsList.addEventListener("click", (event) => {
            const deleteButton = event.target.closest(".delete-btn");
            if (deleteButton) {
                const transactionId = deleteButton.dataset.id;
                if (transactionId) {
                    deleteTransaction(transactionId);
                }
            }
        });
    }
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Carregado. Iniciando FinançasPro...");
    cacheDOMElements(); // Guarda referências aos elementos DOM
    elements.body.className = `${state.theme}-theme`; // Aplica tema inicial
    setupEventListeners(); // Configura todos os listeners
    checkLoginStatus(); // Verifica se há um token válido e atualiza a UI
    // A navegação inicial é definida dentro de checkLoginStatus
});

