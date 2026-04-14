// ====== OPERAÇÕES COM SUPABASE ======
async function fetchAllRecords(table) {
    let allRecords = [];
    let from = 0;
    const step = 1000;
    let keepFetching = true;
    
    while (keepFetching) {
        const { data, error } = await sb.from(table).select('*').range(from, from + step - 1);
        if (error) throw error;
        if (data && data.length > 0) {
            allRecords.push(...data);
            if (data.length < step) keepFetching = false;
            else from += step;
        } else {
            keepFetching = false;
        }
    }
    return { data: allRecords };
}

async function loadData() {
    try {
        const [resObras, resForn, resProd, resLog, resEqp, resFases, resPonto, resTerc, resProdTerc] = await Promise.all([
            fetchAllRecords('jsp_obras'),
            fetchAllRecords('jsp_fornecedores'),
            fetchAllRecords('jsp_produtos'),
            fetchAllRecords('jsp_logs'),
            fetchAllRecords('jsp_equipe').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_fase').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_ponto').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_terceirizados').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_producao_terc').catch(() => ({ data: [] }))
        ]);

        STATE.obras = resObras.data || [];
        STATE.fornecedores = resForn.data || [];
        STATE.produtos = resProd.data || [];
        STATE.logs = resLog.data || [];
        STATE.equipe = resEqp.data || [];
        STATE.fases = (resFases.data || []).sort((a, b) => a.ordem - b.ordem);
        STATE.ponto = resPonto.data || [];
        STATE.terceirizados = resTerc.data || [];
        STATE.producao_terc = resProdTerc.data || [];

        if (dadosUsuario && dadosUsuario.nivel === 'admin') {
            const navUsersBtn = document.getElementById('nav-users');
            if (navUsersBtn) navUsersBtn.classList.remove('hidden');
            const resUsers = await fetchAllRecords('jsp_usuarios');
            STATE.users = resUsers.data || [];
        }

        updateSelects();
        if (!document.querySelector('.active-section')) navigate('dash');
        else navigate(document.querySelector('.active-section').id.replace('view-', ''));
        
        showLoading(false);
    } catch (err) {
        showLoading(false);
        showToast("Erro ao conectar no banco: " + err.message, true);
    }
}

function updateSelects() {
    // Selects de Obras
    const selectsObra = ['pos-obra', 'fin-obra-filter', 'exp-obra', 'rev-obra', 'rep-obra', 'eqp-obra', 'eqp-obra-filter', 'terc-obra'];
    const htmlObras = '<option value="">-- Selecione uma Obra --</option>' + STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');

    selectsObra.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const currentVal = el.value;
            if (id === 'fin-obra-filter' || id === 'rep-obra' || id === 'eqp-obra-filter') {
                el.innerHTML = '<option value="">Todas as Obras / Geral</option>' + STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');
            } else {
                el.innerHTML = htmlObras;
            }
            if (currentVal) el.value = currentVal;
        }
    });

    // Selects de Fases
    const selectsFase = ['pos-fase', 'exp-fase', 'rev-fase', 'rep-fase'];
    const htmlFasesOpcoes = STATE.fases.map(f => `<option value="${f.ordem} - ${f.nome}">${f.ordem} - ${f.nome}</option>`).join('');

    selectsFase.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const currentVal = el.value;
            if (id === 'rep-fase') {
                el.innerHTML = '<option value="">Todas as Fases</option>' + htmlFasesOpcoes;
            } else {
                el.innerHTML = '<option value="">-- Não especificada --</option>' + htmlFasesOpcoes;
            }
            if (currentVal) el.value = currentVal;
        }
    });
}