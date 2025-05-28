/**
 * Dashboard.js - Funcionalidades específicas para o dashboard
 * Gerencia carregamento de dados, gráficos e interações do dashboard
 */

document.addEventListener("DOMContentLoaded", function() {
    // Adiciona botões rápidos para adicionar transações diretamente no dashboard
    addQuickActionButtons();
    
    // Carrega dados do dashboard
    loadDashboardData();
    
    // Configura navegação entre seções
    setupSectionNavigation();
    
    // Configura o formulário de transação
    setupTransactionForm();
    
    // Configura o modal de transação rápida
    setupQuickTransactionModal();
});

// Adiciona botões rápidos para adicionar transações
function addQuickActionButtons() {
    console.log("Adicionando botões rápidos ao dashboard");
    
    // Adiciona botões rápidos no topo do dashboard
    const dashboardHeader = document.querySelector("#dashboard-section .row:first-child .col-12");
    if (dashboardHeader) {
        // Verifica se os botões já existem para evitar duplicação
        if (!document.getElementById("quick-add-expense")) {
            const quickButtonsHTML = `
                <div class="quick-action-buttons mt-2">
                    <button id="quick-add-expense" class="btn btn-outline-danger btn-sm me-2">
                        <i class="fas fa-arrow-down me-1"></i> Nova Despesa
                    </button>
                    <button id="quick-add-income" class="btn btn-outline-success btn-sm">
                        <i class="fas fa-arrow-up me-1"></i> Nova Receita
                    </button>
                </div>
            `;
            
            dashboardHeader.insertAdjacentHTML("beforeend", quickButtonsHTML);
            
            // Configura eventos de clique para abrir o modal
            const expenseBtn = document.getElementById("quick-add-expense");
            const incomeBtn = document.getElementById("quick-add-income");
            
            if (expenseBtn) {
                expenseBtn.addEventListener("click", function() {
                    openQuickTransactionModal("expense");
                });
            }
            
            if (incomeBtn) {
                incomeBtn.addEventListener("click", function() {
                    openQuickTransactionModal("income");
                });
            }
        }
    }
    
    // Adiciona o modal de transação rápida ao DOM se ainda não existir
    if (!document.getElementById("quick-transaction-modal")) {
        const modalHTML = `
            <div class="modal fade" id="quick-transaction-modal" tabindex="-1" aria-labelledby="quickTransactionModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="quickTransactionModalLabel">Nova Transação</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            <form id="quick-transaction-form">
                                <div class="toggle-container mb-3">
                                    <div class="toggle-btn expense" data-type="expense">Despesa</div>
                                    <div class="toggle-btn income" data-type="income">Receita</div>
                                </div>
                                <div class="mb-3">
                                    <label for="quick-transaction-description" class="form-label">Descrição</label>
                                    <input type="text" class="form-control" id="quick-transaction-description" required>
                                </div>
                                <div class="mb-3">
                                    <label for="quick-transaction-amount" class="form-label">Valor (R$)</label>
                                    <input type="text" class="form-control" id="quick-transaction-amount" inputmode="decimal" placeholder="Ex: 10,50" required>
                                </div>
                                <div class="mb-3">
                                    <label for="quick-transaction-category" class="form-label">Categoria</label>
                                    <select class="form-select" id="quick-transaction-category" required>
                                        <option value="" disabled selected>Selecione uma categoria</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="quick-transaction-date" class="form-label">Data</label>
                                    <input type="date" class="form-control" id="quick-transaction-date" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="save-quick-transaction">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }
}

// Configura o modal de transação rápida
function setupQuickTransactionModal() {
    // Configura alternância entre despesa/receita no modal
    const toggleBtns = document.querySelectorAll("#quick-transaction-modal .toggle-btn");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            // Remove classe active de todos os botões
            toggleBtns.forEach(b => b.classList.remove("active"));
            
            // Adiciona classe active ao botão clicado
            this.classList.add("active");
            
            // Atualiza categorias com base no tipo selecionado
            const type = this.getAttribute("data-type");
            updateQuickTransactionCategories(type);
        });
    });
    
    // Configura data padrão como hoje
    const dateInput = document.getElementById("quick-transaction-date");
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const day = today.getDate().toString().padStart(2, "0");
        dateInput.value = `${year}-${month}-${day}`;
    }
    
    // Configura botão de salvar
    const saveBtn = document.getElementById("save-quick-transaction");
    if (saveBtn) {
        saveBtn.addEventListener("click", async function() {
            // Valida o formulário
            const form = document.getElementById("quick-transaction-form");
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Obtém tipo de transação (despesa/receita)
            const activeToggle = document.querySelector("#quick-transaction-modal .toggle-btn.active");
            const type = activeToggle ? activeToggle.getAttribute("data-type") : "expense";
            
            // Obtém valores do formulário
            const description = document.getElementById("quick-transaction-description").value;
            const amountInput = document.getElementById("quick-transaction-amount").value;
            const category = document.getElementById("quick-transaction-category").value;
            const date = document.getElementById("quick-transaction-date").value;
            
            // Converte e valida o valor
            let amount = 0;
            try {
                // Substitui vírgula por ponto e converte para float
                amount = parseFloat(amountInput.replace(",", "."));
                
                // Verifica se é um número válido e positivo
                if (isNaN(amount) || amount <= 0) {
                    alert("O valor da transação deve ser um número positivo.");
                    return;
                }
            } catch (e) {
                alert("Erro ao processar o valor da transação. Verifique o formato.");
                return;
            }
            
            // Cria objeto de transação com valor absoluto
            const transaction = {
                type,
                description,
                amount: Math.abs(amount), // Garante que o valor enviado é sempre positivo
                category,
                date
            };
            
            try {
                console.log("Enviando transação:", transaction);
                
                // Envia transação para a API
                await TransactionsAPI.add(transaction);
                
                // Fecha o modal
                const modal = bootstrap.Modal.getInstance(document.getElementById("quick-transaction-modal"));
                modal.hide();
                
                // Recarrega dados do dashboard
                loadDashboardData();
                
                // Exibe mensagem de sucesso
                alert("Transação adicionada com sucesso!");
            } catch (error) {
                console.error("Erro ao adicionar transação:", error);
                alert("Erro ao adicionar transação: " + (error.message || "Tente novamente."));
            }
        });
    }
}

// Abre o modal de transação rápida
function openQuickTransactionModal(type) {
    // Obtém o modal
    const modalElement = document.getElementById("quick-transaction-modal");
    if (!modalElement) return;
    
    // Inicializa o modal Bootstrap se ainda não estiver inicializado
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
        modal = new bootstrap.Modal(modalElement);
    }
    
    // Configura o tipo de transação
    const expenseBtn = modalElement.querySelector(".toggle-btn.expense");
    const incomeBtn = modalElement.querySelector(".toggle-btn.income");
    
    if (type === "expense") {
        expenseBtn.classList.add("active");
        incomeBtn.classList.remove("active");
    } else {
        incomeBtn.classList.add("active");
        expenseBtn.classList.remove("active");
    }
    
    // Atualiza categorias para o tipo selecionado
    updateQuickTransactionCategories(type);
    
    // Configura data padrão como hoje
    const dateInput = document.getElementById("quick-transaction-date");
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const day = today.getDate().toString().padStart(2, "0");
        dateInput.value = `${year}-${month}-${day}`;
    }
    
    // Limpa outros campos
    document.getElementById("quick-transaction-description").value = "";
    document.getElementById("quick-transaction-amount").value = "";
    
    // Abre o modal
    modal.show();
}

// Atualiza categorias para o modal de transação rápida
function updateQuickTransactionCategories(type) {
    const categorySelect = document.getElementById("quick-transaction-category");
    if (!categorySelect) return;
    
    // Limpa as opções atuais
    categorySelect.innerHTML = 
        `<option value="" disabled selected>Selecione uma categoria</option>`;
    
    // Adiciona categorias com base no tipo
    if (type === "income") {
        const incomeCategories = [
            "Salário", "Freelance", "Investimentos", "Vendas", "Outros"
        ];
        
        incomeCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } else {
        const expenseCategories = [
            "Alimentação", "Moradia", "Transporte", "Saúde", "Educação", 
            "Lazer", "Vestuário", "Contas", "Outros"
        ];
        
        expenseCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

// Carrega dados do dashboard
async function loadDashboardData() {
    try {
        // Carrega transações
        await loadTransactions();
        
        // Atualiza resumo financeiro
        updateFinancialSummary();
        
        // Inicializa gráficos
        initCharts();
    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
    }
}

// Carrega transações do usuário
async function loadTransactions() {
    try {
        const transactions = await TransactionsAPI.getAll();
        console.log("Transações carregadas:", transactions);
        
        if (transactions && transactions.length > 0) {
            // Armazena transações para uso em outros componentes
            window.transactions = transactions;
            
            // Atualiza lista de transações recentes
            updateRecentTransactions(transactions);
            
            // Atualiza lista completa de transações
            updateAllTransactions(transactions);
            
            // Atualiza dados para gráficos
            updateChartData(transactions);
        } else {
            // Exibe mensagem de nenhuma transação
            document.getElementById("transactions-list").innerHTML = `
                <p class="text-center py-3 text-muted">Nenhuma transação encontrada.</p>
            `;
            
            document.getElementById("all-transactions-list").innerHTML = `
                <p class="text-center py-3 text-muted">Nenhuma transação encontrada.</p>
            `;
        }
    } catch (error) {
        console.error("Erro ao carregar transações:", error);
        
        // Exibe mensagem de erro
        document.getElementById("transactions-list").innerHTML = `
            <p class="text-center py-3 text-danger">Erro ao carregar transações. Tente novamente.</p>
        `;
        
        document.getElementById("all-transactions-list").innerHTML = `
            <p class="text-center py-3 text-danger">Erro ao carregar transações. Tente novamente.</p>
        `;
    }
}

// Atualiza lista de transações recentes
function updateRecentTransactions(transactions) {
    const transactionsList = document.getElementById("transactions-list");
    
    // Limita a 5 transações mais recentes
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        transactionsList.innerHTML = `
            <p class="text-center py-3 text-muted">Nenhuma transação encontrada.</p>
        `;
        return;
    }
    
    // Cria HTML para cada transação
    const transactionsHTML = recentTransactions.map(transaction => {
        return createTransactionHTML(transaction);
    }).join("");
    
    // Atualiza o DOM
    transactionsList.innerHTML = transactionsHTML;
    
    // Configura botões de exclusão
    setupDeleteButtons();
}

// Atualiza lista completa de transações
function updateAllTransactions(transactions) {
    const allTransactionsList = document.getElementById("all-transactions-list");
    
    // Ordena por data (mais recente primeiro)
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedTransactions.length === 0) {
        allTransactionsList.innerHTML = `
            <p class="text-center py-3 text-muted">Nenhuma transação encontrada.</p>
        `;
        return;
    }
    
    // Cria HTML para cada transação
    const transactionsHTML = sortedTransactions.map(transaction => {
        return createTransactionHTML(transaction);
    }).join("");
    
    // Atualiza o DOM
    allTransactionsList.innerHTML = transactionsHTML;
    
    // Configura botões de exclusão
    setupDeleteButtons();
}

// Cria HTML para uma transação
function createTransactionHTML(transaction) {
    const date = new Date(transaction.date);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
    
    const isIncome = transaction.type === "income";
    const iconClass = isIncome ? "arrow-up" : "arrow-down";
    const amountClass = isIncome ? "income" : "expense";
    const sign = isIncome ? "+" : "-";
    
    return `
        <div class="transaction-item" data-id="${transaction._id}">
            <div class="transaction-info">
                <div class="transaction-icon ${amountClass}">
                    <i class="fas fa-${iconClass}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-meta">
                        ${formattedDate} • ${transaction.category}
                    </div>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <div class="transaction-amount ${amountClass}">
                    ${sign} R$ ${parseFloat(transaction.amount).toFixed(2).replace(".", ",")}
                </div>
                <button class="delete-btn" data-id="${transaction._id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;
}

// Configura botões de exclusão de transações
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    
    deleteButtons.forEach(button => {
        button.addEventListener("click", async function() {
            const id = this.getAttribute("data-id");
            
            if (confirm("Tem certeza que deseja excluir esta transação?")) {
                try {
                    await TransactionsAPI.remove(id);
                    
                    // Remove o elemento do DOM
                    const transactionItem = this.closest(".transaction-item");
                    transactionItem.classList.add("fade-out");
                    
                    setTimeout(() => {
                        transactionItem.remove();
                        
                        // Recarrega dados do dashboard
                        loadDashboardData();
                    }, 300);
                } catch (error) {
                    console.error("Erro ao excluir transação:", error);
                    alert("Erro ao excluir transação. Tente novamente.");
                }
            }
        });
    });
}

// Atualiza resumo financeiro
function updateFinancialSummary() {
    const transactions = window.transactions || [];
    
    // Calcula saldo total, receitas e despesas
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            totalIncome += parseFloat(transaction.amount);
        } else {
            totalExpense += parseFloat(transaction.amount);
        }
    });
    
    const balance = totalIncome - totalExpense;
    
    // Atualiza valores no DOM
    document.getElementById("balance-amount").textContent = `R$ ${balance.toFixed(2).replace(".", ",")}`;
    document.getElementById("income-amount").textContent = `R$ ${totalIncome.toFixed(2).replace(".", ",")}`;
    document.getElementById("expense-amount").textContent = `R$ ${totalExpense.toFixed(2).replace(".", ",")}`;
    
    // Calcula tendências (exemplo simples)
    const incomeTrend = totalIncome > 0 ? "+10% este mês" : "0%";
    const expenseTrend = totalExpense > 0 ? "+5% este mês" : "0%";
    const balanceTrend = balance > 0 ? "+15% este mês" : "-5% este mês";
    
    document.getElementById("income-trend").textContent = incomeTrend;
    document.getElementById("expense-trend").textContent = expenseTrend;
    document.getElementById("balance-trend").textContent = balanceTrend;
}

// Atualiza dados para gráficos
function updateChartData(transactions) {
    // Dados para gráfico de tendência de despesas
    const expenseTrendData = calculateExpenseTrend(transactions);
    
    // Dados para gráfico de categorias de despesas
    const expenseCategoryData = calculateExpenseCategories(transactions);
    
    // Armazena dados para uso nos gráficos
    window.chartData = {
        expenseTrend: expenseTrendData,
        expenseCategory: expenseCategoryData
    };
}

// Calcula dados para gráfico de tendência de despesas
function calculateExpenseTrend(transactions) {
    // Obtém os últimos 6 meses
    const today = new Date();
    const months = [];
    const monthlyExpenses = [];
    
    for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = month.toLocaleString("pt-BR", { month: "short" });
        months.push(monthName);
        
        // Filtra transações do mês
        const monthTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === month.getMonth() && 
                   transactionDate.getFullYear() === month.getFullYear() &&
                   transaction.type === "expense";
        });
        
        // Soma despesas do mês
        const monthTotal = monthTransactions.reduce((total, transaction) => {
            return total + parseFloat(transaction.amount);
        }, 0);
        
        monthlyExpenses.push(monthTotal);
    }
    
    return {
        labels: months,
        values: monthlyExpenses
    };
}

// Calcula dados para gráfico de categorias de despesas
function calculateExpenseCategories(transactions) {
    // Filtra apenas despesas
    const expenses = transactions.filter(transaction => transaction.type === "expense");
    
    // Agrupa por categoria
    const categories = {};
    
    expenses.forEach(expense => {
        const category = expense.category || "Outros";
        
        if (!categories[category]) {
            categories[category] = 0;
        }
        
        categories[category] += parseFloat(expense.amount);
    });
    
    // Converte para arrays para o gráfico
    const categoryNames = Object.keys(categories);
    const categoryValues = Object.values(categories);
    
    return {
        labels: categoryNames,
        values: categoryValues
    };
}

// Inicializa gráficos
function initCharts() {
    // Inicializa gráfico de tendência de despesas
    initExpenseTrendChart();
    
    // Inicializa gráfico de categorias de despesas
    initExpenseCategoryChart();
}

// Inicializa gráfico de tendência de despesas
function initExpenseTrendChart() {
    const ctx = document.getElementById("expense-trend-chart");
    if (!ctx) return;
    
    const ctxContext = ctx.getContext("2d");
    
    // Obtém dados do gráfico
    const chartData = window.chartData?.expenseTrend || {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        values: [0, 0, 0, 0, 0, 0]
    };
    
    // Configuração do gráfico
    const config = {
        type: "line",
        data: {
            labels: chartData.labels,
            datasets: [{
                label: "Despesas",
                data: chartData.values,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return "R$ " + value;
                        }
                    }
                }
            }
        }
    };
    
    // Cria o gráfico
    new Chart(ctxContext, config);
}

// Inicializa gráfico de categorias de despesas
function initExpenseCategoryChart() {
    const ctx = document.getElementById("expense-category-chart");
    if (!ctx) return;
    
    const ctxContext = ctx.getContext("2d");
    
    // Obtém dados do gráfico
    const chartData = window.chartData?.expenseCategory || {
        labels: ["Alimentação", "Moradia", "Transporte", "Outros"],
        values: [0, 0, 0, 0]
    };
    
    // Cores para as categorias
    const backgroundColors = [
        "rgba(59, 130, 246, 0.7)",
        "rgba(16, 185, 129, 0.7)",
        "rgba(245, 158, 11, 0.7)",
        "rgba(239, 68, 68, 0.7)",
        "rgba(139, 92, 246, 0.7)",
        "rgba(236, 72, 153, 0.7)",
        "rgba(75, 85, 99, 0.7)"
    ];
    
    // Configuração do gráfico
    const config = {
        type: "doughnut",
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.values,
                backgroundColor: backgroundColors.slice(0, chartData.labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };
    
    // Cria o gráfico
    new Chart(ctxContext, config);
    
    // Cria legenda personalizada
    createCustomLegend(chartData.labels, chartData.values, backgroundColors);
}

// Cria legenda personalizada para o gráfico de categorias
function createCustomLegend(labels, values, colors) {
    const legendContainer = document.getElementById("category-legend");
    if (!legendContainer) return;
    
    // Calcula o total para percentuais
    const total = values.reduce((sum, value) => sum + value, 0);
    
    // Cria HTML para cada item da legenda
    const legendHTML = labels.map((label, index) => {
        const value = values[index];
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        const color = colors[index % colors.length];
        
        return `
            <div class="category-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="d-inline-block me-2" style="width: 10px; height: 10px; background-color: ${color}; border-radius: 50%;"></span>
                    ${label}
                </div>
                <div>${percentage}%</div>
            </div>
        `;
    }).join("");
    
    // Atualiza o DOM
    legendContainer.innerHTML = legendHTML;
}

// Configura navegação entre seções
function setupSectionNavigation() {
    const navLinks = document.querySelectorAll("[data-section]");
    
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            const section = this.getAttribute("data-section");
            navigateToSection(section);
        });
    });
}

// Navega para a seção especificada
function navigateToSection(sectionName) {
    // Oculta todas as seções
    const sections = document.querySelectorAll(".app-section");
    sections.forEach(section => {
        section.classList.add("d-none");
    });
    
    // Mostra a seção selecionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove("d-none");
    }
    
    // Atualiza navegação
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-section") === sectionName) {
            link.classList.add("active");
        }
    });
    
    // Atualiza navegação mobile se existir
    const mobileNavItems = document.querySelectorAll(".mobile-nav-item");
    mobileNavItems.forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-section") === sectionName) {
            item.classList.add("active");
        }
    });
}

// Configura o formulário de transação
function setupTransactionForm() {
    const transactionForm = document.getElementById("transaction-form");
    if (!transactionForm) return;
    
    // Configura alternância entre despesa/receita
    const toggleBtns = document.querySelectorAll("#transaction-form .toggle-btn");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            // Remove classe active de todos os botões
            toggleBtns.forEach(b => b.classList.remove("active"));
            
            // Adiciona classe active ao botão clicado
            this.classList.add("active");
            
            // Atualiza categorias com base no tipo selecionado
            const type = this.getAttribute("data-type");
            updateCategoriesForType(type);
        });
    });
    
    // Configura data padrão como hoje
    const dateInput = document.getElementById("transaction-date");
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const day = today.getDate().toString().padStart(2, "0");
        dateInput.value = `${year}-${month}-${day}`;
    }
    
    // Configura envio do formulário
    transactionForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        // Obtém tipo de transação (despesa/receita)
        const activeToggle = document.querySelector("#transaction-form .toggle-btn.active");
        const type = activeToggle ? activeToggle.getAttribute("data-type") : "expense";
        
        // Obtém valores do formulário
        const description = document.getElementById("transaction-description").value;
        const amountInput = document.getElementById("transaction-amount").value;
        const category = document.getElementById("transaction-category").value;
        const date = document.getElementById("transaction-date").value;
        
        // Converte e valida o valor
        let amount = 0;
        try {
            // Substitui vírgula por ponto e converte para float
            amount = parseFloat(amountInput.replace(",", "."));
            
            // Verifica se é um número válido e positivo
            if (isNaN(amount) || amount <= 0) {
                alert("O valor da transação deve ser um número positivo.");
                return;
            }
        } catch (e) {
            alert("Erro ao processar o valor da transação. Verifique o formato.");
            return;
        }
        
        // Cria objeto de transação com valor absoluto
        const transaction = {
            type,
            description,
            amount: Math.abs(amount), // Garante que o valor enviado é sempre positivo
            category,
            date
        };
        
        try {
            console.log("Enviando transação:", transaction);
            
            // Envia transação para a API
            await TransactionsAPI.add(transaction);
            
            // Limpa formulário
            transactionForm.reset();
            
            // Redefine tipo para despesa
            document.querySelector("#transaction-form .toggle-btn.expense").classList.add("active");
            document.querySelector("#transaction-form .toggle-btn.income").classList.remove("active");
            updateCategoriesForType("expense");
            
            // Redefine data para hoje
            if (dateInput) {
                const today = new Date();
                const year = today.getFullYear();
                const month = (today.getMonth() + 1).toString().padStart(2, "0");
                const day = today.getDate().toString().padStart(2, "0");
                dateInput.value = `${year}-${month}-${day}`;
            }
            
            // Recarrega dados do dashboard
            loadDashboardData();
            
            // Exibe mensagem de sucesso
            alert("Transação adicionada com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar transação:", error);
            alert("Erro ao adicionar transação: " + (error.message || "Tente novamente."));
        }
    });
    
    // Inicializa categorias para despesa (padrão)
    updateCategoriesForType("expense");
}

// Função para selecionar o tipo de transação
function selectTransactionType(type) {
    const expenseBtn = document.querySelector(".toggle-btn.expense");
    const incomeBtn = document.querySelector(".toggle-btn.income");
    
    if (expenseBtn && incomeBtn) {
        if (type === "expense") {
            incomeBtn.classList.remove("active");
            expenseBtn.classList.add("active");
        } else {
            expenseBtn.classList.remove("active");
            incomeBtn.classList.add("active");
        }
        
        // Atualiza categorias para o tipo selecionado
        updateCategoriesForType(type);
    }
}

// Atualiza categorias com base no tipo de transação
function updateCategoriesForType(type) {
    const categorySelect = document.getElementById("transaction-category");
    if (!categorySelect) return;
    
    // Limpa as opções atuais
    categorySelect.innerHTML = 
        `<option value="" disabled selected>Selecione uma categoria</option>`;
    
    // Adiciona categorias com base no tipo
    if (type === "income") {
        const incomeCategories = [
            "Salário", "Freelance", "Investimentos", "Vendas", "Outros"
        ];
        
        incomeCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } else {
        const expenseCategories = [
            "Alimentação", "Moradia", "Transporte", "Saúde", "Educação", 
            "Lazer", "Vestuário", "Contas", "Outros"
        ];
        
        expenseCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}
