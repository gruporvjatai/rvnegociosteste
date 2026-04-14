// ====== AUTENTICAÇÃO E NAVEGAÇÃO ======
function verificarSessao() {
    const userSessao = localStorage.getItem('rv_user');
    if (!userSessao) window.location.replace('login.html');
    else dadosUsuario = JSON.parse(userSessao);
}

function fazerLogout() {
    localStorage.removeItem('rv_user');
    window.location.replace('login.html');
}

function navigate(viewId) {
    document.querySelectorAll('div[id^="view-"]').forEach(el => {
        el.classList.add('hidden-section');
        el.classList.remove('active-section');
    });
    const target = document.getElementById('view-' + viewId);
    if (target) {
        target.classList.remove('hidden-section');
        target.classList.add('active-section');
    }
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-blue-800', 'text-white', 'shadow-lg'));
    const activeBtn = document.getElementById('nav-' + viewId);
    if (activeBtn) activeBtn.classList.add('bg-blue-800', 'text-white', 'shadow-lg');

    // Carregar dados específicos da view
    if (viewId === 'dash') renderDashboard();
    if (viewId === 'pos') { if (typeof updateSelects === 'function') updateSelects(); }
    if (viewId === 'oc') renderOCList();
    if (viewId === 'fin') { if (typeof updateSelects === 'function') updateSelects(); renderFinance(); }
    if (viewId === 'equipe') renderEquipe();
    if (viewId === 'fornecedores') renderFornecedores();
    if (viewId === 'prod') renderProducts();
    if (viewId === 'fases') renderFases();
    if (viewId === 'reports') { if (typeof updateSelects === 'function') updateSelects(); }
    if (viewId === 'users') renderUsers();
    if (viewId === 'terc') { if (typeof updateSelects === 'function') updateSelects(); renderTerceirizados(); }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
