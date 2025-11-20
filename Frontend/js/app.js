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

async function fetchCampanhaDetalhe() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) throw new Error('ID não encontrado');
        
        // Prepara Headers
        const headers = { 'Content-Type': 'application/json' };
        let user = null;
        
        // Se tiver token, busca o usuário atual para saber se ele participa
        if (AUTH_TOKEN) {
            headers['Authorization'] = `Token ${AUTH_TOKEN}`;
            try {
                const uRes = await fetch(`${API_URL}/auth/user/`, { headers });
                if (uRes.ok) user = await uRes.json();
            } catch (e) { console.log('Erro ao buscar user', e); }
        }
        
        // Busca Detalhes da Campanha
        const response = await fetch(`${API_URL}/campanhas/${id}/`, { headers });
        if (!response.ok) throw new Error('Campanha não encontrada');
        const campanha = await response.json();

        // Preenche HTML básico
        document.title = campanha.titulo;
        document.getElementById('detail-title').innerText = campanha.titulo;
        document.getElementById('detail-description').innerText = campanha.descricao;
        document.getElementById('detail-status').innerText = campanha.status;
        // (Datas omitidas para brevidade, adicione se quiser)

        // Listas (Eventos, Doações, Apoios)
        renderList('event-list', campanha.eventos, (item) => `
            <div class="event-card"><h4>${item.titulo}</h4><p>${item.descricao}</p></div>
        `, 'Nenhum evento.');
        
        renderList('donation-list', campanha.doacoes, (item) => `
            <div class="donation-card"><h4>R$ ${item.valor || 'Material'}</h4><p>${item.usuario_username || 'Anônimo'}</p></div>
        `, 'Nenhuma doação.');

        renderList('support-list', campanha.apoios, (item) => `
            <div class="support-card"><h4>${item.nome_instituicao}</h4><p>${item.tipo_apoio}</p></div>
        `, 'Nenhum apoio.');

        // Lógica do Botão PARTICIPAR (CORRIGIDA)
        const wrapper = document.getElementById('participate-wrapper');
        if (user) {
            // Verifica se o ID do usuário está na lista de participantes da campanha
            // O endpoint /user/ retorna 'pk', a campanha retorna lista de IDs.
            let isParticipating = campanha.participantes.includes(user.pk);

            const renderButton = () => {
                wrapper.innerHTML = `<button id="p-btn" class="btn-primary">${isParticipating ? 'Sair da Campanha' : 'Participar'}</button>`;
                // Re-atribui o evento de clique ao novo botão
                document.getElementById('p-btn').onclick = handleParticipateClick;
            };

            const handleParticipateClick = async (e) => {
                e.preventDefault();
                const btn = e.target;
                btn.disabled = true;
                btn.innerText = 'Processando...';

                try {
                    const res = await fetch(`${API_URL}/campanhas/${id}/participar/`, {
                        method: 'POST',
                        headers: { 'Authorization': `Token ${AUTH_TOKEN}` } // Sem body, sem Content-Type JSON
                    });
                    if (!res.ok) throw new Error('Erro ao participar');
                    
                    // Inverte o estado localmente e re-renderiza o botão
                    isParticipating = !isParticipating;
                    renderButton(); 

                } catch (err) {
                    alert('Erro: ' + err.message);
                    renderButton(); // Restaura o botão
                }
            };

            renderButton(); // Renderiza a primeira vez

        } else {
            wrapper.innerHTML = `<p>Faça <a href="login.html">login</a> para participar.</p>`;
        }

    } catch (error) {
        console.error(error);
        document.querySelector('.detail-content').innerHTML = '<h2>Erro ao carregar campanha.</h2>';
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
function setupInteractiveChecklist() { /* ...código anterior... */ }
async function fetchInstituicaoDetalhe() { /* ...código anterior... */ }