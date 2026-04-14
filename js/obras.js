// ====== CRUD OBRAS E DASHBOARD ======
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

    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }

    document.getElementById('obra-form-container').classList.add('hidden');
    showToast("Obra Salva!");
    loadData();
}

function renderDashboard() {
    const grid = document.getElementById('dash-grid');
    const custosObras = {};
    const receitasObras = {};

    STATE.obras.forEach(o => {
        custosObras[o.id] = 0;
        receitasObras[o.id] = 0;
    });

    STATE.logs.forEach(l => {
        if (l.obra_id && l.status_financeiro === 'PAGO') {
            if (l.tipo === 'compra' || l.tipo === 'despesa') {
                custosObras[l.obra_id] += parseFloat(l.valor_total);
            }
            if (l.tipo === 'receita') {
                receitasObras[l.obra_id] += parseFloat(l.valor_total);
            }
        }
    });

    grid.innerHTML = STATE.obras.map(o => {
        const valorContrato = parseFloat(o.valor_contrato) || 0;
        const recebido = receitasObras[o.id] || 0;
        const gasto = custosObras[o.id] || 0;
        const saldoAReceber = valorContrato - recebido;
        const caixaAtual = recebido - gasto;
        const pctRecebido = valorContrato > 0 ? ((recebido / valorContrato) * 100).toFixed(1) : 0;

        return `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-blue-500 transition relative">
            <button onclick="openObraForm('${o.id}')" class="absolute top-4 right-4 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition" title="Editar Obra">
                <i data-lucide="edit-3" width="18"></i>
            </button>
            <h4 class="font-black text-lg text-slate-800 pr-10 truncate">${o.nome}</h4>
            <p class="text-[10px] text-slate-500 uppercase font-bold mt-1 mb-4 truncate"><i data-lucide="map-pin" class="inline w-3 h-3"></i> ${o.endereco || 'Endereço n. inf.'}</p>
            
            <div class="w-full bg-slate-100 rounded-full h-2 mb-1">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${Math.min(pctRecebido, 100)}%"></div>
            </div>
            <div class="text-[10px] font-bold text-slate-400 text-right mb-4">${pctRecebido}% Recebido</div>

            <div class="grid grid-cols-2 gap-4 mt-auto">
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Saldo Total (Contrato)</div>
                    <div class="font-black text-sm text-slate-800">${formatMoney(valorContrato)}</div>
                </div>
                <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                    <div class="text-[10px] font-bold text-green-600 uppercase">Medições Recebidas</div>
                    <div class="font-black text-sm text-green-700">${formatMoney(recebido)}</div>
                </div>
                <div class="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <div class="text-[10px] font-bold text-orange-600 uppercase">A Receber do Governo</div>
                    <div class="font-black text-sm text-orange-700">${formatMoney(saldoAReceber)}</div>
                </div>
                <div class="bg-red-50 p-3 rounded-lg border border-red-100">
                    <div class="text-[10px] font-bold text-red-600 uppercase">Custos e Despesas</div>
                    <div class="font-black text-sm text-red-700">${formatMoney(gasto)}</div>
                </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                <span class="text-xs font-bold text-slate-500 uppercase">Caixa Atual (Recebido - Gasto)</span>
                <span class="font-black text-2xl ${caixaAtual >= 0 ? 'text-blue-700' : 'text-red-600'}">${formatMoney(caixaAtual)}</span>
            </div>
        </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}