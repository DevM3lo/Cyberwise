# 🌐 CyberWise - Plataforma de Mobilização Social

> **Uma solução Full-Stack para conectar cidadãos, ONGs e causas sociais através da tecnologia.**

![Status](https://img.shields.io/badge/Status-Concluído-success)
![Python](https://img.shields.io/badge/Backend-Django%20REST-blue)
![Frontend](https://img.shields.io/badge/Frontend-JavaScript%20Vanilla-yellow)

## 🔗 Links de Acesso (Deploy)

| Aplicação | Link |
| :--- | :--- |
| **🖥️ Site** | [https://cyberwise-eight.vercel.app](cyberwise-eight.vercel.app) | 
| **😎 Admin**| [https://cyberwise-api.onrender.com/admin/](https://cyberwise-api.onrender.com/admin/) |


---

## 🚀 Funcionalidades do Projeto

O CyberWise foi desenvolvido para atender aos requisitos de um sistema de gestão de serviços sociais/doações (Categoria A).

### 👤 Para o Usuário
* **Autenticação Completa:** Registro e Login via Token (JWT/AuthToken).
* **Painel do Usuário:** Histórico pessoal de doações, campanhas que participa e pedidos de ajuda.
* **Interatividade em Tempo Real:**
    * Botão "Participar/Sair" de campanhas sem recarregar a página.
    * Mural de Comentários para discussão nas campanhas.
    * Checklist de Cidadania Digital interativo.
* **Fluxo de Doação:**
    * Doação Financeira (Geração de Modal com Chave PIX).
    * Doação Material (Formulário dinâmico).
    * Redirecionamento automático para o "Recibo" no perfil.

### 🛠️ Para o Administrador (Gestão)
* **Gestão de Conteúdo:** Cadastro de Campanhas, Eventos, Instituições e Depoimentos via Django Admin.
* **Upload de Mídia:** Integração com **Cloudinary** para armazenamento persistente de imagens na nuvem.
* **Moderação:** Visualização de todos os pedidos de ajuda e doações recebidas.

---

## 🛠️ Tecnologias Utilizadas

### Backend (Server-side)
* **Python & Django 5:** Framework principal.
* **Django REST Framework (DRF):** Construção da API RESTful.
* **PostgreSQL:** Banco de dados de produção (Render).
* **SQLite:** Banco de dados de desenvolvimento (Local).
* **dj-rest-auth & AllAuth:** Sistema robusto de autenticação.
* **Cloudinary:** Armazenamento de imagens na nuvem.
* **WhiteNoise:** Gestão de arquivos estáticos em produção.

### Frontend (Client-side)
* **HTML5 & CSS3:** Layout responsivo (Mobile-First) e customizado.
* **JavaScript (Vanilla):** Lógica de consumo de API, manipulação de DOM e gestão de estado assíncrono (`async/await`).
* **Fetch API:** Comunicação com o backend.

---

## 📦 Como Rodar Localmente

Se quiser rodar este projeto no seu computador:

### 1. Clone o repositório
```bash
git clone [https://github.com/DevM3lo/Cyberwise.git](https://github.com/DevM3lo/Cyberwise.git)
cd CyberWise
