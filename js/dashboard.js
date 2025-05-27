/**
 * Dashboard.js - Funções para gerenciamento do dashboard
 * Gerencia carregamento de transações, gráficos e interações do dashboard
 */

// Inicializa o dashboard quando o documento estiver pronto
document.addEventListener("DOMContentLoaded", function() {
    // Verifica se estamos na página do dashboard
    if (!document.getElementById('dashboard-section')) return;
    
    // Configura os elementos do dashboard
    setupDashboardElements();
    
    // Verifica autenticação e carrega dados
    const token = localStorage.getItem("financas-token");
    if (token) {
        loadDashboardData();
    } else {
        // Redireciona para login se não houver token
        window.location.href = "login.html";
    }
});

// Configura os elementos do dashboard
function setupDashboardElements() {
    // Configura o formulário de transação
    setupTransactionForm();
    
    // Configura os botões de tipo de transação
    setupTransactionTypeToggle();
    
    // Configura a navegação entre seções
    setupNavigation();
}

// Carrega os dados do dashboard
async function loadDashboardData() {
    try {
        // Mostra indicador de carregamento
        showLoading(true);
        
        // Carrega as transações
        await loadTransactions();
        
        // Atualiza o resumo financeiro
        updateFinancialSummary();
        
        // Renderiza os gráficos
        renderCharts();
        
        // Esconde indicador de carregamento
        showLoading(false);
    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        showError("Não foi possível carregar seus dados financeiros. Tente novamente mais tarde.");
        
        // Mostra mensagem de erro no lugar das transações
        const transactionsListElement = document.getElementById('transactions-list');
        if (transactionsListElement) {
            transactionsListElement.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Erro ao carregar transações: ${error.message || 'Verifique sua conexão e tente novamente.'}
                </div>
                <p class="text-center">
                    <button class="btn btn-outline-primary btn-sm" onclick="loadDashboardData()">
                        <i class="fas fa-sync-alt me-1"></i> Tentar novamente
                    </button>
                </p>
            `;
        }
        
        const allTransactionsListElement = document.getElementById('all-transactions-list');
        if (allTransactionsListElement) {
            allTransactionsListElement.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Erro ao carregar transações: ${error.message || 'Verifique sua conexão e tente novamente.'}
                </div>
                <p class="text-center">
                    <button class="btn btn-outline-primary btn-sm" onclick="loadDashboardData()">
                        <i class="fas fa-sync-alt me-1"></i> Tentar novamente
                    </button>
                </p>
            `;
        }
        
        showLoading(false);
    }
}

// Carrega as transações do usuário
async function loadTransactions() {
    try {
        console.log("Iniciando carregamento de transações...");
        const transactions = await TransactionsAPI.getAll();
        console.log("Resposta da API de transações:", transactions);
        
        if (!transactions) {
            throw new Error("Resposta vazia da API");
        }
        
        if (!Array.isArray(transactions)) {
            console.error("Resposta não é um array:", transactions);
            throw new Error("Formato de resposta inválido");
        }
        
        // Armazena as transações em uma variável global
        window.userTransactions = transactions;
        
        // Renderiza a lista de transações
        renderTransactionsList(transactions);
        
        // Renderiza a lista completa de transações (na aba Transações)
        renderAllTransactionsList(transactions);
        
        return transactions;
    } catch (error) {
        console.error("Erro ao carregar transações:", error);
        throw error;
    }
}

// Renderiza a lista de transações recentes (no Dashboard)
function renderTransactionsList(transactions) {
    const transactionsListElement = document.getElementById('transactions-list');
    if (!transactionsListElement) return;
    
    // Limpa a lista atual
    transactionsListElement.innerHTML = '';
    
    // Ordena as transações por data (mais recentes primeiro)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limita a 5 transações mais recentes
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    // Se não houver transações, mostra mensagem
    if (recentTransactions.length === 0) {
        transactionsListElement.innerHTML = '<p class="text-center py-4 text-muted">Nenhuma transação registrada.</p>';
        return;
    }
    
    // Adiciona cada transação à lista
    recentTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item position-relative animate-in';
        transactionElement.dataset.id = transaction._id;
        
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas ${transaction.type === 'income' ? 'fa-plus' : 'fa-minus'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-meta">
                        ${transaction.category} • ${formatDate(transaction.date)}
                    </div>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        `;
        
        transactionsListElement.appendChild(transactionElement);
    });
}

// Renderiza a lista completa de transações (na aba Transações)
function renderAllTransactionsList(transactions) {
    const allTransactionsListElement = document.getElementById('all-transactions-list');
    if (!allTransactionsListElement) return;
    
    // Limpa a lista atual
    allTransactionsListElement.innerHTML = '';
    
    // Ordena as transações por data (mais recentes primeiro)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Se não houver transações, mostra mensagem
    if (sortedTransactions.length === 0) {
        allTransactionsListElement.innerHTML = '<p class="text-center py-4 text-muted">Nenhuma transação registrada.</p>';
        return;
    }
    
    // Adiciona cada transação à lista
    sortedTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item position-relative animate-in';
        transactionElement.dataset.id = transaction._id;
        
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas ${transaction.type === 'income' ? 'fa-plus' : 'fa-minus'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-meta">
                        ${transaction.category} • ${formatDate(transaction.date)}
                    </div>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
            <button class="delete-btn" data-id="${transaction._id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
        allTransactionsListElement.appendChild(transactionElement);
    });
    
    // Adiciona event listeners aos botões de deletar
    setupDeleteButtons();
}

// Configura os botões de deletar transação
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const id = this.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                try {
                    await deleteTransaction(id);
                } catch (error) {
                    console.error("Erro ao excluir transação:", error);
                    showError("Não foi possível excluir a transação. Tente novamente.");
                }
            }
        });
    });
}

// Exclui uma transação
async function deleteTransaction(id) {
    try {
        const result = await TransactionsAPI.remove(id);
        if (result && result.success) {
            // Remove a transação da lista
            const transactions = window.userTransactions.filter(t => t._id !== id);
            window.userTransactions = transactions;
            
            // Atualiza a interface
            renderTransactionsList(transactions);
            renderAllTransactionsList(transactions);
            updateFinancialSummary();
            renderCharts();
            
            // Mostra mensagem de sucesso
            showSuccess("Transação excluída com sucesso!");
        } else {
            throw new Error("Erro ao excluir transação");
        }
    } catch (error) {
        console.error("Erro ao excluir transação:", error);
        throw error;
    }
}

// Atualiza o resumo financeiro
function updateFinancialSummary() {
    const transactions = window.userTransactions || [];
    
    // Calcula totais
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = income - expenses;
    
    // Atualiza os elementos na interface
    const balanceElement = document.getElementById('balance-amount');
    const incomeElement = document.getElementById('income-amount');
    const expenseElement = document.getElementById('expense-amount');
    
    if (balanceElement) balanceElement.textContent = formatCurrency(balance);
    if (incomeElement) incomeElement.textContent = formatCurrency(income);
    if (expenseElement) expenseElement.textContent = formatCurrency(expenses);
}

// Renderiza os gráficos
function renderCharts() {
    renderExpenseTrendChart();
    renderExpenseCategoryChart();
}

// Renderiza o gráfico de tendência de despesas
function renderExpenseTrendChart() {
    const chartCanvas = document.getElementById('expense-trend-chart');
    if (!chartCanvas) return;
    
    const transactions = window.userTransactions || [];
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Se não houver despesas, limpa o canvas
    if (expenses.length === 0) {
        const ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        return;
    }
    
    // Agrupa despesas por dia
    const expensesByDay = {};
    expenses
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(t => {
            const day = formatDate(t.date);
            expensesByDay[day] = (expensesByDay[day] || 0) + parseFloat(t.amount);
        });
    
    // Prepara dados para o gráfico
    const labels = Object.keys(expensesByDay);
    const data = Object.values(expensesByDay);
    
    // Verifica se já existe um gráfico e o destrói
    if (window.expenseTrendChart) {
        window.expenseTrendChart.destroy();
    }
    
    // Cria o novo gráfico
    const ctx = chartCanvas.getContext('2d');
    window.expenseTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Despesas',
                data: data,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Renderiza o gráfico de categorias de despesas
function renderExpenseCategoryChart() {
    const chartCanvas = document.getElementById('expense-category-chart');
    if (!chartCanvas) return;
    
    const transactions = window.userTransactions || [];
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Se não houver despesas, limpa o canvas
    if (expenses.length === 0) {
        const ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        
        // Limpa a legenda
        const legendElement = document.getElementById('category-legend');
        if (legendElement) {
            legendElement.innerHTML = '<p class="text-center py-3 text-muted">Sem categorias para exibir.</p>';
        }
        return;
    }
    
    // Agrupa despesas por categoria
    const expensesByCategory = {};
    expenses.forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + parseFloat(t.amount);
    });
    
    // Prepara dados para o gráfico
    const categories = Object.keys(expensesByCategory);
    const values = Object.values(expensesByCategory);
    
    // Cores para as categorias
    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'
    ];
    
    // Verifica se já existe um gráfico e o destrói
    if (window.expenseCategoryChart) {
        window.expenseCategoryChart.destroy();
    }
    
    // Cria o novo gráfico
    const ctx = chartCanvas.getContext('2d');
    window.expenseCategoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: categories.map((_, i) => colors[i % colors.length]),
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
    
    // Atualiza a legenda
    updateCategoryLegend(expensesByCategory, colors);
}

// Atualiza a legenda de categorias
function updateCategoryLegend(expensesByCategory, colors) {
    const legendElement = document.getElementById('category-legend');
    if (!legendElement) return;
    
    // Limpa a legenda atual
    legendElement.innerHTML = '';
    
    // Converte para array e ordena por valor (maior para menor)
    const categories = Object.entries(expensesByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    
    // Adiciona cada categoria à legenda
    categories.forEach((category, index) => {
        const color = colors[index % colors.length];
        
        const item = document.createElement('div');
        item.className = 'category-item d-flex align-items-center mb-2';
        
        item.innerHTML = `
            <div class="category-color me-2" style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color}"></div>
            <div class="category-name flex-grow-1">${category.name}</div>
            <div class="category-value fw-bold">${formatCurrency(category.value)}</div>
        `;
        
        legendElement.appendChild(item);
    });
}

// Configura o formulário de transação
function setupTransactionForm() {
    const form = document.getElementById('transaction-form');
    if (!form) return;
    
    // Define a data padrão como hoje
    const dateInput = document.getElementById('transaction-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Preenche as categorias
    populateCategories();
    
    // Configura o envio do formulário
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Obtém os valores do formulário
        const description = document.getElementById('transaction-description').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const category = document.getElementById('transaction-category').value;
        const date = document.getElementById('transaction-date').value;
        const type = window.currentTransactionType || 'expense';
        
        // Valida os dados
        if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
            showError("Por favor, preencha todos os campos corretamente.");
            return;
        }
        
        // Cria o objeto de transação
        const transaction = {
            description,
            amount,
            category,
            date,
            type
        };
        
        // Mostra indicador de carregamento
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';
        submitBtn.disabled = true;
        
        // Configura um timeout de segurança para restaurar o botão após 10 segundos
        const safetyTimeout = setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            console.log("Timeout de segurança acionado para restaurar o botão");
        }, 10000);
        
        try {
            console.log("Enviando transação:", transaction);
            
            // Envia a transação para o servidor
            const result = await TransactionsAPI.add(transaction);
            console.log("Transação adicionada com sucesso:", result);
            
            // Adiciona a nova transação à lista
            if (!window.userTransactions) window.userTransactions = [];
            window.userTransactions.push(result);
            
            // Atualiza a interface
            renderTransactionsList(window.userTransactions);
            renderAllTransactionsList(window.userTransactions);
            updateFinancialSummary();
            renderCharts();
            
            // Limpa o formulário
            form.reset();
            dateInput.valueAsDate = new Date();
            
            // Mostra mensagem de sucesso
            showSuccess("Transação adicionada com sucesso!");
            
            // Limpa o timeout de segurança
            clearTimeout(safetyTimeout);
            
            // Restaura o botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
        } catch (error) {
            console.error("Erro ao adicionar transação:", error);
            showError("Não foi possível adicionar a transação. Tente novamente.");
            
            // Limpa o timeout de segurança
            clearTimeout(safetyTimeout);
            
            // Restaura o botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Preenche as categorias no select
function populateCategories() {
    const categorySelect = document.getElementById('transaction-category');
    if (!categorySelect) return;
    
    // Categorias de despesas
    const expenseCategories = [
        'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação',
        'Lazer', 'Vestuário', 'Viagem', 'Serviços', 'Outros'
    ];
    
    // Categorias de receitas
    const incomeCategories = [
        'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presentes',
        'Reembolso', 'Aluguel', 'Outros'
    ];
    
    // Limpa as opções atuais
    categorySelect.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
    
    // Adiciona as categorias de acordo com o tipo selecionado
    const categories = window.currentTransactionType === 'income' ? incomeCategories : expenseCategories;
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Configura os botões de tipo de transação
function setupTransactionTypeToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    if (toggleButtons.length === 0) return;
    
    // Define o tipo padrão
    window.currentTransactionType = 'expense';
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe active de todos os botões
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe active ao botão clicado
            this.classList.add('active');
            
            // Atualiza o tipo atual
            window.currentTransactionType = this.dataset.type;
            
            // Atualiza as categorias
            populateCategories();
        });
    });
}

// Configura a navegação entre seções
function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Obtém a seção alvo
            const targetSection = this.dataset.section;
            
            // Esconde todas as seções
            document.querySelectorAll('.app-section').forEach(section => {
                section.classList.add('d-none');
            });
            
            // Mostra a seção alvo
            document.getElementById(`${targetSection}-section`).classList.remove('d-none');
            
            // Atualiza os links ativos
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Marca o link atual como ativo
            document.querySelectorAll(`.nav-link[data-section="${targetSection}"]`).forEach(navLink => {
                navLink.classList.add('active');
            });
        });
    });
    
    // Configura o botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Remove o token
            localStorage.removeItem('financas-token');
            
            // Redireciona para a página de login
            window.location.href = 'login.html';
        });
    }
}

// Mostra mensagem de erro
function showError(message) {
    // Cria um toast de erro
    const toast = document.createElement('div');
    toast.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-danger text-white">
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong class="me-auto">Erro</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove o toast após 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Mostra mensagem de sucesso
function showSuccess(message) {
    // Cria um toast de sucesso
    const toast = document.createElement('div');
    toast.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white">
                <i class="fas fa-check-circle me-2"></i>
                <strong class="me-auto">Sucesso</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove o toast após 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Mostra/esconde indicador de carregamento
function showLoading(show) {
    // Implementação simples, pode ser melhorada
    console.log(show ? "Mostrando indicador de carregamento" : "Escondendo indicador de carregamento");
}

// Formata valor monetário
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formata data
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

// Exporta funções para uso global
window.loadDashboardData = loadDashboardData;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
