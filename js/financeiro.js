// ====== FINANCEIRO - DESPESAS E RECEITAS ======
function openExpenseModal() {
    document.getElementById('exp-id').value = '';
    document.getElementById('exp-item').value = '';
    document.getElementById('exp-cost').value = '';
    document.getElementById('exp-date').value = getTodayDate();
    document.getElementById('exp-tipo').value = 'Material/Produto';
    document.getElementById('exp-fase').value = '';
    document.getElementById('exp-categoria').value = '';
    toggleEquipeSelect();
    document.getElementById('modal-expense').classList.remove('hidden');
}

function openRevenueModal() {
    document.getElementById('rev-desc').value = '';
    document.getElementById('rev-val').value = '';
    document.getElementById('rev-due').value = getTodayDate();
    document.getElementById('rev-fase').value = '';
    document.getElementById('modal-revenue').classList.remove('hidden');
}

function toggleEquipeSelect() {
    const tipo = document.getElementById('exp-tipo').value;
    const wrap = document.getElementById('exp-equipe-wrapper');
    if (tipo === 'Mão de Obra') {
        wrap.classList.remove('hidden');
        document.getElementById('exp-equipe').innerHTML = '<option value="">-- Selecione o membro (Opcional) --</option>' + STATE.equipe.map(e => `<option value="${e.nome}">${e.nome} (${e.categoria || 'Geral'})</option>`).join('');
    } else {
        wrap.classList.add('hidden');
        document.getElementById('exp-equipe').value = '';
    }
}

async function saveExpense() {
    const obra_id = document.getElementById('exp-obra').value || null;
    const desc = document.getElementById('exp-item').value;
    const val = parseFloat(document.getElementById('exp-cost').value);
    const dt = document.getElementById('exp-date').value || new Date().toISOString();
    const status = document.getElementById('exp-status-val').value;

    const tipoLancamento = document.getElementById('exp-tipo').value;
    const equipeNome = document.getElementById('exp-equipe').value;
    const faseObra = document.getElementById('exp-fase').value;
    const categoria = document.getElementById('exp-categoria').value;

    if (!desc || isNaN(val)) return showToast("Preencha descrição e valor!", true);
    showLoading(true);

    let obsArr = [];
    obsArr.push(`Tipo: ${tipoLancamento}`);
    if (tipoLancamento === 'Mão de Obra' && equipeNome) obsArr.push(`Equipe: ${equipeNome}`);

    const obsFinal = obsArr.join(' | ');

    const { error } = await sb.from('jsp_logs').insert([{
        id: getNextIdNum(STATE.logs).toString(),
        obra_id: obra_id ? parseInt(obra_id) : null,
        tipo: 'despesa',
        produto_nome: desc,
        valor_total: val,
        data: dt, vencimento: dt,
        status_financeiro: status,
        fase_obra: faseObra,
        categoria: categoria || 'Geral',
        observacao: obsFinal
    }]);

    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }

    document.getElementById('modal-expense').classList.add('hidden');
    showToast("Despesa Salva!");
    loadData();
}

async function saveRevenue() {
    const obra_id = document.getElementById('rev-obra').value || null;
    const desc = document.getElementById('rev-desc').value;
    const val = parseFloat(document.getElementById('rev-val').value);
    const dt = document.getElementById('rev-due').value || new Date().toISOString();
    const status = document.getElementById('rev-status-val').value;
    const faseObra = document.getElementById('rev-fase').value;

    if (!desc || isNaN(val)) return showToast("Preencha descrição e valor!", true);
    showLoading(true);

    const obsFinal = 'Medição de Receita';

    const { error } = await sb.from('jsp_logs').insert([{
        id: getNextIdNum(STATE.logs).toString(),
        obra_id: obra_id ? parseInt(obra_id) : null,
        tipo: 'receita',
        produto_nome: desc,
        valor_total: val,
        data: dt, vencimento: dt,
        status_financeiro: status,
        fase_obra: faseObra,
        observacao: obsFinal
    }]);

    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }

    document.getElementById('modal-revenue').classList.add('hidden');
    showToast("Medição Salva!");
    loadData();
}

function renderFinance() {
    const obraFilter = document.getElementById('fin-obra-filter').value;
    let logsFilt = STATE.logs.filter(l => l.tipo !== 'oc_pendente' && l.status_financeiro !== 'CANCELADO');

    let totDesp = 0;
    let totRec = 0;
    let valorContratoFiltrado = 0;

    if (obraFilter) {
        logsFilt = logsFilt.filter(l => String(l.obra_id) === String(obraFilter));
        const o = STATE.obras.find(x => x.id == obraFilter);
        if (o) valorContratoFiltrado = parseFloat(o.valor_contrato) || 0;
    }

    const listaDesp = document.getElementById('fin-expense-history-list');
    let despArrRaw = logsFilt.filter(l => l.tipo === 'compra' || l.tipo === 'despesa');

    let despArr = [];
    let groupedOCs = {};

    despArrRaw.forEach(l => {
        if (l.tipo === 'compra') {
            if (!groupedOCs[l.id]) {
                groupedOCs[l.id] = { ...l, valor_total: 0, is_oc: true, categorias_oc: new Set() };
                despArr.push(groupedOCs[l.id]);
            }
            groupedOCs[l.id].valor_total += parseFloat(l.valor_total);
            if (l.categoria) groupedOCs[l.id].categorias_oc.add(l.categoria);
        } else {
            despArr.push(l);
        }
    });

    const expSearch = document.getElementById('exp-search').value.toLowerCase();
    const expStatus = document.getElementById('exp-status').value;

    if (expSearch) despArr = despArr.filter(l => (l.produto_nome && l.produto_nome.toLowerCase().includes(expSearch)) || String(l.id).includes(expSearch) || (l.categoria && l.categoria.toLowerCase().includes(expSearch)));
    if (expStatus) despArr = despArr.filter(l => l.status_financeiro === expStatus);

    despArr.sort((a, b) => new Date(b.vencimento || b.data) - new Date(a.vencimento || a.data));

    listaDesp.innerHTML = despArr.map(l => {
        const isPago = l.status_financeiro === 'PAGO';
        if (isPago) totDesp += parseFloat(l.valor_total);

        const obra = STATE.obras.find(x => x.id == l.obra_id);
        const extraInfo = (!l.is_oc && l.observacao) ? `<div class="text-[9px] text-slate-500 font-bold uppercase mt-0.5">${l.observacao}</div>` : '';

        let strCategoria = l.is_oc ? (l.categorias_oc.size > 0 ? Array.from(l.categorias_oc).join(', ') : 'Várias Categorias') : (l.categoria || 'Geral');

        let btnAcoes = '';
        if (!isPago) {
            btnAcoes = l.is_oc ? `
                <button onclick="baixarLogOC('${l.id}')" class="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded shadow flex items-center gap-1 text-[10px] font-bold" title="Pagar O.C. Completa"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> BAIXAR O.C.</button>
                <button onclick="excluirLancamentoOC('${l.id}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded shadow" title="Cancelar Lançamento"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
            ` : `
                <button onclick="baixarLog('${l.uid}')" class="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded shadow flex items-center gap-1 text-[10px] font-bold" title="Baixar Despesa"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> BAIXAR</button>
                <button onclick="excluirLancamento('${l.uid}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded shadow" title="Cancelar Lançamento"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
            `;
        } else {
            btnAcoes = l.is_oc ? `
                <span class="text-[10px] font-bold text-green-700 bg-green-200 px-2 py-1 rounded">PAGO</span>
                <button onclick="estornarBaixaOC('${l.id}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded shadow" title="Estornar Baixa da O.C."><i data-lucide="rotate-ccw" class="w-3 h-3"></i></button>
            ` : `
                <span class="text-[10px] font-bold text-green-700 bg-green-200 px-2 py-1 rounded">PAGO</span>
                <button onclick="estornarBaixa('${l.uid}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded shadow" title="Estornar Baixa"><i data-lucide="rotate-ccw" class="w-3 h-3"></i></button>
            `;
        }

        return `<tr class="border-b ${isPago ? 'bg-green-50' : 'bg-red-50/20'} transition">
            <td class="p-3 text-xs font-bold text-slate-700">${formatDate(l.vencimento || l.data)}</td>
            <td class="p-3">
                <div class="font-bold text-slate-800 text-xs">${l.is_oc ? `O.C. #${l.id} - Compra Consolidada` : l.produto_nome}</div>
                <div class="text-[9px] text-purple-600 font-bold uppercase mt-1"><i data-lucide="tag" class="inline w-3 h-3"></i> ${strCategoria} | <i data-lucide="layers" class="inline w-3 h-3"></i> ${l.fase_obra || 'Geral'}</div>
                <div class="text-[10px] text-blue-700 font-bold mt-0.5"><i data-lucide="building" class="inline w-3 h-3"></i> ${obra?.nome || 'Geral'}</div>
                ${extraInfo}
                ${!isPago ? `<div class="text-[9px] text-slate-500 uppercase mt-0.5">Pagamento via: ${l.forma_pagamento || '-'}</div>` : ''}
            </td>
            <td class="p-3 font-bold text-sm ${isPago ? 'text-slate-500' : 'text-red-600'}">${formatMoney(l.valor_total)}</td>
            <td class="p-3 text-right flex items-center justify-end gap-1">
                ${btnAcoes}
            </td>
        </td>`;
    }).join('');

    const listaRec = document.getElementById('fin-receivables-list');
    let recArr = logsFilt.filter(l => l.tipo === 'receita');
    recArr.sort((a, b) => new Date(b.vencimento || b.data) - new Date(a.vencimento || a.data));

    listaRec.innerHTML = recArr.map(l => {
        const isPago = l.status_financeiro === 'PAGO';
        if (isPago) totRec += parseFloat(l.valor_total);

        const obra = STATE.obras.find(x => x.id == l.obra_id);
        const extraInfo = (l.observacao) ? `<div class="text-[9px] text-slate-500 font-bold uppercase mt-0.5">${l.observacao}</div>` : '';

        return `<tr class="border-b ${isPago ? 'bg-green-50' : 'bg-orange-50/20'} transition">
            <td class="p-3 text-xs font-bold text-slate-700">${formatDate(l.vencimento || l.data)}</td>
            <td class="p-3">
                <div class="font-bold text-slate-800 text-xs">${l.produto_nome}</div>
                ${l.fase_obra ? `<div class="text-[9px] text-purple-600 font-bold uppercase mt-1"><i data-lucide="layers" class="inline w-3 h-3"></i> ${l.fase_obra}</div>` : ''}
                <div class="text-[10px] text-blue-700 font-bold"><i data-lucide="building" class="inline w-3 h-3"></i> ${obra?.nome || 'Geral'}</div>
                ${extraInfo}
             </td>
            <td class="p-3 font-bold text-sm text-green-700">${formatMoney(l.valor_total)}</td>
            <td class="p-3 text-right flex items-center justify-end gap-1">
                ${!isPago ? `
                    <button onclick="baixarLog('${l.uid}')" class="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded shadow flex items-center gap-1 text-[10px] font-bold" title="Confirmar Recebimento"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> RECEBER</button>
                    <button onclick="excluirLancamento('${l.uid}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded shadow" title="Cancelar Lançamento"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
                ` : `
                    <span class="text-[10px] font-bold text-green-700 bg-green-200 px-2 py-1 rounded">RECEBIDO</span>
                    <button onclick="estornarBaixa('${l.uid}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded shadow" title="Estornar Baixa"><i data-lucide="rotate-ccw" class="w-3 h-3"></i></button>
                `}
             </td>
        </tr>`;
    }).join('');

    const cardsContainer = document.getElementById('fin-cards-container');
    if (obraFilter) {
        cardsContainer.innerHTML = `
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-slate-800 shadow-sm">
                <p class="text-slate-500 text-xs font-bold uppercase">Saldo Contrato</p>
                <h3 class="text-xl font-black text-slate-800 mt-1">${formatMoney(valorContratoFiltrado)}</h3>
            </div>
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-green-500 shadow-sm">
                <p class="text-slate-500 text-xs font-bold uppercase">Medições (Rec.)</p>
                <h3 class="text-xl font-black text-green-700 mt-1">${formatMoney(totRec)}</h3>
            </div>
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-orange-500 shadow-sm">
                <p class="text-slate-500 text-xs font-bold uppercase">A Receber</p>
                <h3 class="text-xl font-black text-orange-600 mt-1">${formatMoney(valorContratoFiltrado - totRec)}</h3>
            </div>
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm">
                <p class="text-slate-500 text-xs font-bold uppercase">Despesas (Pagas)</p>
                <h3 class="text-xl font-black text-red-600 mt-1">${formatMoney(totDesp)}</h3>
            </div>
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-blue-600 shadow-sm">
                <p class="text-slate-500 text-xs font-bold uppercase">Caixa da Obra</p>
                <h3 class="text-xl font-black text-blue-700 mt-1">${formatMoney(totRec - totDesp)}</h3>
            </div>
        `;
    } else {
        cardsContainer.innerHTML = `
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm md:col-span-1">
                <p class="text-slate-500 text-xs font-bold uppercase">Total de Custos GERAIS</p>
                <h3 class="text-2xl font-black text-red-600 mt-1">${formatMoney(totDesp)}</h3>
            </div>
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-green-500 shadow-sm md:col-span-1">
                <p class="text-slate-500 text-xs font-bold uppercase">Total Medições / Receitas GERAIS</p>
                <h3 class="text-2xl font-black text-green-700 mt-1">${formatMoney(totRec)}</h3>
            </div>
            <div class="bg-white p-4 rounded-xl border-l-4 border-l-blue-600 shadow-sm md:col-span-1">
                <p class="text-slate-500 text-xs font-bold uppercase">Saldo Geral de Caixa</p>
                <h3 class="text-2xl font-black text-blue-700 mt-1">${formatMoney(totRec - totDesp)}</h3>
            </div>
        `;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function baixarLog(uid) {
    if (!confirm("Confirmar a baixa financeira deste lançamento? O valor vai entrar no caixa.")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PAGO' }).eq('uid', uid);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("Baixa realizada! Valor computado.");
    loadData();
}

async function estornarBaixa(uid) {
    if (!confirm("Tem certeza que deseja ESTORNAR a baixa? O status voltará para PENDENTE e sairá do caixa/dashboard.")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PENDENTE' }).eq('uid', uid);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("Baixa estornada com sucesso!");
    loadData();
}

async function excluirLancamento(uid) {
    if (!confirm("Tem certeza que deseja CANCELAR este lançamento? Ele será removido definitivamente das pendências.")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'CANCELADO' }).eq('uid', uid);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("Lançamento Cancelado!");
    loadData();
}

async function baixarLogOC(id) {
    if (!confirm("Confirmar a baixa financeira desta O.C.? Todos os itens vinculados serão marcados como pagos.")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PAGO' }).eq('id', id).eq('tipo', 'compra');
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("O.C. Paga com sucesso!");
    loadData();
}

async function estornarBaixaOC(id) {
    if (!confirm("Tem certeza que deseja ESTORNAR a baixa de toda esta O.C.?")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PENDENTE' }).eq('id', id).eq('tipo', 'compra');
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("Baixa da O.C. estornada!");
    loadData();
}

async function excluirLancamentoOC(id) {
    if (!confirm("Deseja CANCELAR esta O.C. no Financeiro? Ela será removida das pendências.")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'CANCELADO' }).eq('id', id).eq('tipo', 'compra');
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("O.C. Cancelada no Financeiro!");
    loadData();
}