/**
 * API.js - Funções para comunicação com o backend
 * Centraliza todas as chamadas de API para o FinançasPro
 */

// URL base da API (ajuste conforme necessário)
const API_BASE_URL = "https://financaspro-back.onrender.com"; 
// Isso detecta automaticamente o protocolo e hostname atual, apenas fixando a porta 3000

console.log("API configurada para:", API_BASE_URL);

// Contador de requisições para evitar logout após múltiplos refreshs
let requestCounter = 0;
const MAX_REQUESTS_BEFORE_REFRESH = 10;

/**
 * Função genérica para fazer requisições à API
 * @param {string} endpoint - Endpoint da API (ex: "/api/auth/login")
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Dados a serem enviados (para POST, PUT)
 * @param {boolean} requireAuth - Se a requisição requer token de autenticação
 * @returns {Promise} - Promise com o resultado da requisição
 */
async function apiRequest(endpoint, method = "GET", data = null, requireAuth = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Configuração da requisição
    const config = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        }
        // Removido: credentials: "include" - Isso estava causando o erro de CORS
    };
    
    // Adiciona token de autenticação se necessário
    if (requireAuth) {
        const token = localStorage.getItem("financas-token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
    }
    
    // Adiciona corpo da requisição se houver dados
    if (data) {
        config.body = JSON.stringify(data);
    }
    
    try {
        console.log(`Fazendo requisição ${method} para ${url}`, data ? "com dados" : "sem dados");
        
        // Incrementa contador de requisições apenas para verificações de token
        if (endpoint === "/api/auth/verify") {
            requestCounter++;
            console.log(`Contador de requisições: ${requestCounter}/${MAX_REQUESTS_BEFORE_REFRESH}`);
            
            // Se atingir o limite, renova o token em vez de verificar
            if (requestCounter >= MAX_REQUESTS_BEFORE_REFRESH) {
                console.log("Limite de requisições atingido, renovando token...");
                requestCounter = 0;
                
                // Tenta renovar o token atual em vez de apenas verificar
                const currentToken = localStorage.getItem("financas-token");
                if (currentToken) {
                    try {
                        // Renova o token sem fazer logout
                        const renewResponse = await fetch(`${API_BASE_URL}/api/auth/renew`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${currentToken}`
                            }
                        });
                        
                        if (renewResponse.ok) {
                            const renewResult = await renewResponse.json();
                            if (renewResult.token) {
                                localStorage.setItem("financas-token", renewResult.token);
                                console.log("Token renovado com sucesso");
                            }
                        }
                    } catch (renewError) {
                        console.warn("Erro ao renovar token:", renewError);
                        // Continua com a verificação normal mesmo se falhar
                    }
                }
            }
        }
        
        const response = await fetch(url, config);
        
        // Verifica se a resposta é 401 (não autorizado) ou 403 (proibido)
        if (response.status === 401 || response.status === 403) {
            // Token inválido ou expirado, tenta renovar antes de redirecionar
            console.warn("Autenticação falhou (401/403), tentando renovar token");
            
            const currentToken = localStorage.getItem("financas-token");
            if (currentToken && endpoint !== "/api/auth/renew") {
                try {
                    // Tenta renovar o token
                    const renewResponse = await fetch(`${API_BASE_URL}/api/auth/renew`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${currentToken}`
                        }
                    });
                    
                    if (renewResponse.ok) {
                        const renewResult = await renewResponse.json();
                        if (renewResult.token) {
                            localStorage.setItem("financas-token", renewResult.token);
                            console.log("Token renovado após 401/403");
                            
                            // Refaz a requisição original com o novo token
                            config.headers["Authorization"] = `Bearer ${renewResult.token}`;
                            const retryResponse = await fetch(url, config);
                            
                            if (retryResponse.ok) {
                                const retryResult = await retryResponse.json();
                                return retryResult;
                            }
                        }
                    }
                } catch (renewError) {
                    console.error("Erro ao renovar token após 401/403:", renewError);
                }
            }
            
            // Se a renovação falhar ou não for possível, faz logout
            localStorage.removeItem("financas-token");
            window.location.href = "login.html";
            return null;
        }
        
        // Se for DELETE bem sucedido, pode não retornar JSON
        if (method === "DELETE" && (response.status === 200 || response.status === 204)) {
            return { success: true };
        }
        
        // Para outras respostas, tenta parsear o JSON
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ 
                message: response.statusText || "Erro desconhecido" 
            }));
            console.error(`Erro na requisição: ${response.status}`, errorData);
            throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`Resposta recebida de ${url}:`, result);
        return result;
    } catch (error) {
        console.error("Erro na requisição API:", error);
        throw error;
    }
}

// Funções específicas de autenticação
const AuthAPI = {
    /**
     * Registra um novo usuário
     * @param {object} userData - Dados do usuário (firstName, lastName, username, email, password)
     * @returns {Promise} - Promise com o resultado do registro
     */
    register: async (userData) => {
        return apiRequest("/api/auth/register", "POST", userData, false);
    },
    
    /**
     * Realiza login do usuário
     * @param {string} username - Nome de usuário
     * @param {string} password - Senha
     * @returns {Promise} - Promise com o resultado do login (token e dados do usuário)
     */
    login: async (username, password) => {
        // Reseta o contador ao fazer login
        requestCounter = 0;
        return apiRequest("/api/auth/login", "POST", { username, password }, false);
    },
    
    /**
     * Verifica se o token atual é válido
     * @returns {Promise} - Promise com o resultado da verificação
     */
    verifyToken: async () => {
        return apiRequest("/api/auth/verify", "GET");
    },
    
    /**
     * Realiza logout do usuário
     * @returns {Promise} - Promise com o resultado do logout
     */
    logout: async () => {
        localStorage.removeItem("financas-token");
        return { success: true };
    }
};

// Funções específicas de transações
const TransactionsAPI = {
    /**
     * Obtém todas as transações do usuário
     * @returns {Promise} - Promise com a lista de transações
     */
    getAll: async () => {
        return apiRequest("/api/transactions", "GET");
    },
    
    /**
     * Adiciona uma nova transação
     * @param {object} transaction - Dados da transação
     * @returns {Promise} - Promise com a transação criada
     */
    add: async (transaction) => {
        return apiRequest("/api/transactions", "POST", transaction);
    },
    
    /**
     * Remove uma transação pelo ID
     * @param {string} id - ID da transação
     * @returns {Promise} - Promise com o resultado da remoção
     */
    remove: async (id) => {
        return apiRequest(`/api/transactions/${id}`, "DELETE");
    }
};

// Exporta as funções para uso global
window.AuthAPI = AuthAPI;
window.TransactionsAPI = TransactionsAPI;
