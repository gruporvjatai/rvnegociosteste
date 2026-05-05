// ============================================================
// ABA: FINANCEIRO OBRAS (view-fin)
// ============================================================

let finModalsCreated = false;

function createFinModals() {
  if (finModalsCreated) return;
  const modalHTML = `
    <!-- Modal de Despesa -->
    <div id="modal-expense" class="hidden fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div class="p-5 border-b flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2"><i data-lucide="minus-circle" class="text-red-500"></i> Lançar Despesa / Custo</h3>
          <button onclick="document.getElementById('modal-expense').classList.add('hidden')" class="text-slate-400 hover:text-red-500"><i data-lucide="x"></i></button>
        </div>
        <div class="p-6 space-y-4 overflow-y-auto">
          <input type="hidden" id="exp-id">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Obra (Centro de Custo)</label>
            <select id="exp-obra" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-bold text-slate-700"></select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Fase da Obra</label>
            <select id="exp-fase" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-bold text-slate-700">
              <option value="">-- Não especificada --</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
            <input type="text" id="exp-categoria" placeholder="Ex: Ferragem, Hidráulica, Acabamento" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-medium">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Tipo de Lançamento</label>
            <select id="exp-tipo" onchange="toggleEquipeSelect()" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-bold text-slate-700">
              <option value="Material/Produto">Material / Produto</option>
              <option value="Mão de Obra">Mão de Obra</option>
              <option value="Escritório">Escritório</option>
              <option value="Despesa Eventual">Despesa Eventual</option>
            </select>
          </div>
          <div id="exp-equipe-wrapper" class="hidden">
            <label class="block text-sm font-bold text-slate-700 mb-1">Membro da Equipe</label>
            <select id="exp-equipe" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-bold text-blue-700"></select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Descrição da Despesa</label>
            <input type="text" id="exp-item" placeholder="Ex: Combustível, Taxa, Adiantamento..." class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Valor Total (R$)</label>
            <input type="number" step="0.01" id="exp-cost" placeholder="0.00" class="w-full p-3 border rounded-xl font-bold text-red-600 focus:ring-2 focus:ring-blue-600 outline-none">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Data (Vencimento/Pagamento)</label>
            <input type="date" id="exp-date" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Status</label>
            <select id="exp-status-val" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold">
              <option value="PENDENTE">Pendente a Pagar</option>
              <option value="PAGO">Já Pago</option>
            </select>
          </div>
        </div>
        <div class="p-5 border-t bg-slate-50 flex gap-3">
          <button onclick="document.getElementById('modal-expense').classList.add('hidden')" class="flex-1 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button onclick="saveExpense()" class="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 shadow-lg">Salvar Despesa</button>
        </div>
      </div>
    </div>
    <!-- Modal de Receita -->
    <div id="modal-revenue" class="hidden fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div class="p-5 border-b flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2"><i data-lucide="plus-circle" class="text-green-600"></i> Lançar Medição (Receita)</h3>
          <button onclick="document.getElementById('modal-revenue').classList.add('hidden')" class="text-slate-400 hover:text-red-500"><i data-lucide="x"></i></button>
        </div>
        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Obra (Destino da Medição)</label>
            <select id="rev-obra" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-bold text-slate-700"></select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Fase da Obra</label>
            <select id="rev-fase" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white font-bold text-slate-700">
              <option value="">-- Não especificada --</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Descrição da Medição</label>
            <input type="text" id="rev-desc" placeholder="Ex: Medição 01 - Aporte Prefeitura..." class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Valor Recebido (R$)</label>
            <input type="number" step="0.01" id="rev-val" placeholder="0.00" class="w-full p-3 border rounded-xl font-bold text-green-700 focus:ring-2 focus:ring-blue-600 outline-none">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Data de Recebimento</label>
            <input type="date" id="rev-due" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Status</label>
            <select id="rev-status-val" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold">
              <option value="PENDENTE">A Receber (Previsão)</option>
              <option value="PAGO">Recebido / Em Caixa</option>
            </select>
          </div>
        </div>
        <div class="p-5 border-t bg-slate-50 flex gap-3">
          <button onclick="document.getElementById('modal-revenue').classList.add('hidden')" class="flex-1 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button onclick="saveRevenue()" class="flex-1 py-3 bg-green-600 rounded-xl font-bold text-white hover:bg-green-700 shadow-lg">Salvar Medição</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  finModalsCreated = true;
}

function renderViewFin() {
  const container = document.getElementById('view-fin');
  if (container.dataset.rendered === 'true') {
    updateSelects();
    renderFinance();
    return;
  }

  const viewHTML = `
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h2 class="text-2xl font-bold text-slate-800">Financeiro das Obras</h2>
      <div class="w-full md:w-1/3">
        <label class="text-xs font-bold text-slate-500 uppercase">Filtrar por Obra</label>
        <select id="fin-obra-filter" onchange="renderFinance()" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold text-blue-700 shadow-sm focus:border-blue-600 outline-none">
          <option value="">Todas as Obras / Geral</option>
        </select>
      </div>
    </div>
    <div id="fin-cards-container" class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6"></div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border shadow-sm flex flex-col h-[650px]">
        <div class="p-4 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
          <h3 class="font-bold text-slate-700 flex items-center gap-2"><i data-lucide="arrow-up-circle" class="w-5 h-5 text-red-500"></i> Custos / Pagamentos</h3>
          <button onclick="openExpenseModal()" class="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1"><i data-lucide="plus" class="w-4 h-4"></i> Lançar Despesa</button>
        </div>
        <div class="p-3 border-b bg-white flex flex-col gap-2">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <i data-lucide="search" class="absolute left-2 top-2 text-slate-400 w-4 h-4"></i>
              <input type="text" id="exp-search" placeholder="Buscar..." class="w-full pl-8 p-1.5 border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" onkeyup="renderFinance()">
            </div>
            <select id="exp-status" class="w-32 p-1.5 border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" onchange="renderFinance()">
              <option value="">Todos</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="PAGO">Pagos</option>
            </select>
          </div>
        </div>
        <div class="overflow-y-auto flex-1 p-0">
          <table class="w-full text-sm text-left">
            <thead class="text-slate-500 bg-slate-100 sticky top-0 border-b z-10">
              <tr>
                <th class="p-3 font-semibold">Venc/Data</th>
                <th class="p-3 font-semibold">Descrição / Categoria / Obra</th>
                <th class="p-3 font-semibold">Valor</th>
                <th class="p-3 font-semibold text-right w-28">Ações</th>
              </tr>
            </thead>
            <tbody id="fin-expense-history-list" class="divide-y"></tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-xl border shadow-sm flex flex-col h-[650px]">
        <div class="p-4 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
          <h3 class="font-bold text-slate-700 flex items-center gap-2"><i data-lucide="arrow-down-circle" class="w-5 h-5 text-green-600"></i> Medições (Receitas)</h3>
          <button onclick="openRevenueModal()" class="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1"><i data-lucide="plus" class="w-4 h-4"></i> Lançar Medição</button>
        </div>
        <div class="overflow-y-auto flex-1 p-0">
          <table class="w-full text-sm text-left">
            <thead class="text-slate-500 bg-slate-100 sticky top-0 border-b z-10">
              <tr>
                <th class="p-3 font-semibold">Venc/Data</th>
                <th class="p-3 font-semibold">Descrição / Origem</th>
                <th class="p-3 font-semibold">Valor</th>
                <th class="p-3 font-semibold text-right w-28">Ações</th>
              </tr>
            </thead>
            <tbody id="fin-receivables-list" class="divide-y"></tbody>
          </table>
        </div>
      </div>
    </div>`;

  container.innerHTML = viewHTML;
  container.dataset.rendered = 'true';
  updateSelects();
  renderFinance();
  lucide.createIcons();
}

// -------------------- Funções Financeiras --------------------

function renderFinance() {
  const obraFilter = document.getElementById('fin-obra-filter').value;
  let logsFilt = STATE.logs.filter(l => l.tipo !== 'oc_pendente' && l.status_financeiro !== 'CANCELADO');
  let totDesp = 0; let totRec = 0;
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
        <button onclick="baixarLogOC('${l.id}')" class="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded shadow flex items-center gap-1 text-[10px] font-bold" title="Pagar O.C. Completa"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> BAIXAR</button>
        <button onclick="excluirLancamentoOC('${l.id}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded shadow" title="Cancelar Lançamento"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
      ` : `
        <button onclick="baixarLog('${l.uid}')" class="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded shadow flex items-center gap-1 text-[10px] font-bold" title="Baixar Despesa"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> BAIXAR</button>
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
      <td class="p-3 text-right flex items-center justify-end gap-1">${btnAcoes}</td>
    </tr>`;
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
      </div>`;
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
      </div>`;
  }
  lucide.createIcons();
}

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
    data: dt,
    vencimento: dt,
    status_financeiro: status,
    fase_obra: faseObra,
    categoria: categoria || 'Geral',
    observacao: obsFinal
  }]);

  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }

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
    data: dt,
    vencimento: dt,
    status_financeiro: status,
    fase_obra: faseObra,
    observacao: obsFinal
  }]);

  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }

  document.getElementById('modal-revenue').classList.add('hidden');
  showToast("Medição Salva!");
  loadData();
}

async function baixarLog(uid) {
  if (!confirm("Confirmar a baixa financeira deste lançamento? O valor vai entrar no caixa.")) return;
  showLoading(true);
  const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PAGO' }).eq('uid', uid);
  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  showToast("Baixa realizada! Valor computado.");
  loadData();
}

async function estornarBaixa(uid) {
  if (!confirm("Tem certeza que deseja ESTORNAR a baixa? O status voltará para PENDENTE e sairá do caixa/dashboard.")) return;
  showLoading(true);
  const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PENDENTE' }).eq('uid', uid);
  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  showToast("Baixa estornada com sucesso!");
  loadData();
}

async function excluirLancamento(uid) {
  if (!confirm("Tem certeza que deseja CANCELAR este lançamento? Ele será removido definitivamente das pendências.")) return;
  showLoading(true);
  const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'CANCELADO' }).eq('uid', uid);
  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  showToast("Lançamento Cancelado!");
  loadData();
}

async function baixarLogOC(id) {
  if (!confirm("Confirmar a baixa financeira desta O.C.? Todos os itens vinculados serão marcados como pagos.")) return;
  showLoading(true);
  const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PAGO' }).eq('id', id).eq('tipo', 'compra');
  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  showToast("O.C. Paga com sucesso!");
  loadData();
}

async function estornarBaixaOC(id) {
  if (!confirm("Tem certeza que deseja ESTORNAR a baixa de toda esta O.C.?")) return;
  showLoading(true);
  const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'PENDENTE' }).eq('id', id).eq('tipo', 'compra');
  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  showToast("Baixa da O.C. estornada!");
  loadData();
}

async function excluirLancamentoOC(id) {
  if (!confirm("Deseja CANCELAR esta O.C. no Financeiro? Ela será removida das pendências.")) return;
  showLoading(true);
  const { error } = await sb.from('jsp_logs').update({ status_financeiro: 'CANCELADO' }).eq('id', id).eq('tipo', 'compra');
  if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  showToast("O.C. Cancelada no Financeiro!");
  loadData();
}
