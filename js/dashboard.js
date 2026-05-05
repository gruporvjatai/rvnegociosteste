// Modal de obra (HTML)
function createObraModal() {
    const existing = document.getElementById('obra-modal');
    if (existing) return existing;
    const modal = document.createElement('div');
    modal.id = 'obra-modal';
    modal.className = 'hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <form onsubmit="saveObra(event)" class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 class="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2"><i data-lucide="building"></i> Dados da Obra</h3>
            <input type="hidden" id="obra-id">
            <div class="space-y-3">
                <div><label class="block text-xs font-bold text-slate-500 uppercase">Nome / Identificação da Obra</label><input type="text" id="obra-name" required class="w-full p-2 border rounded outline-none focus:border-blue-600"></div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase">Valor do Contrato (Saldo da Obra R$)</label>
                    <input type="number" step="0.01" id="obra-contrato" required placeholder="Ex: 1000000.00" class="w-full p-2 border rounded outline-none focus:border-blue-600 font-bold text-blue-700 bg-blue-50">
                    <p class="text-[10px] text-slate-400 mt-1">Este valor serve como teto para as medições e caixa.</p>
                </div>
                <div><label class="block text-xs font-bold text-slate-500 uppercase">Endereço / Localização</label><input type="text" id="obra-addr" class="w-full p-2 border rounded outline-none focus:border-blue-600"></div>
                <div><label class="block text-xs font-bold text-slate-500 uppercase">Órgão / Solicitante / Prefeitura</label><input type="text" id="obra-solic" class="w-full p-2 border rounded outline-none focus:border-blue-600"></div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase">Previsão de Término (Contrato)</label>
                    <input type="date" id="obra-termino" required class="w-full p-2 border rounded outline-none focus:border-blue-600 font-bold text-slate-700">
                </div>
            </div>
            <div class="flex gap-2 mt-6">
                <button type="button" onclick="closeObraModal()" class="flex-1 p-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300">Cancelar</button>
                <button type="submit" class="flex-1 p-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 shadow-md">Salvar</button>
            </div>
        </form>
    `;
    document.body.appendChild(modal);
    return modal;
}

function openObraForm(id) {
    const modal = createObraModal();
    modal.classList.remove('hidden');
    if(id) {
        const o = STATE.obras.find(x => x.id == id);
        if(o) {
            document.getElementById('obra-id').value = o.id;
            document.getElementById('obra-name').value = o.nome;
            document.getElementById('obra-addr').value = o.endereco || '';
            document.getElementById('obra-solic').value = o.solicitante || '';
            document.getElementById('obra-contrato').value = o.valor_contrato || 0;
            document.getElementById('obra-termino').value = o.data_termino || '';
        }
    } else {
        document.getElementById('obra-id').value = '';
        document.getElementById('obra-name').value = '';
        document.getElementById('obra-addr').value = '';
        document.getElementById('obra-solic').value = '';
        document.getElementById('obra-contrato').value = '';
        document.getElementById('obra-termino').value = '';
    }
    lucide.createIcons();
}

function closeObraModal() {
    document.getElementById('obra-modal').classList.add('hidden');
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
        data_termino: document.getElementById('obra-termino').value || null
    };
    if(!isNew) payload.id = document.getElementById('obra-id').value;

    const { error } = await sb.from('jsp_obras').upsert(payload);
    if(error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    closeObraModal();
    showToast("Obra Salva!");
    await loadData(); // recarrega STATE e atualiza dashboard
}

// Renderização do Dashboard
function renderDashboard() {
    const grid = document.getElementById('dash-grid');
    if (!grid) return;
    const custosObras = {};
    const receitasObras = {};
    STATE.obras.forEach(o => { custosObras[o.id] = 0; receitasObras[o.id] = 0; });

    STATE.logs.forEach(l => {
        if(l.obra_id && l.status_financeiro === 'PAGO') {
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
    `}).join('');
    lucide.createIcons();
}
