// ============================================================
// ABA: PRODUTOS (view-prod)
// ============================================================

let prodModalsCreated = false;

function createProdModals() {
  if (prodModalsCreated) return;
  const modalHTML = `
    <!-- Modal de Cadastro/Edição de Material -->
    <div id="prod-form-container" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <form onsubmit="saveProduct(event)" class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 class="font-bold text-lg mb-4">Material / Insumo</h3>
        <input type="hidden" id="prd-id">
        <div class="space-y-3">
          <input type="text" id="prd-name" required placeholder="Nome do Material (Ex: Cimento, Prego)" class="w-full p-2 border rounded">
          <input type="text" id="prd-cat" placeholder="Categoria (Ex: Alvenaria, Hidráulica)" class="w-full p-2 border rounded">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase">Preço Referência (R$)</label>
            <input type="number" id="prd-price" required step="0.01" placeholder="Ex: 35.00" class="w-full p-2 border rounded">
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button type="button" onclick="document.getElementById('prod-form-container').classList.add('hidden')" class="flex-1 p-2 bg-slate-200 rounded font-bold hover:bg-slate-300">Cancelar</button>
          <button type="submit" class="flex-1 p-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-800">Salvar</button>
        </div>
      </form>
    </div>

    <!-- Modal de Histórico de Preços -->
    <div id="modal-prod-history" class="hidden fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
            <i data-lucide="history" class="text-indigo-600"></i> Histórico: <span id="hist-prod-name" class="text-indigo-700"></span>
          </h3>
          <button onclick="document.getElementById('modal-prod-history').classList.add('hidden')" class="text-slate-400 hover:text-red-500"><i data-lucide="x"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto p-0 bg-white">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-100 text-slate-700 sticky top-0 border-b shadow-sm z-10">
              <tr>
                <th class="p-3 font-semibold">Data da Compra</th>
                <th class="p-3 font-semibold">Fornecedor</th>
                <th class="p-3 text-center font-semibold">Qtd</th>
                <th class="p-3 text-right font-semibold">Preço Unit.</th>
                <th class="p-3 text-right font-semibold">Total Pago</th>
              </tr>
            </thead>
            <tbody id="hist-prod-list" class="divide-y"></tbody>
          </table>
        </div>
        <div class="p-4 border-t bg-slate-50 flex justify-end">
          <button onclick="document.getElementById('modal-prod-history').classList.add('hidden')" class="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition shadow-md">Fechar</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  prodModalsCreated = true;
}

function renderViewProd() {
  const container = document.getElementById('view-prod');
  if (container.dataset.rendered === 'true') {
    renderProducts();
    return;
  }

  const viewHTML = `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-slate-800">Materiais / Insumos</h2>
      <button onclick="openProductForm()" class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2"><i data-lucide="plus"></i> Novo Material</button>
    </div>
    <div class="flex gap-2 mb-4 bg-white p-4 rounded-xl shadow-sm border">
      <input type="text" id="prod-search" placeholder="Buscar material..." class="w-full p-2 border rounded outline-none focus:border-blue-600 font-medium" onkeyup="renderProducts()">
    </div>
    <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-100 text-slate-700"><tr><th class="p-4">Material</th><th class="p-4">Preço Ref. (R$)</th><th class="p-4 text-center">Editar</th></tr></thead>
        <tbody id="prod-list" class="divide-y"></tbody>
      </table>
    </div>`;

  container.innerHTML = viewHTML;
  container.dataset.rendered = 'true';
  renderProducts();
  lucide.createIcons();
}

function renderProducts() {
  const term = document.getElementById('prod-search').value.toLowerCase();
  const fil = STATE.produtos.filter(p => p.nome.toLowerCase().includes(term));
  
  document.getElementById('prod-list').innerHTML = fil.map(p => `
  <tr class="border-b hover:bg-slate-50 transition">
    <td class="p-4 font-bold text-slate-700">
      ${p.nome} <br>
      <span class="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded uppercase font-bold text-slate-600">${p.categoria||'GERAL'}</span>
    </td>
    <td class="p-4 font-black text-slate-800">${formatMoney(p.preco)}</td>
    <td class="p-4 text-center">
      <div class="flex items-center justify-center gap-2">
        <button onclick="openProductHistory('${p.nome.replace(/'/g, "\\'")}')" class="p-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded bg-indigo-50/50" title="Ver Histórico de Compras e Preços"><i data-lucide="history" width="16"></i></button>
        <button onclick="openProductForm('${p.id}')" class="p-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded" title="Editar Material"><i data-lucide="edit-3" width="16"></i></button>
      </div>
    </td>
  </tr>`).join('');
  lucide.createIcons();
}

function openProductForm(id) {
  document.getElementById('prod-form-container').classList.remove('hidden');
  if(id) {
    const p = STATE.produtos.find(x=>x.id==id);
    document.getElementById('prd-id').value = p.id;
    document.getElementById('prd-name').value = p.nome;
    document.getElementById('prd-cat').value = p.categoria;
    document.getElementById('prd-price').value = p.preco;
  } else {
    document.getElementById('prod-form-container').querySelector('form').reset();
    document.getElementById('prd-id').value = '';
  }
}

async function saveProduct(e) {
  e.preventDefault(); showLoading(true);
  const isNew = !document.getElementById('prd-id').value;
  const payload = {
    nome: document.getElementById('prd-name').value,
    categoria: document.getElementById('prd-cat').value,
    preco: document.getElementById('prd-price').value
  };
  if(!isNew) payload.id = document.getElementById('prd-id').value;
  const {error} = await sb.from('jsp_produtos').upsert(payload);
  if(error) { showLoading(false); return showToast("Erro", true); }
  document.getElementById('prod-form-container').classList.add('hidden');
  showToast("Material salvo!"); loadData();
}

function openProductHistory(prodNome) {
  document.getElementById('hist-prod-name').innerText = prodNome;
  const tbody = document.getElementById('hist-prod-list');
  
  let historico = STATE.logs.filter(l => l.tipo === 'compra' && l.produto_nome === prodNome);
  
  if(historico.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400 font-medium">Nenhuma compra registrada para este material ainda.</td></tr>`;
  } else {
    historico.sort((a,b) => new Date(b.data) - new Date(a.data));
    tbody.innerHTML = historico.map(h => {
      const forn = STATE.fornecedores.find(x => x.id == h.fornecedor_id);
      const nomeForn = forn ? forn.nome : 'Fornecedor A Definir';
      const precoUnit = parseFloat(h.valor_total) / parseFloat(h.quantidade);
      
      return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 text-xs font-bold text-slate-500">${formatDate(h.data)}</td>
        <td class="p-3 text-xs font-bold text-slate-800">${nomeForn}</td>
        <td class="p-3 text-center text-xs font-bold text-slate-600">${h.quantidade}</td>
        <td class="p-3 text-right text-xs font-black text-indigo-700">${formatMoney(precoUnit)}</td>
        <td class="p-3 text-right text-xs font-bold text-slate-400">${formatMoney(h.valor_total)}</td>
      </tr>`;
    }).join('');
  }
  document.getElementById('modal-prod-history').classList.remove('hidden');
  lucide.createIcons();
}
