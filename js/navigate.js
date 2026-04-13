// =============================================
//   RV NEGÓCIOS - js/navigate.js
//   Roteamento entre views + Atualização de Selects
// =============================================

function navigate(viewId) {
    // Esconde todas as views
    document.querySelectorAll('div[id^="view-"]').forEach(el => {
        el.classList.add('hidden-section');
        el.classList.remove('active-section');
    });

    // Mostra a view alvo
    const target = document.getElementById('view-' + viewId);
    if (target) {
        target.classList.remove('hidden-section');
        target.classList.add('active-section');
    }

    // Atualiza botões do menu
    document.querySelectorAll('.nav-btn').forEach(btn =>
        btn.classList.remove('bg-blue-800', 'text-white', 'shadow-lg')
    );
    const activeBtn = document.getElementById('nav-' + viewId);
    if (activeBtn) activeBtn.classList.add('bg-blue-800', 'text-white', 'shadow-lg');

    // Chama o render correto para cada view
    if (viewId === 'dash')         renderDashboard();
    if (viewId === 'pos')          updateSelects();
    if (viewId === 'oc')           renderOCList();
    if (viewId === 'fin')          { updateSelects(); renderFinance(); }
    if (viewId === 'equipe')       renderEquipe();
    if (viewId === 'fornecedores') renderFornecedores();
    if (viewId === 'prod')         renderProducts();
    if (viewId === 'fases')        renderFases();
    if (viewId === 'reports')      updateSelects();
    if (viewId === 'users')        renderUsers();
    if (viewId === 'terc')         { updateSelects(); renderTerceirizados(); }

    lucide.createIcons();
}

// ====== ATUALIZAÇÃO DOS SELECTS GLOBAIS ======
function updateSelects() {
    // --- Selects de Obras ---
    const selectsObra = [
        'pos-obra', 'fin-obra-filter', 'exp-obra',
        'rev-obra', 'rep-obra', 'eqp-obra', 'eqp-obra-filter'
    ];
    const htmlObras = '<option value="">-- Selecione uma Obra --</option>' +
        STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');

    selectsObra.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const currentVal = el.value;
        if (['fin-obra-filter', 'rep-obra', 'eqp-obra-filter'].includes(id)) {
            el.innerHTML = '<option value="">Todas as Obras / Geral</option>' +
                STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');
        } else {
            el.innerHTML = htmlObras;
        }
        if (currentVal) el.value = currentVal;
    });

    // --- Selects de Fases ---
    const selectsFase = ['pos-fase', 'exp-fase', 'rev-fase', 'rep-fase'];
    const htmlFasesOpcoes = STATE.fases
        .map(f => `<option value="${f.ordem} - ${f.nome}">${f.ordem} - ${f.nome}</option>`)
        .join('');

    selectsFase.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const currentVal = el.value;
        if (id === 'rep-fase') {
            el.innerHTML = '<option value="">Todas as Fases</option>' + htmlFasesOpcoes;
        } else {
            el.innerHTML = '<option value="">-- Não especificada --</option>' + htmlFasesOpcoes;
        }
        if (currentVal) el.value = currentVal;
    });

    // --- Select de Obras para Terceirizados ---
    updateSelectTercObra();
}
