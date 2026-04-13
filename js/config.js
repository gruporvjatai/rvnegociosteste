// =============================================
//   RV NEGÓCIOS - js/config.js
//   Conexão Supabase, Estado Global e Utilitários
// =============================================

// ====== SESSÃO / AUTH ======
let dadosUsuario = null;
const userSessao = localStorage.getItem('rv_user');
if (!userSessao) window.location.replace('index.html');
else dadosUsuario = JSON.parse(userSessao);

// ====== CONEXÃO SUPABASE ======
const supabaseUrl = 'https://lyieiqhkspbowsrlngvn.supabase.co';
const supabaseKey = 'sb_publishable_B2a4vA22qf4XGcrxPDRAaw_13rW51uI';
const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

// ====== VARIÁVEIS DE ESTADO GLOBAL ======
let STATE = {
    obras: [],
    fornecedores: [],
    produtos: [],
    logs: [],
    users: [],
    equipe: [],
    fases: [],
    ponto: [],
    terceirizados: [],
    producao_terc: []
};

let CART = [];
let CURRENT_OC_ID = null;

// ====== UTILITÁRIOS GERAIS ======

function formatMoney(val) {
    return parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(d) {
    try { return d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'; }
    catch(e) { return '-'; }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showToast(msg, isError) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `fixed top-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 ${isError ? 'bg-red-600' : 'bg-slate-800'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

function getTodayDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getNextIdNum(array) {
    let max = 0;
    array.forEach(item => {
        const val = parseInt(item.id);
        if (!isNaN(val) && val > max) max = val;
    });
    return max + 1;
}

// ====== FETCH COM PAGINAÇÃO (>1000 registros) ======
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

// ====== CARREGAMENTO INICIAL DE DADOS ======
async function loadData() {
    try {
        const [
            resObras, resForn, resProd, resLog,
            resEqp, resFases, resPonto, resTerc, resProdTerc
        ] = await Promise.all([
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

        STATE.obras          = resObras.data    || [];
        STATE.fornecedores   = resForn.data     || [];
        STATE.produtos       = resProd.data     || [];
        STATE.logs           = resLog.data      || [];
        STATE.equipe         = resEqp.data      || [];
        STATE.fases          = (resFases.data   || []).sort((a, b) => a.ordem - b.ordem);
        STATE.ponto          = resPonto.data    || [];
        STATE.terceirizados  = resTerc.data     || [];
        STATE.producao_terc  = resProdTerc.data || [];

        if (dadosUsuario.nivel === 'admin') {
            const navUsersBtn = document.getElementById('nav-users');
            if (navUsersBtn) navUsersBtn.classList.remove('hidden');
            const resUsers = await fetchAllRecords('jsp_usuarios');
            STATE.users = resUsers.data || [];
        }

        updateSelects();

        if (!document.querySelector('.active-section')) {
            navigate('dash');
        } else {
            navigate(document.querySelector('.active-section').id.replace('view-', ''));
        }

        showLoading(false);
    } catch (err) {
        showLoading(false);
        showToast("Erro ao conectar no banco: " + err.message, true);
    }
}

// ====== LOGOUT ======
function fazerLogout() {
    localStorage.removeItem('rv_user');
    window.location.replace('index.html');
}

// ====== INICIALIZAÇÃO ======
window.onload = function () {
    const hoje = new Date();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoAtual = hoje.getFullYear();

    document.getElementById('eqp-filter-mes').value = mesAtual;
    document.getElementById('eqp-filter-ano').value = anoAtual;

    const fMesTerc = document.getElementById('terc-filter-mes');
    const fAnoTerc = document.getElementById('terc-filter-ano');
    if (fMesTerc) fMesTerc.value = mesAtual;
    if (fAnoTerc) fAnoTerc.value = anoAtual;

    if (dadosUsuario) { showLoading(true); loadData(); }
};
