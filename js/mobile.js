/**
 * Mobile.js - Funcionalidades básicas para dispositivos móveis
 * Versão simplificada sem botão flutuante e sem resumo mensal
 */

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa componentes para todos os dispositivos
    setTimeout(() => {
        setupQuickActionButtons();
        
        // Verifica se está em dispositivo móvel
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Inicializa apenas a navegação mobile básica
            setupMobileNavigation();
            
            // Remove qualquer botão flutuante ou resumo mensal que possa existir
            removeFloatingElements();
        }
    }, 500); // Pequeno atraso para garantir que todos os elementos estejam carregados
});

// Remove elementos flutuantes e resumo mensal
function removeFloatingElements() {
    // Remove o botão flutuante se existir
    const floatingMenu = document.querySelector('.floating-menu');
    if (floatingMenu) {
        floatingMenu.remove();
    }
    
    // Remove o resumo mensal se existir
    const monthlySummary = document.getElementById('monthly-summary');
    if (monthlySummary) {
        monthlySummary.remove();
    }
    
    // Remove o botão de resumo mensal se existir
    const monthlySummaryBtn = document.getElementById('monthly-summary-btn');
    if (monthlySummaryBtn) {
        monthlySummaryBtn.remove();
    }
    
    // Remove o botão mobile de resumo mensal se existir
    const monthlySummaryBtnMobile = document.getElementById('monthly-summary-btn-mobile');
    if (monthlySummaryBtnMobile) {
        monthlySummaryBtnMobile.remove();
    }
}

// Configura a navegação mobile básica
function setupMobileNavigation() {
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
    
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
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
                expenseBtn.addEventListener('click', function() {
                    if (typeof openQuickTransactionModal === 'function') {
                        openQuickTransactionModal('expense');
                    } else {
                        navigateToSection('transactions');
                        selectTransactionType('expense');
                    }
                });
            }
            
            if (incomeBtn) {
                incomeBtn.addEventListener('click', function() {
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
