// ============================================================
// CONFIGURAÇÕES GLOBAIS E INICIALIZAÇÃO
// ============================================================

let dadosUsuario = null;
const userSessao = localStorage.getItem('rv_user');
if (!userSessao) window.location.replace('index.html');
else dadosUsuario = JSON.parse(userSessao);

const supabaseUrl = 'https://lyieiqhkspbowsrlngvn.supabase.co';
const supabaseKey = 'sb_publishable_B2a4vA22qf4XGcrxPDRAaw_13rW51uI';
const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

let STATE = { obras: [], fornecedores: [], produtos: [], logs: [], users: [], equipe: [], fases: [], ponto: [], terceirizados: [], producao_terc: [], ponto_diario: [] };
let CART = [];
let CURRENT_OC_ID = null;

// ===== UTILITÁRIOS =====
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
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

// ===== CARREGAMENTO DE DADOS =====
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

// ===== NAVEGAÇÃO =====
function navigate(viewId) {
    document.querySelectorAll('div[id^="view-"]').forEach(el => {
        el.classList.add('hidden-section');
        el.classList.remove('active-section');
    });
    const target = document.getElementById('view-' + viewId);
    if(target) {
        target.classList.remove('hidden-section');
        target.classList.add('active-section');
    }
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-blue-800', 'text-white', 'shadow-lg'));
    const activeBtn = document.getElementById('nav-' + viewId);
    if(activeBtn) activeBtn.classList.add('bg-blue-800', 'text-white', 'shadow-lg');

    if(viewId === 'dash') renderDashboard();
    if(viewId === 'oc') renderOCList();
    if(viewId === 'pos') { renderViewPos(); }
    if(viewId === 'fin') { renderViewFin(); }
    // outras abas serão adicionadas aqui conforme migração
    lucide.createIcons();
}

// ===== UPDATE SELECTS (OBRAS E FASES) =====
function updateSelects() {
    const obrasSelects = ['pos-obra', 'fin-obra-filter', 'exp-obra', 'rev-obra', 'rep-obra', 'eqp-obra', 'eqp-obra-filter'];
    const obrasHtml = '<option value="">-- Selecione uma Obra --</option>' + STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');

    obrasSelects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const currentVal = el.value;
            if(id === 'fin-obra-filter' || id === 'rep-obra' || id === 'eqp-obra-filter') {
                el.innerHTML = '<option value="">Todas as Obras / Geral</option>' + STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');
            } else {
                el.innerHTML = obrasHtml;
            }
            if(currentVal) el.value = currentVal;
        }
    });

    const fasesSelects = ['pos-fase', 'exp-fase', 'rev-fase', 'rep-fase'];
    const fasesHtml = STATE.fases.map(f => `<option value="${f.ordem} - ${f.nome}">${f.ordem} - ${f.nome}</option>`).join('');

    fasesSelects.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            const currentVal = el.value;
            if(id === 'rep-fase') {
                el.innerHTML = '<option value="">Todas as Fases</option>' + fasesHtml;
            } else {
                el.innerHTML = '<option value="">-- Não especificada --</option>' + fasesHtml;
            }
            if(currentVal) el.value = currentVal;
        }
    });
}

// ===== OBRA (MODAL COMPARTILHADO) =====
function openObraForm(id) {
    document.getElementById('obra-form-container').classList.remove('hidden');
    if(id) {
        const o = STATE.obras.find(x => x.id == id);
        document.getElementById('obra-id').value = o.id;
        document.getElementById('obra-name').value = o.nome;
        document.getElementById('obra-addr').value = o.endereco;
        document.getElementById('obra-solic').value = o.solicitante;
        document.getElementById('obra-contrato').value = o.valor_contrato || 0;
        document.getElementById('obra-termino').value = o.data_termino || '';
    } else {
        document.getElementById('obra-form-container').querySelector('form').reset();
        document.getElementById('obra-id').value = '';
        document.getElementById('obra-termino').value = '';
    }
}

async function saveObra(e) {
    e.preventDefault();
    showLoading(true);
    const isNew = !document.getElementById('obra-id').value;
    const payload = {
        nome: document.getElementById('obra-name').value,
        endereco: document.getElementById('obra-addr').value,
        solicitante: document.getElementById('obra-solic').value,
        valor_contrato: parseFloat(document.getElementById('obra-contrato').value) || 0,
        data_termino: document.getElementById('obra-termino').value
    };
    if(!isNew) payload.id = document.getElementById('obra-id').value;

    const { error } = await sb.from('jsp_obras').upsert(payload);
    if(error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    document.getElementById('obra-form-container').classList.add('hidden');
    showToast("Obra Salva!");
    loadData();
}

// ===== LOGOUT =====
function fazerLogout() {
    localStorage.removeItem('rv_user');
    window.location.replace('index.html');
}

// ===== INICIALIZAÇÃO =====
window.onload = function() {
    if (dadosUsuario) { showLoading(true); loadData(); }
};
