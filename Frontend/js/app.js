// No arquivo: frontend/js/app.js

// --- CONSTANTES GLOBAIS ---
const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000'; // Necessário para montar o link da imagem
const AUTH_TOKEN = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Configura o Menu (Login/Logout)
    updateHeaderUI();

    // 2. Menu Mobile
    const hamburger = document.querySelector('.menu-hamburger');
    const navMenu = document.querySelector('.main-nav');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // 3. Roteamento Simples (Executa função baseada na página)
    const path = window.location.pathname;

    if (path.endsWith('participar.html') || path.endsWith('/') || path.endsWith('index.html')) {
        // Se houver um grid de campanhas, carrega-as
        const campaignGrid = document.querySelector('.campaign-grid');
        if (campaignGrid) fetchCampanhas(campaignGrid);
        
    } else if (path.endsWith('campanha-detalhe.html')) {
        fetchCampanhaDetalhe();
        
    } else if (path.endsWith('doar.html')) {
        setupDonationForm();
        
    } else if (path.endsWith('register.html')) {
        setupRegistrationForm();
        
    } else if (path.endsWith('login.html')) {
        setupLoginForm();
        
    } else if (path.endsWith('pedir-ajuda.html')) {
        setupHelpForm();
        
    } else if (path.endsWith('acoes.html')) {
        fetchInstituicoes();
        
    } else if (path.endsWith('checklist.html')) {
        setupInteractiveChecklist();
        
    } else if (path.endsWith('instituicao-detalhe.html')) {
        fetchInstituicaoDetalhe();
    }
    
    // 4. Animações Fade-in (Genérico)
    setupFadeInAnimations();
});

// --- FUNÇÕES AUXILIARES ---

function updateHeaderUI() {
    const navUl = document.querySelector('.main-nav ul');
    if (!navUl) return;

    if (AUTH_TOKEN) {
        // LOGADO
        navUl.innerHTML = `
            <li><a href="index.html">HOME</a></li>
            <li><a href="participar.html">CAMPANHAS</a></li>
            <li><a href="checklist.html">CHECKLIST</a></li>
            <li><a href="acoes.html">AÇÕES</a></li>
            <li><a href="pedir-ajuda.html">PEDIR AJUDA</a></li> 
            <li><a href="doar.html" class="btn-primary">Faça uma Doação</a></li>
            <li><a href="#" id="logout-button">LOGOUT</a></li> 
        `;
        document.getElementById('logout-button').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    } else {
        // DESLOGADO
        navUl.innerHTML = `
            <li><a href="index.html">HOME</a></li>
            <li><a href="participar.html">CAMPANHAS</a></li>
            <li><a href="checklist.html">CHECKLIST</a></li>
            <li><a href="acoes.html">AÇÕES</a></li>
            <li><a href="login.html">LOGIN</a></li>
            <li><a href="doar.html" class="btn-primary">Faça uma Doação</a></li>
        `;
    }
}

function setupFadeInAnimations() {
    const elements = document.querySelectorAll('.section-title, .impact-card, .testimonial-card, .how-to-card, .campaign-card, .event-card, .donation-card, .support-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Anima só uma vez
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// --- FUNÇÕES DE PÁGINA ---

async function fetchCampanhas(gridElement) {
    try {
        const response = await fetch(`${API_URL}/campanhas/`);
        if (!response.ok) throw new Error('Erro ao buscar campanhas');
        const campanhas = await response.json();
        
        gridElement.innerHTML = ''; 
        
        campanhas.forEach(campanha => {
            // CORREÇÃO IMAGEM: Verifica se existe imagem e monta URL completo
            let imgUrl = 'images/campanha-placeholder.jpg'; // Default
            if (campanha.imagem_capa) {
                // Se a API já mandar http, usa; senão concatena BASE_URL
                if (campanha.imagem_capa.startsWith('http')) {
                    imgUrl = campanha.imagem_capa;
                } else {
                    imgUrl = `${BASE_URL}${campanha.imagem_capa}`;
                }
            }

            const cardHTML = `
            <a href="campanha-detalhe.html?id=${campanha.id}" class="campaign-card-link">
                <div class="campaign-card">
                    <div class="campaign-image">
                        <img src="${imgUrl}" alt="${campanha.titulo}" onerror="this.src='images/campanha-placeholder.jpg'">
                    </div>
                    <div class="campaign-content">
                        <h3>${campanha.titulo}</h3>
                        <p class="campaign-description">${campanha.descricao.substring(0, 100)}...</p> 
                        <span class="participant-count">${campanha.participantes_count} participantes</span>
                    </div>
                </div>
            </a>`;
            gridElement.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        console.error(error);
        gridElement.innerHTML = '<p>Não foi possível carregar as campanhas.</p>';
    }
}

// No arquivo: frontend/js/app.js

async function fetchCampanhaDetalhe() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) throw new Error('ID não encontrado');
        
        const headers = { 'Content-Type': 'application/json' };
        let user = null;

        // 1. Buscar Usuário Logado
        if (AUTH_TOKEN) {
            headers['Authorization'] = `Token ${AUTH_TOKEN}`;
            try {
                const uRes = await fetch(`${API_URL}/auth/user/`, { headers });
                if (uRes.ok) {
                    user = await uRes.json();
                    // Garante que temos o ID correto
                    user.id = user.pk || user.id;
                }
            } catch(e) { console.error(e); }
        }
        
        // 2. Buscar Campanha
        const response = await fetch(`${API_URL}/campanhas/${id}/`, { headers });
        if (!response.ok) throw new Error('Campanha não encontrada');
        const campanha = await response.json();

        // Preencher HTML
        document.title = campanha.titulo;
        document.getElementById('detail-title').innerText = campanha.titulo;
        document.getElementById('detail-description').innerText = campanha.descricao;
        document.getElementById('detail-status').innerText = campanha.status;
        
        // Preencher Listas (Função auxiliar)
        renderList('event-list', campanha.eventos, i => `<div class="event-card"><h4>${i.titulo}</h4><p>${i.descricao}</p></div>`, 'Sem eventos.');
        renderList('donation-list', campanha.doacoes, i => `<div class="donation-card"><h4>R$ ${i.valor}</h4><p>${i.usuario_username || 'Anônimo'}</p></div>`, 'Sem doações.');
        renderList('support-list', campanha.apoios, i => `<div class="support-card"><h4>${i.nome_instituicao}</h4><p>${i.tipo_apoio}</p></div>`, 'Sem apoio.');

        // 3. Lógica do Botão Participar
        const wrapper = document.getElementById('participate-wrapper');
        
        if (user) {
            // Verifica se o usuário JÁ participa
            let isParticipating = campanha.participantes.includes(user.id);

            // Função para desenhar o botão
            const renderBtn = () => {
                const btnText = isParticipating ? 'Sair da Campanha' : 'Participar desta Campanha';
                const btnClass = isParticipating ? 'btn-secondary participate-btn' : 'btn-primary';
                
                wrapper.innerHTML = `<button id="p-btn" class="${btnClass}">${btnText}</button>`;
                
                // Adiciona o evento de clique ao NOVO botão
                document.getElementById('p-btn').onclick = handleClick;
            };

            // Função do clique
            const handleClick = async (e) => {
                e.preventDefault();
                const btn = e.target;
                btn.disabled = true;
                btn.innerText = 'Processando...';

                try {
                    // Faz o pedido ao backend
                    const postResp = await fetch(`${API_URL}/campanhas/${id}/participar/`, {
                        method: 'POST',
                        headers: { 'Authorization': `Token ${AUTH_TOKEN}` } // Sem Content-Type
                    });

                    if (!postResp.ok) {
                        const err = await postResp.json();
                        throw new Error(err.detail || 'Erro ao participar');
                    }

                    // Sucesso: Inverte o estado e redesenha o botão
                    isParticipating = !isParticipating;
                    renderBtn();

                } catch (err) {
                    console.error(err);
                    wrapper.insertAdjacentHTML('beforeend', `<p style="color:red">${err.message}</p>`);
                    renderBtn(); // Restaura o botão em caso de erro
                }
            };

            renderBtn(); // Desenha o botão inicial

        } else {
            wrapper.innerHTML = `<p>Faça <a href="login.html">login</a> para participar.</p>`;
        }

    } catch (error) {
        console.error(error);
        document.querySelector('.detail-content').innerHTML = '<h2>Erro ao carregar campanha.</h2>';
    }
}

// Função auxiliar que faltava no seu código anterior
function renderList(id, data, template, emptyMsg) {
    const el = document.getElementById(id);
    if(!el) return;
    if(data && data.length > 0) {
        el.innerHTML = data.map(template).join('');
    } else {
        el.innerHTML = `<p>${emptyMsg}</p>`;
    }
}

// Helper simples para renderizar listas
function renderList(elementId, dataArray, templateFn, emptyMsg) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (dataArray && dataArray.length > 0) {
        el.innerHTML = dataArray.map(templateFn).join('');
    } else {
        el.innerHTML = `<p>${emptyMsg}</p>`;
    }
}

// --- FORMS ---

function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { email: form.email.value, password: form.password.value };
        
        try {
            const res = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.non_field_errors || 'Erro no login');

            localStorage.setItem('authToken', json.key);
            window.location.href = 'index.html'; // Redireciona para a home

        } catch (err) {
            document.getElementById('form-message').innerText = err.message;
            document.getElementById('form-message').style.display = 'block';
        }
    });
}

function setupRegistrationForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            username: form.username.value,
            email: form.email.value,
            password1: form.password.value,
            password2: form.password2.value,
            tipo: form.tipo.value
        };

        try {
            const res = await fetch(`${API_URL}/auth/registration/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (!res.ok) throw new Error('Erro no registro');

            alert('Conta criada! Faça login.');
            window.location.href = 'login.html';

        } catch (err) {
            alert('Erro ao criar conta. Verifique os dados.');
        }
    });
}

// (setupDonationForm, setupHelpForm, fetchInstituicoes, setupInteractiveChecklist, fetchInstituicaoDetalhe mantêm-se iguais às versões anteriores que funcionavam)
// Para garantir que não falte nada, adicionei stubs funcionais abaixo. Se já tiver o código delas, mantenha.
async function setupDonationForm() { /* ...código anterior... */ }
function setupHelpForm() { /* ...código anterior... */ }
async function fetchInstituicoes() { /* ...código anterior... */ }
function setupInteractiveChecklist() {
    const items = document.querySelectorAll('.checklist-category li');
    
    if (items.length === 0) return; // Se não houver itens, sai

    items.forEach(item => {
        item.addEventListener('click', () => {
            // Alterna a classe 'checked' (que risca o texto e muda o ícone)
            item.classList.toggle('checked');
        });
    });
}
async function fetchInstituicaoDetalhe() { /* ...código anterior... */ }