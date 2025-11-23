// No arquivo: frontend/js/app.js

// --- CONSTANTES GLOBAIS ---
const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000'; 
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

    // 3. Roteamento Simples
    const path = window.location.pathname;

    if (path.endsWith('participar.html') || path.endsWith('/') || path.endsWith('index.html')) {
        // Se houver grid de campanhas, carrega
        const campaignGrid = document.querySelector('.campaign-grid');
        if (campaignGrid) fetchCampanhas(campaignGrid);

        // Se houver grid de depoimentos, carrega (Geralmente na Home)
        const testimonialsGrid = document.getElementById('testimonials-grid');
        if (testimonialsGrid) fetchDepoimentos();
        
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

    } else if (path.endsWith('perfil.html')) {
        fetchUserProfile();

    } else if (path.endsWith('checklist.html')) {
        setupInteractiveChecklist();
        
    } else if (path.endsWith('instituicao-detalhe.html')) {
        fetchInstituicaoDetalhe();
    } 
    
    // 4. Animações Fade-in
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
            <li><a href="perfil.html">MEU PERFIL</a></li> 
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
    const elements = document.querySelectorAll('.section-title, .impact-card, .testimonial-card, .how-to-card, .campaign-card, .event-card, .donation-card, .support-card, .profile-block, .form-styled');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
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
            let imgUrl = 'images/campanha-placeholder.jpg';
            if (campanha.imagem_capa) {
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
        
        const headers = { 'Content-Type': 'application/json' };
        let user = null;

        // 1. Buscar Usuário Logado
        if (AUTH_TOKEN) {
            headers['Authorization'] = `Token ${AUTH_TOKEN}`;
            try {
                const uRes = await fetch(`${API_URL}/auth/user/`, { headers });
                if (uRes.ok) {
                    user = await uRes.json();
                    user.id = user.pk || user.id;
                }
            } catch(e) { console.error(e); }
        }
        
        // 2. Buscar Campanha
        const response = await fetch(`${API_URL}/campanhas/${id}/`, { headers });
        if (!response.ok) throw new Error('Campanha não encontrada');
        const campanha = await response.json();

        // Preencher HTML
        document.title = `${campanha.titulo} - CyberWise`;
        document.getElementById('detail-title').innerText = campanha.titulo;
        document.getElementById('detail-description').innerText = campanha.descricao;
        document.getElementById('detail-status').innerText = campanha.status;
        
        const dtInicio = document.getElementById('detail-data-inicio');
        if (dtInicio) dtInicio.innerText = new Date(campanha.data_inicio).toLocaleDateString('pt-BR');
        
        const dtFim = document.getElementById('detail-data-fim');
        if (dtFim) dtFim.innerText = campanha.data_fim ? new Date(campanha.data_fim).toLocaleDateString('pt-BR') : 'Sem data definida';

        // Listas
        renderList('event-list', campanha.eventos, i => `<div class="event-card"><h4>${i.titulo}</h4><p>${i.descricao}</p></div>`, 'Nenhum evento.');
        renderList('support-list', campanha.apoios, i => `<div class="support-card"><h4>${i.nome_instituicao}</h4><p>${i.tipo_apoio}</p></div>`, 'Nenhum apoio.');

        // Comentários
        renderList('comments-list', campanha.comentarios, (c) => {
            const data = new Date(c.data_criacao).toLocaleDateString('pt-BR');
            return `
            <div class="comment-card">
                <div class="comment-header"><span class="comment-author">@${c.usuario_username}</span><span>${data}</span></div>
                <div class="comment-text">${c.texto}</div>
            </div>`;
        }, 'Seja o primeiro a comentar!');

        // Formulário de Comentário
        const commentWrapper = document.getElementById('comment-form-wrapper');
        if (commentWrapper) {
            if (user) {
                commentWrapper.innerHTML = `<textarea id="comment-text" rows="3" placeholder="Deixe uma mensagem..."></textarea><button id="btn-comment" class="btn-primary" style="width:100%">Publicar</button>`;
                document.getElementById('btn-comment').onclick = async (e) => {
                    e.preventDefault();
                    const texto = document.getElementById('comment-text').value;
                    if (!texto) return alert("Escreva algo!");
                    try {
                        const res = await fetch(`${API_URL}/campanhas/${id}/comentar/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${AUTH_TOKEN}` },
                            body: JSON.stringify({ texto: texto })
                        });
                        if(!res.ok) throw new Error('Erro ao comentar');
                        window.location.reload();
                    } catch (err) { alert(err.message); }
                };
            } else {
                commentWrapper.innerHTML = `<p>Faça <a href="login.html">login</a> para comentar.</p>`;
            }
        }

        // Botão Participar
        const wrapper = document.getElementById('participate-wrapper');
        if (user) {
            let isPart = campanha.participantes.includes(user.id);
            const updateBtn = (p) => {
                wrapper.innerHTML = `<button id="p-btn" class="${p ? 'btn-secondary participate-btn' : 'btn-primary'}">${p ? 'Sair da Campanha' : 'Participar desta Campanha'}</button>`;
                document.getElementById('p-btn').onclick = handleParticipateClick;
            };
            const handleParticipateClick = async (e) => {
                e.preventDefault();
                const btn = e.target;
                btn.disabled = true; btn.innerText = 'Processando...';
                try {
                    const res = await fetch(`${API_URL}/campanhas/${id}/participar/`, {
                        method: 'POST',
                        headers: { 'Authorization': `Token ${AUTH_TOKEN}` }
                    });
                    if(!res.ok) throw new Error('Erro');
                    isPart = !isPart;
                    updateBtn(isPart);
                } catch (err) { alert('Erro: ' + err.message); updateBtn(isPart); }
            };
            updateBtn(isPart);
        } else {
            wrapper.innerHTML = `<p>Faça <a href="login.html">login</a> para participar.</p>`;
        }

    } catch (error) {
        console.error(error);
        const content = document.querySelector('.detail-content');
        if(content) content.innerHTML = '<h2>Erro ao carregar campanha.</h2>';
    }
}

// --- FORMULÁRIO DE DOAÇÃO ---
async function setupDonationForm() {
    const form = document.getElementById('donation-form');
    if (!form) return;

    // Elementos do Formulário
    const selectTipo = document.getElementById('tipo');
    const valorGroup = document.getElementById('valor-group');
    const descricaoGroup = document.getElementById('descricao-group');
    
    const msgEl = document.getElementById('form-message');
    
    const inputValor = document.getElementById('valor');
    const inputDescricao = document.getElementById('descricao');
    const inputRecado = document.getElementById('recado');

    // === Elementos do Modal (ADICIONADOS) ===
    const modal = document.getElementById('payment-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const copyPixBtn = document.getElementById('copy-pix-btn');

    // === 1. Lógica dos Botões do Modal (O CÓDIGO QUE FALTAVA) ===
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none'; // Fecha o modal
            // Opcional: Redirecionar para o perfil
            window.location.href = 'perfil.html';
        });
    }

    if (copyPixBtn) {
        copyPixBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const pixKey = document.getElementById('pix-key').innerText;
            navigator.clipboard.writeText(pixKey);
            copyPixBtn.innerText = "Copiado!";
            setTimeout(() => copyPixBtn.innerText = "Copiar", 2000);
        });
    }
    // =============================================================

    // 2. LÓGICA VISUAL (Esconde/Mostra)
    const updateVisibility = () => {
        if (selectTipo.value === 'financeira') {
            if(valorGroup) valorGroup.style.display = 'block';
            if(inputValor) inputValor.required = true;
            
            if(descricaoGroup) descricaoGroup.style.display = 'none';
            if(inputDescricao) {
                inputDescricao.required = false;
                inputDescricao.value = ''; 
            }
        } else {
            if(valorGroup) valorGroup.style.display = 'none';
            if(inputValor) {
                inputValor.required = false;
                inputValor.value = ''; 
            }
            
            if(descricaoGroup) descricaoGroup.style.display = 'block';
            if(inputDescricao) inputDescricao.required = true;
        }
    };

    selectTipo.addEventListener('change', updateVisibility);
    updateVisibility(); 

    // 3. Envio do Formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let valorFinal = (selectTipo.value === 'material') ? null : inputValor.value;
        let descricaoFinal = (selectTipo.value === 'financeira') ? null : inputDescricao.value;
        let recadoFinal = inputRecado ? inputRecado.value : '';

        const data = {
            tipo: selectTipo.value,
            campanha: null, 
            valor: valorFinal,
            descricao: descricaoFinal,
            recado: recadoFinal
        };

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (AUTH_TOKEN) headers['Authorization'] = `Token ${AUTH_TOKEN}`;

            const response = await fetch(`${API_URL}/doacoes/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }

            // Sucesso!
            form.reset();
            updateVisibility(); 
            
            // Abre o modal se for financeira
            if (data.tipo === 'financeira' && modal) {
                modal.style.display = 'flex';
            } else {
                msgEl.className = 'success';
                msgEl.innerText = 'Doação enviada com sucesso! Muito obrigado.';
                msgEl.style.display = 'block';
            }

        } catch (error) {
            console.error(error);
            msgEl.className = 'error';
            msgEl.innerText = 'Erro ao enviar doação.';
            msgEl.style.display = 'block';
        }
    });
}

// --- OUTRAS FUNÇÕES ---

function renderList(id, data, template, emptyMsg) {
    const el = document.getElementById(id);
    if(!el) return;
    if(data && data.length > 0) {
        el.innerHTML = data.map(template).join('');
    } else {
        el.innerHTML = `<p>${emptyMsg}</p>`;
    }
}

async function fetchInstituicoes() {
    const listEl = document.getElementById('instituicoes-list');
    if (!listEl) return;
    try {
        const res = await fetch(`${API_URL}/instituicoes/`);
        if(!res.ok) throw new Error('Erro');
        const data = await res.json();
        listEl.innerHTML = '';
        if(data.length === 0) { listEl.innerHTML = '<p>Sem instituições.</p>'; return; }
        data.forEach(inst => {
            listEl.insertAdjacentHTML('beforeend', `<li><a href="instituicao-detalhe.html?id=${inst.id}">${inst.nome} <span>Ver detalhes &rarr;</span></a></li>`);
        });
    } catch (e) { console.error(e); }
}

async function fetchInstituicaoDetalhe() {
    const container = document.querySelector('.detail-content');
    if(!container) return;
    const id = new URLSearchParams(window.location.search).get('id');
    try {
        const res = await fetch(`${API_URL}/instituicoes/${id}/`);
        const inst = await res.json();
        document.getElementById('detail-nome').innerText = inst.nome;
        document.getElementById('detail-email').innerText = inst.email || '-';
        document.getElementById('detail-telefone').innerText = inst.telefone || '-';
        document.getElementById('detail-endereco').innerText = inst.endereco || '-';
    } catch (e) { container.innerHTML = '<p>Erro ao carregar.</p>'; }
}

async function fetchDepoimentos() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    try {
        const res = await fetch(`${API_URL}/depoimentos/`);
        const data = await res.json();
        grid.innerHTML = '';
        if(data.length === 0) { grid.innerHTML = '<p>Sem depoimentos.</p>'; return; }
        data.forEach(d => {
            let img = d.foto ? (d.foto.startsWith('http') ? d.foto : `${BASE_URL}${d.foto}`) : 'https://randomuser.me/api/portraits/lego/1.jpg';
            grid.insertAdjacentHTML('beforeend', `<div class="testimonial-card"><div class="photo" style="background-image: url('${img}'); background-size: cover;"></div><p>“${d.texto}”</p><h4>${d.nome}</h4><small>${d.cargo || ''}</small></div>`);
        });
    } catch(e) { console.error(e); }
}

function setupInteractiveChecklist() {
    document.querySelectorAll('.checklist-category li').forEach(i => i.addEventListener('click', () => i.classList.toggle('checked')));
}

async function fetchUserProfile() {
    if (!AUTH_TOKEN) { window.location.href = 'login.html'; return; }
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Token ${AUTH_TOKEN}` };

    try {
        const userRes = await fetch(`${API_URL}/auth/user/`, { headers });
        const user = await userRes.json();
        document.getElementById('profile-username').innerText = user.username;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('profile-type').innerText = user.tipo || 'Usuário';

        const campRes = await fetch(`${API_URL}/campanhas/minhas/`, { headers });
        const campanhas = await campRes.json();
        const campList = document.getElementById('my-campaigns-list');
        if(campanhas.length > 0) {
            campList.innerHTML = '';
            campanhas.forEach(c => {
                let img = c.imagem_capa ? (c.imagem_capa.startsWith('http') ? c.imagem_capa : `${BASE_URL}${c.imagem_capa}`) : 'images/campanha-placeholder.jpg';
                campList.insertAdjacentHTML('beforeend', `<a href="campanha-detalhe.html?id=${c.id}" class="campaign-card-link"><div class="campaign-card"><div class="campaign-image" style="height:150px;"><img src="${img}"></div><div class="campaign-content" style="padding:15px;"><h4>${c.titulo}</h4></div></div></a>`);
            });
        } else { campList.innerHTML = '<p>Sem campanhas.</p>'; }

        // 3. Busca Minhas Doações (ATUALIZADO COM DATA)
        const doaRes = await fetch(`${API_URL}/doacoes/`, { headers });
        const doacoes = await doaRes.json();
        const doaList = document.getElementById('my-donations-list');
        
        if (doacoes.length > 0) {
            doaList.innerHTML = '';
            doacoes.forEach(d => {
                // --- Formatação do Valor (R$) ---
                const valor = d.valor 
                    ? parseFloat(d.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                    : 'Doação Material';
                
                // --- Formatação da Data (Dia/Mês/Ano) ---
                const dataObj = new Date(d.data_doacao);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');

                // --- HTML Atualizado com a Data à direita ---
                doaList.insertAdjacentHTML('beforeend', `
                    <div class="profile-item-card">
                        <div>
                            <strong>${valor}</strong> <br>
                            <small style="text-transform: capitalize;">${d.tipo}</small>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 13px; color: #666;">Data:</span><br>
                            <strong>${dataFormatada}</strong>
                        </div>
                    </div>
                `);
            });
        } else {
            doaList.innerHTML = '<p>Nenhuma doação registrada.</p>';
        }

        // 4. Busca Meus Pedidos de Ajuda (Mantenha como está ou atualize se quiser data também)
        const ajuRes = await fetch(`${API_URL}/ajuda/`, { headers });
        const ajudas = await ajuRes.json();
        const ajuList = document.getElementById('my-help-list');
        
        if (ajudas.length > 0) {
            ajuList.innerHTML = '';
            ajudas.forEach(a => {
                // Vamos adicionar data aqui também para ficar padrão!
                const dataAjuda = new Date(a.data_solicitacao).toLocaleDateString('pt-BR');
                
                // Cores para o status
                let statusColor = 'blue';
                if (a.status === 'concluida') statusColor = 'green';
                if (a.status === 'pendente') statusColor = 'orange';

                ajuList.insertAdjacentHTML('beforeend', `
                    <div class="profile-item-card">
                        <div>
                            <strong>${a.tipo.toUpperCase()}</strong> <br>
                            <small>${a.descricao.substring(0, 50)}...</small>
                        </div>
                        <div style="text-align:right">
                            <span style="color:${statusColor}; font-weight:bold;">${a.status.toUpperCase()}</span><br>
                            <span style="font-size:12px">${dataAjuda}</span>
                        </div>
                    </div>
                `);
            });
        } else { 
            ajuList.innerHTML = '<p>Sem pedidos.</p>'; 
        }
    } catch(e) { console.error(e); }
}

function setupLoginForm() {
    const form = document.getElementById('login-form');
    const msgEl = document.getElementById('form-message');
    if(!form) return;
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
            if(!res.ok) throw new Error(json.non_field_errors || 'Erro no login');
            localStorage.setItem('authToken', json.key);
            msgEl.className = 'success'; msgEl.innerText = 'Login sucesso!'; msgEl.style.display='block';
            window.location.href = 'index.html';
        } catch(err) { msgEl.className = 'error'; msgEl.innerText = err.message; msgEl.style.display='block'; }
    });
}

function setupRegistrationForm() {
    const form = document.getElementById('register-form');
    const msgEl = document.getElementById('form-message');
    if(!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { username: form.username.value, email: form.email.value, password1: form.password.value, password2: form.password2.value, tipo: form.tipo.value };
        if(data.password1 !== data.password2) { alert('Senhas não conferem'); return; }
        try {
            const res = await fetch(`${API_URL}/auth/registration/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if(!res.ok) throw new Error('Erro no registro');
            alert('Conta criada!'); window.location.href = 'login.html';
        } catch(err) { alert('Erro ao criar conta.'); }
    });
}

function setupHelpForm() {
    const form = document.getElementById('help-form');
    if(!form) return;
    const msgEl = document.getElementById('form-message');
    const token = localStorage.getItem('authToken');
    if(!token) { form.innerHTML = '<p>Faça login.</p>'; return; }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { tipo: form.tipo.value, descricao: form.descricao.value };
        try {
            const res = await fetch(`${API_URL}/ajuda/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                body: JSON.stringify(data)
            });
            if(!res.ok) throw new Error('Erro');
            form.reset(); msgEl.className='success'; msgEl.innerText='Enviado!'; msgEl.style.display='block';
        } catch(e) { msgEl.className='error'; msgEl.innerText='Erro.'; msgEl.style.display='block'; }
    });
}