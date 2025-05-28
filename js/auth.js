/**
 * Auth.js - Funções para autenticação e gerenciamento de usuários
 * Gerencia login, registro, verificação de token e redirecionamento
 */

// Verifica se o usuário está na página correta com base no estado de autenticação
document.addEventListener("DOMContentLoaded", function() {
    // Obtém o nome do arquivo atual
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    
    // Verifica se há token salvo
    const token = localStorage.getItem("financas-token");
    
    // Páginas que não exigem autenticação
    const publicPages = ["login.html", "register.html"];
    
    // Verifica se o usuário está autenticado
    if (token) {
        // Se estiver em uma página pública e já estiver autenticado, redireciona para o dashboard
        if (publicPages.includes(currentPage)) {
            window.location.href = "index.html";
            return;
        }
        
        // Se estiver no dashboard, verifica se o token é válido
        verifyTokenAndLoadData();
    } else {
        // Se não estiver autenticado e não estiver em uma página pública, redireciona para login
        if (!publicPages.includes(currentPage) && currentPage !== "faq.html") {
            window.location.href = "login.html";
            return;
        }
    }
    
    // Configura os formulários de login e registro
    setupLoginForm();
    setupRegisterForm();
    setupLogoutButton();
    setupFaqLinks();
});

// Verifica se o token é válido e carrega os dados do usuário
async function verifyTokenAndLoadData() {
    try {
        // Adiciona um pequeno atraso para evitar múltiplas verificações simultâneas
        // que podem ocorrer durante refreshs rápidos
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await AuthAPI.verifyToken();
        if (result && result.valid) {
            console.log("Token válido, usuário autenticado:", result.user.username);
            // Atualiza informações do usuário na interface
            updateUserInfo(result.user);
            // Carrega dados do dashboard se estiver na página principal
            if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
                loadDashboardData();
            }
        } else {
            // Token inválido, redireciona para login
            console.warn("Token inválido ou expirado");
            handleLogout();
        }
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        // Não faz logout automático em caso de erro de rede
        // para evitar deslogar o usuário em caso de problemas temporários
        if (error.message && (error.message.includes("401") || error.message.includes("403"))) {
            handleLogout();
        }
    }
}

// Configura o formulário de login
function setupLoginForm() {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;
    
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        // Limpa mensagens de erro anteriores
        const errorElement = document.getElementById("login-error");
        errorElement.classList.add("d-none");
        
        // Obtém os dados do formulário
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        
        // Mostra indicador de carregamento
        const buttonText = document.getElementById("login-button-text");
        const spinner = document.getElementById("login-spinner");
        buttonText.textContent = "Entrando...";
        spinner.classList.remove("d-none");
        
        try {
            console.log("Tentando login com:", username);
            const result = await AuthAPI.login(username, password);
            console.log("Resposta do login:", result);
            
            if (result && result.token) {
                // Salva o token e redireciona para o dashboard
                localStorage.setItem("financas-token", result.token);
                console.log("Token salvo, redirecionando para dashboard");
                window.location.href = "index.html";
            } else {
                console.error("Resposta sem token:", result);
                throw new Error("Resposta inválida do servidor");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            
            // Determina a mensagem de erro apropriada
            let errorMessage = "Erro ao fazer login. Tente novamente.";
            
            if (error.message === "Credenciais inválidas.") {
                errorMessage = "Nome de usuário ou senha incorretos. Verifique suas credenciais.";
            } else if (error.message.includes("fetch")) {
                errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão.";
            }
            
            // Exibe mensagem de erro
            errorElement.querySelector("#error-message").textContent = errorMessage;
            errorElement.classList.remove("d-none");
            errorElement.classList.add("show");
            
            // Restaura o botão
            buttonText.textContent = "Entrar";
            spinner.classList.add("d-none");
        }
    });
}

// Configura o formulário de registro
function setupRegisterForm() {
    const registerForm = document.getElementById("register-form");
    if (!registerForm) return;
    
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        // Limpa mensagens anteriores
        const errorElement = document.getElementById("register-error");
        const successElement = document.getElementById("register-success");
        errorElement.classList.add("d-none");
        successElement.classList.add("d-none");
        
        // Validação do formulário
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        
        // Validações básicas
        if (!firstName || !lastName || !username || !email || !password) {
            errorElement.querySelector("#error-message").textContent = 
                "Todos os campos são obrigatórios.";
            errorElement.classList.remove("d-none");
            errorElement.classList.add("show");
            return;
        }
        
        // Validação de email
        if (!/\S+@\S+\.\S+/.test(email)) {
            errorElement.querySelector("#error-message").textContent = 
                "Por favor, insira um email válido.";
            errorElement.classList.remove("d-none");
            errorElement.classList.add("show");
            return;
        }
        
        // Validação de senha
        if (password.length < 6) {
            errorElement.querySelector("#error-message").textContent = 
                "A senha deve ter pelo menos 6 caracteres.";
            errorElement.classList.remove("d-none");
            errorElement.classList.add("show");
            return;
        }
        
        // Obtém os dados do formulário
        const userData = {
            firstName,
            lastName,
            username,
            email,
            password
        };
        
        // Mostra indicador de carregamento
        const buttonText = document.getElementById("register-button-text");
        const spinner = document.getElementById("register-spinner");
        buttonText.textContent = "Registrando...";
        spinner.classList.remove("d-none");
        
        try {
            console.log("Tentando registrar usuário:", username);
            const result = await AuthAPI.register(userData);
            console.log("Resposta do registro:", result);
            
            // Exibe mensagem de sucesso
            successElement.classList.remove("d-none");
            successElement.classList.add("show");
            
            // Limpa o formulário
            registerForm.reset();
            
            // Redireciona para login após 2 segundos
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } catch (error) {
            console.error("Erro no registro:", error);
            
            // Determina a mensagem de erro apropriada
            let errorMessage = "Erro ao registrar. Tente novamente.";
            
            if (error.message.includes("Nome de usuário já está em uso")) {
                errorMessage = "Este nome de usuário já está em uso. Escolha outro.";
            } else if (error.message.includes("Email já está em uso")) {
                errorMessage = "Este email já está registrado. Use outro ou faça login.";
            } else if (error.message.includes("fetch")) {
                errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão.";
            }
            
            // Exibe mensagem de erro
            errorElement.querySelector("#error-message").textContent = errorMessage;
            errorElement.classList.remove("d-none");
            errorElement.classList.add("show");
        } finally {
            // Restaura o botão
            buttonText.textContent = "Registrar";
            spinner.classList.add("d-none");
        }
    });
}

// Configura o botão de logout
function setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener("click", function(event) {
        event.preventDefault();
        handleLogout();
    });
}

// Função para lidar com o logout
function handleLogout() {
    AuthAPI.logout();
    window.location.href = "login.html";
}

// Atualiza informações do usuário na interface
function updateUserInfo(user) {
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
        userNameElement.textContent = user.firstName || user.username;
    }
    
    const userFullNameElement = document.getElementById("user-full-name");
    if (userFullNameElement) {
        userFullNameElement.textContent = `${user.firstName} ${user.lastName}`;
    }
}

// Carrega dados do dashboard
function loadDashboardData() {
    // Esta função será implementada no arquivo dashboard.js
    if (typeof loadTransactions === "function") {
        loadTransactions();
    }
}

// Configura links para a página de FAQ
function setupFaqLinks() {
    const faqLinks = document.querySelectorAll("#faq-link");
    faqLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            window.location.href = "index.html#faq";
        });
    });
}

// Adiciona evento para detectar atualizações da página
window.addEventListener('beforeunload', function() {
    // Salva um timestamp para controlar a frequência de refreshs
    const lastRefresh = localStorage.getItem('last-refresh-time');
    const now = Date.now();
    
    if (lastRefresh && (now - parseInt(lastRefresh)) < 2000) {
        // Se houve refresh há menos de 2 segundos, incrementa contador
        const refreshCount = parseInt(localStorage.getItem('refresh-count') || '0');
        localStorage.setItem('refresh-count', (refreshCount + 1).toString());
    } else {
        // Caso contrário, reinicia contador
        localStorage.setItem('refresh-count', '1');
    }
    
    localStorage.setItem('last-refresh-time', now.toString());
});

// Verifica contador de refreshs ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const refreshCount = parseInt(localStorage.getItem('refresh-count') || '0');
    console.log(`Contador de refreshs: ${refreshCount}`);
    
    // Se houver muitos refreshs em sequência, não verifica o token imediatamente
    // para evitar sobrecarga de requisições
    if (refreshCount > 3) {
        console.log('Muitos refreshs detectados, aguardando antes de verificar token');
        setTimeout(() => {
            localStorage.setItem('refresh-count', '0');
        }, 2000);
    }
});
