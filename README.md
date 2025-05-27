# FinançasPro - Controle Financeiro Pessoal

![FinançasPro Logo](https://img.shields.io/badge/Finan%C3%A7asPro-Controle%20Financeiro-3B82F6)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-1.0.0-brightgreen)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue)

## 📊 Sobre o Projeto

O **FinançasPro** é uma aplicação web moderna para controle financeiro pessoal, desenvolvida com foco em usabilidade e eficiência. Com uma interface intuitiva e responsiva, permite que os usuários gerenciem suas finanças de forma simples e organizada.

### ✨ Funcionalidades Principais

- **Cadastro e Login de Usuários**: Sistema seguro de autenticação
- **Dashboard Financeiro**: Visão geral das suas finanças com gráficos e resumos
- **Gerenciamento de Transações**: Adicione, visualize e remova receitas e despesas
- **Categorização**: Organize suas transações por categorias
- **Gráficos e Relatórios**: Visualize sua saúde financeira através de gráficos interativos
- **Tema Claro/Escuro**: Escolha o tema que mais agrada aos seus olhos
- **Design Responsivo**: Funciona perfeitamente em dispositivos móveis e desktop

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Chart.js para visualização de dados
- FontAwesome para ícones

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- JWT para autenticação

## 📷 Screenshots

*Imagens da aplicação serão adicionadas aqui*

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js (v14+)
- MongoDB (local ou Atlas)

### Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/financaspro.git
   cd financaspro
   ```

2. Instale as dependências do backend:
   ```bash
   cd backend
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:
     ```
     MONGODB_URI=sua_string_de_conexao_mongodb
     JWT_SECRET=seu_segredo_jwt
     PORT=3000
     ```

4. Inicie o servidor backend:
   ```bash
   node server.js
   ```

5. Sirva os arquivos do frontend:
   ```bash
   cd ../financaspro_estatico
   # Usando Python (se instalado)
   python -m http.server 5000
   # OU usando Node.js
   npx serve .
   ```

6. Acesse a aplicação no navegador:
   - Frontend: http://localhost:5000/login.html
   - Backend API: http://localhost:3000

## 👨‍💻 Autor e Desenvolvedor

**William Simas**

- 📧 Email: wsimasdev.10@gmail.com
- 🔗 GitHub: [github.com/seu-usuario]([https://github.com/seu-usuario](https://github.com/williamsimass))
- 🔗 LinkedIn: [linkedin.com/in/seu-perfil]([https://linkedin.com/in/seu-perfil](https://www.linkedin.com/in/williamsimas/))

## 💰 Apoie o Projeto

Se você gostou do FinançasPro e deseja apoiar o desenvolvimento contínuo, considere fazer uma doação:

**Chave PIX:** 08b0dd91-c855-4993-b8fe-0236ccd02ab6

Qualquer contribuição é muito bem-vinda e ajuda a manter o projeto ativo!

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Agradeço a todos que apoiaram o desenvolvimento deste projeto
- Inspirado pela necessidade de uma ferramenta simples e eficiente para controle financeiro pessoal

---

<p align="center">
  Desenvolvido com ❤️ por William Simas
</p>
