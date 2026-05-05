// Conexão Supabase
const supabaseUrl = 'https://lyieiqhkspbowsrlngvn.supabase.co';
const supabaseKey = 'sb_publishable_B2a4vA22qf4XGcrxPDRAaw_13rW51uI';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

// Estado global
let dadosUsuario = null;
const userSessao = localStorage.getItem('rv_user');
if (!userSessao) window.location.replace('index.html');
else dadosUsuario = JSON.parse(userSessao);

let STATE = { obras: [], fornecedores: [], produtos: [], logs: [], users: [], equipe: [], fases: [], ponto: [], terceirizados: [], producao_terc: [], ponto_diario: [] };
let CART = [];
let CURRENT_OC_ID = null;

// Funções utilitárias
function formatMoney(val) { return parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function formatDate(d) { try { return d ? new Date(d).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'; } catch(e) { return '-'; } }
function showLoading(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; }
function showToast(msg, isError) {
    const t=document.getElementById('toast');
    t.textContent=msg; t.className=`fixed top-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 ${isError?'bg-red-600':'bg-slate-800'}`;
    t.style.display='block'; setTimeout(()=>t.style.display='none',3000);
}
function getTodayDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getNextIdNum(array) {
    let max = 0;
    array.forEach(item => { const val = parseInt(item.id); if(!isNaN(val) && val > max) max = val; });
    return max + 1;
}
async function fetchAllRecords(table) {
    let allRecords = []; let from = 0; const step = 1000; let keepFetching = true;
    while (keepFetching) {
        const { data, error } = await sb.from(table).select('*').range(from, from + step - 1);
        if (error) throw error;
        if (data && data.length > 0) {
            allRecords.push(...data);
            if (data.length < step) keepFetching = false;
            else from += step;
        } else keepFetching = false;
    }
    return { data: allRecords };
}
async function loadData() {
    try {
        const [resObras, resForn, resProd, resLog, resEqp, resFases, resPonto, resTerc, resPontoDiario, resProdTerc] = await Promise.all([
            fetchAllRecords('jsp_obras'),
            fetchAllRecords('jsp_fornecedores'),
            fetchAllRecords('jsp_produtos'),
            fetchAllRecords('jsp_logs'),
            fetchAllRecords('jsp_equipe').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_fase').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_ponto').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_terceirizados').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_ponto_diario').catch(() => ({ data: [] })),
            fetchAllRecords('jsp_producao_terc').catch(() => ({ data: [] }))
        ]);

        STATE.obras = resObras.data || [];
        STATE.fornecedores = resForn.data || [];
        STATE.produtos = resProd.data || [];
        STATE.logs = resLog.data || [];
        STATE.equipe = resEqp.data || [];
        STATE.fases = (resFases.data || []).sort((a,b) => a.ordem - b.ordem);
        STATE.ponto = resPonto.data || [];
        STATE.terceirizados = resTerc.data || [];
        STATE.ponto_diario = resPontoDiario.data || [];
        STATE.producao_terc = resProdTerc.data || [];

        if (dadosUsuario.nivel === 'admin') {
            const navUsersBtn = document.getElementById('nav-users');
            if (navUsersBtn) navUsersBtn.classList.remove('hidden');
            const resUsers = await fetchAllRecords('jsp_usuarios');
            STATE.users = resUsers.data || [];
        }

        updateSelects();
        if(!document.querySelector('.active-section')) navigate('dash');
        else navigate(document.querySelector('.active-section').id.replace('view-',''));
        showLoading(false);
    } catch (err) {
        showLoading(false);
        showToast("Erro ao conectar no banco: " + err.message, true);
    }
}

function navigate(viewId) {
    document.querySelectorAll('div[id^="view-"]').forEach(el => { el.classList.add('hidden-section'); el.classList.remove('active-section'); });
    const target = document.getElementById('view-' + viewId);
    if(target) { target.classList.remove('hidden-section'); target.classList.add('active-section'); }
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-blue-800', 'text-white', 'shadow-lg'));
    const activeBtn = document.getElementById('nav-' + viewId);
    if(activeBtn) activeBtn.classList.add('bg-blue-800', 'text-white', 'shadow-lg');

    if(viewId === 'dash') renderDashboard();
    // Outras condições serão adicionadas conforme criarmos os arquivos das abas
    lucide.createIcons();
}

// Inicialização
window.onload = function() {
    const hoje = new Date();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoAtual = hoje.getFullYear();
    const primeiroDia = `${anoAtual}-${mesAtual}-01`;
    const ultimoDia = new Date(anoAtual, hoje.getMonth() + 1, 0).getDate();
    const ultimoDiaStr = `${anoAtual}-${mesAtual}-${String(ultimoDia).padStart(2, '0')}`;

    const eqpDataInicio = document.getElementById('eqp-filter-data-inicio');
    const eqpDataFim = document.getElementById('eqp-filter-data-fim');
    if(eqpDataInicio) eqpDataInicio.value = primeiroDia;
    if(eqpDataFim) eqpDataFim.value = ultimoDiaStr;

    if (dadosUsuario) { showLoading(true); loadData(); }
};

// updateSelects será necessário mais tarde, vou manter uma versão simplificada para já
function updateSelects() {
    // Preenche selects de obras
    const selectsObra = ['pos-obra', 'fin-obra-filter', 'exp-obra', 'rev-obra', 'rep-obra', 'eqp-obra', 'eqp-obra-filter'];
    const htmlObras = '<option value="">-- Selecione uma Obra --</option>' + STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');
    selectsObra.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const currentVal = el.value;
            if(id === 'fin-obra-filter' || id === 'rep-obra' || id === 'eqp-obra-filter') {
                el.innerHTML = '<option value="">Todas as Obras / Geral</option>' + STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');
            } else {
                el.innerHTML = htmlObras;
            }
            if(currentVal) el.value = currentVal;
        }
    });
    // Fases
    const selectsFase = ['pos-fase', 'exp-fase', 'rev-fase', 'rep-fase'];
    const htmlFasesOpcoes = STATE.fases.map(f => `<option value="${f.ordem} - ${f.nome}">${f.ordem} - ${f.nome}</option>`).join('');
    selectsFase.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            const currentVal = el.value;
            if(id === 'rep-fase') {
                el.innerHTML = '<option value="">Todas as Fases</option>' + htmlFasesOpcoes;
            } else {
                el.innerHTML = '<option value="">-- Não especificada --</option>' + htmlFasesOpcoes;
            }
            if(currentVal) el.value = currentVal;
        }
    });
}
