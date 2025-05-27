/**
 * Theme.js - Gerenciamento do tema claro/escuro
 * Controla a alternância entre os temas e salva a preferência do usuário
 */

// Inicializa o tema quando o documento estiver pronto
document.addEventListener("DOMContentLoaded", function() {
    // Configura o botão de alternância de tema
    setupThemeToggle();
    
    // Carrega o tema salvo ou usa o padrão
    loadSavedTheme();
});

// Configura o botão de alternância de tema
function setupThemeToggle() {
    const themeToggle = document.querySelectorAll('.theme-toggle');
    
    themeToggle.forEach(button => {
        button.addEventListener('click', function() {
            toggleTheme();
        });
    });
}

// Alterna entre os temas claro e escuro
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Atualiza o atributo no HTML
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Atualiza o ícone do botão
    updateThemeIcon(newTheme);
    
    // Salva a preferência do usuário
    localStorage.setItem('financas-theme', newTheme);
    
    console.log(`Tema alterado para: ${newTheme}`);
}

// Atualiza o ícone do botão de tema
function updateThemeIcon(theme) {
    const themeIcons = document.querySelectorAll('.theme-toggle i');
    
    themeIcons.forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'fas fa-lightbulb';
            icon.title = 'Mudar para tema claro';
        } else {
            icon.className = 'far fa-lightbulb';
            icon.title = 'Mudar para tema escuro';
        }
    });
}

// Carrega o tema salvo nas preferências do usuário
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('financas-theme');
    
    if (savedTheme) {
        // Aplica o tema salvo
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        console.log(`Tema carregado das preferências: ${savedTheme}`);
    } else {
        // Usa o tema padrão (claro)
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon('light');
        console.log('Tema padrão (claro) aplicado');
    }
}
