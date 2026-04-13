// ====== OBRAS ======

function renderDashboard() {
    const grid = document.getElementById('dash-grid');
    if (!grid) return;

    grid.innerHTML = STATE.obras.map(obra => {
        const logsObra = STATE.logs.filter(l => l.obra_id == obra.id);
        const compras = logsObra.filter(l => l.tipo === 'compra' && l.status_financeiro === 'PAGO');
        const despesas = logsObra.filter(l => l.tipo === 'despesa' && l.status_financeiro === 'PAGO');
        const receitas = logsObra.filter(l => l.tipo === 'receita' && l.status_financeiro === 'PAGO');
        const pendentesOC = logsObra.filter(l => l.tipo === 'oc_pendente');
        const pendentesFin = logsObra.filter(l => (l.tipo === 'compra' || l.tipo === 'despesa') && l.status_financeiro === 'PENDENTE');

        const totalGasto = [...compras, ...despesas].reduce((s, l) => s + parseFloat(l.valor_total || 0), 0);
        const totalRecebido = receitas.reduce((s, l) => s + parseFloat(l.valor_total || 0), 0);
        const totalPendente = pendentesFin.reduce((s, l) => s + parseFloat(l.valor_total || 0), 0);
        const totalOCPendente = [...new Set(pendentesOC.map(l => l.id))].length;
        const caixa = totalRecebido - totalGasto;
        const contrato = parseFloat(obra.valor_contrato || 0);
        const aReceber = contrato - totalRecebido;
        const percGasto = contrato > 0 ? Math.min((totalGasto / contrato) * 100, 100) : 0;

        // Data de Término
        let alertaTermino = '';
        if (obra.data_termino) {
            const hoje = new Date();
            const termino = new Date(obra.data_termino);
            const diffDias = Math.ceil((termino - hoje) / (1000 * 60 * 60 * 24));
            if (diffDias < 0) {
                alertaTermino = `<span class="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">VENCIDA há ${Math.abs(diffDias)} dias</span>`;
            } else if (diffDias <= 30) {
                alertaTermino = `<span class="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Vence em ${diffDias} dias</span>`;
            }
        }

        return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-900">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-white font-black text-base leading-snug">${obra.nome}</h3>
                        <div class="text-slate-400 text-[10px] mt-1">${obra.endereco || 'Sem endereço'}</div>
                        <div class="text-slate-400 text-[10px]">${obra.solicitante || ''}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-[10px] text-slate-400 uppercase">Contrato</div>
                        <div class="text-white font-black text-sm">${formatMoney(contrato)}</div>
                        ${obra.data_termino ? `<div class="text-[10px] text-slate-400 mt-1">Término: ${formatDate(obra.data_termino)}</div>` : ''}
                        ${alertaTermino}
                    </div>
                </div>
            </div>

            <div class="p-4">
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="bg-green-50 rounded-lg p-3 border border-green-100">
                        <div class="text-[9px] font-bold text-green-600 uppercase">Medições Recebidas</div>
                        <div class="font-black text-green-700 text-sm mt-0.5">${formatMoney(totalRecebido)}</div>
                    </div>
                    <div class="bg-red-50 rounded-lg p-3 border border-red-100">
                        <div class="text-[9px] font-bold text-red-600 uppercase">Total Gasto</div>
                        <div class="font-black text-red-700 text-sm mt-0.5">${formatMoney(totalGasto)}</div>
                    </div>
                    <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div class="text-[9px] font-bold text-blue-600 uppercase">Caixa</div>
                        <div class="font-black text-blue-700 text-sm mt-0.5 ${caixa < 0 ? 'text-red-700' : ''}">${formatMoney(caixa)}</div>
                    </div>
                </div>

                <div class="mb-3">
                    <div class="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Gastos vs Contrato</span>
                        <span>${percGasto.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2">
                        <div class="h-2 rounded-full ${percGasto > 90 ? 'bg-red-500' : percGasto > 70 ? 'bg-yellow-500' : 'bg-blue-600'}" style="width: ${percGasto}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-[10px] text-slate-500 mb-3">
                    <span>A Receber: <strong class="text-slate-700">${formatMoney(aReceber)}</strong></span>
                    ${totalPendente > 0 ? `<span class="text-orange-600 font-bold">⚠ Pendente: ${formatMoney(totalPendente)}</span>` : ''}
                    ${totalOCPendente > 0 ? `<span class="text-orange-500 font-bold">${totalOCPendente} O.C.(s) abertas</span>` : ''}
                </div>

                <div class="flex gap-2">
                    <button onclick="openObraForm('${obra.id}')" class="flex-1 text-xs border border-slate-300 text-slate-600 hover:bg-slate-50 py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Editar
                    </button>
                    <button onclick="navigate('fin'); document.getElementById('fin-obra-filter').value='${obra.id}'; renderFinance();" class="flex-1 text-xs bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                        <i data-lucide="bar-chart-3" class="w-3.5 h-3.5"></i> Financeiro
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    if (!STATE.obras.length) {
        grid.innerHTML = `<div class="col-span-2 flex flex-col items-center justify-center py-20 text-slate-400">
            <i data-lucide="building-2" class="w-16 h-16 mb-4 opacity-30"></i>
            <p class="font-bold">Nenhuma obra cadastrada.</p>
            <p class="text-sm">Clique em "Nova Obra" para começar.</p>
        </div>`;
    }

    lucide.createIcons();
}

function openObraForm(id) {
    document.getElementById('obra-form-container').classList.remove('hidden');
    if (id) {
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
    const inputData = document.getElementById('obra-termino');
    const valorData = inputData ? inputData.value : null;

    const payload = {
        nome: document.getElementById('obra-name').value,
        endereco: document.getElementById('obra-addr').value,
        solicitante: document.getElementById('obra-solic').value,
        valor_contrato: parseFloat(document.getElementById('obra-contrato').value) || 0,
        data_termino: valorData
    };
    if (!isNew) payload.id = document.getElementById('obra-id').value;

    const { error } = await sb.from('jsp_obras').upsert(payload);
    if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    document.getElementById('obra-form-container').classList.add('hidden');
    showToast("Obra Salva!");
    loadData();
}
