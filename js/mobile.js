/**
 * Mobile.js - Funcionalidades específicas para dispositivos móveis
 * Implementa menu flutuante, navegação mobile e resumo mensal
 */

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa componentes para todos os dispositivos
    setTimeout(() => {
        setupMonthlySummary();
        setupQuickActionButtons();
        
        // Verifica se está em dispositivo móvel
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Inicializa componentes mobile
            setupFloatingMenu();
            setupMobileNavigation();
            setupSwipeNavigation();
        }
    }, 500); // Pequeno atraso para garantir que todos os elementos estejam carregados
});

// Configura o menu flutuante
function setupFloatingMenu() {
    // Adiciona o HTML do menu flutuante ao DOM
    const floatingMenuHTML = `
        <div class="floating-menu">
            <button class="floating-menu-btn" id="floating-menu-toggle">
                <i class="fas fa-plus"></i>
            </button>
            <div class="floating-menu-options">
                <a href="#" class="floating-menu-item" id="add-expense-btn">
                    <i class="fas fa-arrow-down"></i> Nova Despesa
                </a>
                <a href="#" class="floating-menu-item" id="add-income-btn">
                    <i class="fas fa-arrow-up"></i> Nova Receita
                </a>
                <a href="#" class="floating-menu-item" id="monthly-summary-btn-mobile">
                    <i class="fas fa-chart-bar"></i> Resumo Mensal
                </a>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', floatingMenuHTML);
    
    // Adiciona navegação inferior para mobile
    const mobileNavHTML = `
        <nav class="mobile-nav">
            <div class="mobile-nav-items">
                <a href="#" class="mobile-nav-item active" data-section="dashboard">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </a>
                <a href="#" class="mobile-nav-item" data-section="transactions">
                    <i class="fas fa-exchange-alt"></i>
                    <span>Transações</span>
                </a>
                <a href="#" class="mobile-nav-item" data-section="faq">
                    <i class="fas fa-question-circle"></i>
                    <span>FAQ</span>
                </a>
            </div>
        </nav>
    `;
    
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);
    
    // Configura o comportamento do menu flutuante
    const floatingMenu = document.querySelector('.floating-menu');
    const floatingMenuToggle = document.getElementById('floating-menu-toggle');
    
    floatingMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Evita propagação para o documento
        floatingMenu.classList.toggle('active');
    });
    
    // Fecha o menu ao clicar fora dele
    document.addEventListener('click', function(event) {
        if (!floatingMenu.contains(event.target)) {
            floatingMenu.classList.remove('active');
        }
    });
    
    // Configura ações dos botões do menu flutuante
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const addIncomeBtn = document.getElementById('add-income-btn');
    const monthlySummaryBtnMobile = document.getElementById('monthly-summary-btn-mobile');
    
    // Botão para adicionar nova despesa
    addExpenseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Evita propagação para o documento
        // Abre o modal de transação rápida
        if (typeof openQuickTransactionModal === 'function') {
            openQuickTransactionModal('expense');
        } else {
            // Fallback para navegação tradicional
            navigateToSection('transactions');
            selectTransactionType('expense');
        }
        // Fecha o menu flutuante
        floatingMenu.classList.remove('active');
    });
    
    // Botão para adicionar nova receita
    addIncomeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Evita propagação para o documento
        // Abre o modal de transação rápida
        if (typeof openQuickTransactionModal === 'function') {
            openQuickTransactionModal('income');
        } else {
            // Fallback para navegação tradicional
            navigateToSection('transactions');
            selectTransactionType('income');
        }
        // Fecha o menu flutuante
        floatingMenu.classList.remove('active');
    });
    
    // Botão para mostrar/ocultar resumo mensal
    monthlySummaryBtnMobile.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Evita propagação para o documento
        toggleMonthlySummary();
        // Fecha o menu flutuante
        floatingMenu.classList.remove('active');
    });
}

// Configura a navegação mobile
function setupMobileNavigation() {
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Evita propagação para o documento
            
            // Remove a classe active de todos os itens
            mobileNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Adiciona a classe active ao item clicado
            this.classList.add('active');
            
            // Navega para a seção correspondente
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
}

// Função para navegar entre seções
function navigateToSection(sectionName) {
    // Oculta todas as seções
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(section => {
        section.classList.add('d-none');
    });
    
    // Mostra a seção selecionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
    
    // Atualiza a navegação desktop também
    const desktopNavLinks = document.querySelectorAll('.nav-link');
    desktopNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Atualiza a navegação mobile
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Rola para o topo da página
    window.scrollTo(0, 0);
}

// Configura o resumo mensal
function setupMonthlySummary() {
    // Adiciona botão dedicado para resumo mensal no dashboard
    const dashboardHeader = document.querySelector('#dashboard-section .row:first-child .col-12');
    if (dashboardHeader) {
        const summaryButtonHTML = `
            <button id="monthly-summary-btn" class="btn btn-outline-primary btn-sm ms-2">
                <i class="fas fa-chart-bar me-1"></i> Resumo Mensal
            </button>
        `;
        
        // Adiciona o botão após o texto do mês atual
        const currentMonthSpan = dashboardHeader.querySelector('#current-month');
        if (currentMonthSpan) {
            currentMonthSpan.insertAdjacentHTML('afterend', summaryButtonHTML);
            
            // Configura o evento de clique
            const summaryButton = document.getElementById('monthly-summary-btn');
            if (summaryButton) {
                summaryButton.addEventListener('click', function() {
                    toggleMonthlySummary();
                });
            }
        }
    }
    
    // Adiciona o HTML do resumo mensal ao DOM
    const monthlySummaryHTML = `
        <div class="monthly-summary" id="monthly-summary">
            <div class="monthly-summary-header">
                <div class="monthly-summary-title">Resumo Mensal</div>
                <div class="month-selector">
                    <button id="prev-month"><i class="fas fa-chevron-left"></i></button>
                    <span id="current-month-display">Maio 2025</span>
                    <button id="next-month"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="monthly-summary-content">
                <div class="monthly-stat">
                    <div class="monthly-stat-label">Receitas</div>
                    <div class="monthly-stat-value positive" id="monthly-income">R$ 0,00</div>
                </div>
                <div class="monthly-stat">
                    <div class="monthly-stat-label">Despesas</div>
                    <div class="monthly-stat-value negative" id="monthly-expense">R$ 0,00</div>
                </div>
                <div class="monthly-stat">
                    <div class="monthly-stat-label">Saldo</div>
                    <div class="monthly-stat-value" id="monthly-balance">R$ 0,00</div>
                </div>
                <div class="monthly-stat">
                    <div class="monthly-stat-label">Economia</div>
                    <div class="monthly-stat-value" id="monthly-savings">0%</div>
                </div>
            </div>
            <div class="monthly-chart-container">
                <canvas id="monthly-chart"></canvas>
            </div>
        </div>
    `;
    
    // Insere o resumo mensal antes do primeiro elemento na seção de dashboard
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        const firstChild = dashboardSection.querySelector('.container-fluid');
        if (firstChild) {
            firstChild.insertAdjacentHTML('afterbegin', monthlySummaryHTML);
            
            // Configura os botões de navegação entre meses
            const prevMonthBtn = document.getElementById('prev-month');
            const nextMonthBtn = document.getElementById('next-month');
            const currentMonthDisplay = document.getElementById('current-month-display');
            
            if (prevMonthBtn && nextMonthBtn && currentMonthDisplay) {
                // Data atual
                window.currentMonthDate = new Date();
                updateMonthDisplay();
                
                // Botão para mês anterior
                prevMonthBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Evita propagação para o documento
                    window.currentMonthDate.setMonth(window.currentMonthDate.getMonth() - 1);
                    updateMonthDisplay();
                    updateMonthlySummaryData(window.currentMonthDate);
                });
                
                // Botão para próximo mês
                nextMonthBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Evita propagação para o documento
                    window.currentMonthDate.setMonth(window.currentMonthDate.getMonth() + 1);
                    updateMonthDisplay();
                    updateMonthlySummaryData(window.currentMonthDate);
                });
                
                // Inicializa o gráfico mensal
                initMonthlyChart();
                
                // Atualiza os dados do resumo mensal
                updateMonthlySummaryData(window.currentMonthDate);
                
                // Inicialmente oculto
                document.getElementById('monthly-summary').style.display = 'none';
            }
        }
    }
}

// Atualiza o display do mês
function updateMonthDisplay() {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const currentMonthDisplay = document.getElementById('current-month-display');
    if (currentMonthDisplay && window.currentMonthDate) {
        const monthName = months[window.currentMonthDate.getMonth()];
        const year = window.currentMonthDate.getFullYear();
        
        currentMonthDisplay.textContent = `${monthName} ${year}`;
    }
}

// Configura botões rápidos para adicionar transações
function setupQuickActionButtons() {
    // Adiciona botões rápidos no topo do dashboard
    const dashboardHeader = document.querySelector('#dashboard-section .row:first-child .col-12');
    if (dashboardHeader) {
        // Verifica se os botões já existem para evitar duplicação
        if (!document.getElementById('quick-add-expense')) {
            const quickButtonsHTML = `
                <div class="quick-action-buttons mt-2 d-block">
                    <button id="quick-add-expense" class="btn btn-outline-danger btn-sm me-2">
                        <i class="fas fa-arrow-down me-1"></i> Nova Despesa
                    </button>
                    <button id="quick-add-income" class="btn btn-outline-success btn-sm">
                        <i class="fas fa-arrow-up me-1"></i> Nova Receita
                    </button>
                </div>
            `;
            
            dashboardHeader.insertAdjacentHTML('beforeend', quickButtonsHTML);
            
            // Configura eventos de clique
            const expenseBtn = document.getElementById('quick-add-expense');
            const incomeBtn = document.getElementById('quick-add-income');
            
            if (expenseBtn) {
                expenseBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Evita propagação para o documento
                    if (typeof openQuickTransactionModal === 'function') {
                        openQuickTransactionModal('expense');
                    } else {
                        navigateToSection('transactions');
                        selectTransactionType('expense');
                    }
                });
            }
            
            if (incomeBtn) {
                incomeBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Evita propagação para o documento
                    if (typeof openQuickTransactionModal === 'function') {
                        openQuickTransactionModal('income');
                    } else {
                        navigateToSection('transactions');
                        selectTransactionType('income');
                    }
                });
            }
        }
    }
}

// Função para mostrar/ocultar o resumo mensal
function toggleMonthlySummary() {
    const monthlySummary = document.getElementById('monthly-summary');
    if (monthlySummary) {
        if (monthlySummary.style.display === 'none' || !monthlySummary.style.display) {
            monthlySummary.style.display = 'block';
            // Atualiza os dados do resumo
            updateMonthlySummaryData(window.currentMonthDate);
        } else {
            monthlySummary.style.display = 'none';
        }
    }
}

// Função para selecionar o tipo de transação
function selectTransactionType(type) {
    const expenseBtn = document.querySelector('.toggle-btn.expense');
    const incomeBtn = document.querySelector('.toggle-btn.income');
    
    if (expenseBtn && incomeBtn) {
        if (type === 'expense') {
            incomeBtn.classList.remove('active');
            expenseBtn.classList.add('active');
        } else {
            expenseBtn.classList.remove('active');
            incomeBtn.classList.add('active');
        }
        
        // Atualiza categorias para o tipo selecionado
        updateCategoriesForType(type);
    }
}

// Inicializa o gráfico mensal
function initMonthlyChart() {
    const chartCanvas = document.getElementById('monthly-chart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Dados iniciais para o gráfico
    const data = {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [
            {
                label: 'Receitas',
                data: [0, 0, 0, 0],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2
            },
            {
                label: 'Despesas',
                data: [0, 0, 0, 0],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2
            }
        ]
    };
    
    // Configurações do gráfico
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    };
    
    // Cria o gráfico
    window.monthlyChart = new Chart(ctx, config);
}

// Atualiza os dados do resumo mensal
function updateMonthlySummaryData(date) {
    if (!date) date = new Date();
    
    // Obtém o mês e ano selecionados
    const month = date.getMonth() + 1; // JavaScript meses são 0-11
    const year = date.getFullYear();
    
    console.log(`Atualizando dados para ${month}/${year}`);
    
    // Em uma aplicação real, buscaríamos dados do backend com base no mês/ano
    // Para este exemplo, vamos gerar dados consistentes com base no mês/ano
    
    // Usa o mês e ano como seed para gerar valores consistentes
    const seed = month * 100 + (year % 100);
    
    // Gera valores consistentes para o mesmo mês/ano
    const monthlyIncome = 3000 + (seed % 5000);
    const monthlyExpense = 1000 + (seed % 2000);
    const monthlyBalance = monthlyIncome - monthlyExpense;
    const monthlySavings = Math.floor((monthlyBalance / monthlyIncome) * 100);
    
    // Atualiza os valores no DOM
    const incomeElement = document.getElementById('monthly-income');
    const expenseElement = document.getElementById('monthly-expense');
    const balanceElement = document.getElementById('monthly-balance');
    const savingsElement = document.getElementById('monthly-savings');
    
    if (incomeElement) incomeElement.textContent = formatCurrency(monthlyIncome);
    if (expenseElement) expenseElement.textContent = formatCurrency(monthlyExpense);
    if (balanceElement) balanceElement.textContent = formatCurrency(monthlyBalance);
    if (savingsElement) savingsElement.textContent = `${monthlySavings}%`;
    
    // Define a cor do saldo com base no valor
    if (balanceElement) {
        if (monthlyBalance > 0) {
            balanceElement.classList.add('positive');
            balanceElement.classList.remove('negative');
        } else {
            balanceElement.classList.add('negative');
            balanceElement.classList.remove('positive');
        }
    }
    
    // Atualiza os dados do gráfico
    if (window.monthlyChart) {
        // Gera dados semanais consistentes com base no mês/ano
        const weeklyIncomes = [
            500 + ((seed + 1) % 1000),
            500 + ((seed + 2) % 1000),
            500 + ((seed + 3) % 1000),
            500 + ((seed + 4) % 1000)
        ];
        
        const weeklyExpenses = [
            300 + ((seed + 5) % 700),
            300 + ((seed + 6) % 700),
            300 + ((seed + 7) % 700),
            300 + ((seed + 8) % 700)
        ];
        
        window.monthlyChart.data.datasets[0].data = weeklyIncomes;
        window.monthlyChart.data.datasets[1].data = weeklyExpenses;
        window.monthlyChart.update();
    }
}

// Função para formatar valores monetários
function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

// Configura navegação por gestos de deslize
function setupSwipeNavigation() {
    // Elementos que devem permitir rolagem normal
    const scrollableElements = [
        '.container-fluid',
        '.transactions-container',
        '.monthly-summary',
        '.chart-container'
    ];
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isScrolling = false;
    
    // Adiciona classe para área de deslize
    document.body.classList.add('swipe-area');
    
    // Eventos de toque - apenas para elementos não scrolláveis
    document.addEventListener('touchstart', function(e) {
        // Verifica se o toque começou em um elemento scrollável
        if (isScrollableElement(e.target)) {
            isScrolling = true;
            return; // Permite rolagem normal
        }
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true }); // Passive true para melhor performance
    
    document.addEventListener('touchend', function(e) {
        // Se estiver em modo de rolagem, ignora o swipe
        if (isScrolling) {
            isScrolling = false;
            return;
        }
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        // Verifica se é mais um movimento horizontal do que vertical
        const horizontalDistance = Math.abs(touchEndX - touchStartX);
        const verticalDistance = Math.abs(touchEndY - touchStartY);
        
        // Se o movimento for mais vertical que horizontal, permite rolagem normal
        if (verticalDistance > horizontalDistance) {
            return;
        }
        
        handleSwipe();
    }, { passive: true }); // Passive true para melhor performance
    
    // Verifica se o elemento ou seus pais são scrolláveis
    function isScrollableElement(element) {
        if (!element) return false;
        
        // Verifica se o elemento ou algum de seus pais corresponde aos seletores scrolláveis
        for (let i = 0; i < scrollableElements.length; i++) {
            if (element.closest(scrollableElements[i])) {
                return true;
            }
        }
        
        return false;
    }
    
    // Processa o gesto de deslize
    function handleSwipe() {
        const sections = ['dashboard', 'transactions', 'faq'];
        let currentSectionIndex = -1;
        
        // Identifica a seção atual
        sections.forEach((section, index) => {
            if (!document.getElementById(`${section}-section`).classList.contains('d-none')) {
                currentSectionIndex = index;
            }
        });
        
        // Calcula a direção do deslize
        const swipeDistance = touchEndX - touchStartX;
        const minSwipeDistance = 100; // Aumenta a distância mínima para considerar um deslize
        
        if (Math.abs(swipeDistance) < minSwipeDistance) {
            return; // Ignora deslizes pequenos
        }
        
        // Deslize para a direita (anterior)
        if (swipeDistance > 0 && currentSectionIndex > 0) {
            navigateToSection(sections[currentSectionIndex - 1]);
        }
        // Deslize para a esquerda (próximo)
        else if (swipeDistance < 0 && currentSectionIndex < sections.length - 1) {
            navigateToSection(sections[currentSectionIndex + 1]);
        }
    }
}

// Função auxiliar para atualizar categorias com base no tipo de transação
function updateCategoriesForType(type) {
    const categorySelect = document.getElementById('transaction-category');
    if (!categorySelect) return;
    
    // Limpa as opções atuais
    categorySelect.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
    
    // Adiciona categorias com base no tipo
    if (type === 'income') {
        const incomeCategories = [
            'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'
        ];
        
        incomeCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } else {
        const expenseCategories = [
            'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 
            'Lazer', 'Vestuário', 'Contas', 'Outros'
        ];
        
        expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}
