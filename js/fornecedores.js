// ============================================================
// ABA: FORNECEDORES (view-fornecedores)
// ============================================================

let fornModalsCreated = false;

function createFornModals() {
  if (fornModalsCreated) return;
  const modalHTML = `
    <div id="fornecedor-form-container" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <form onsubmit="saveFornecedor(event)" class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 class="font-bold text-lg mb-4">Dados do Fornecedor</h3>
        <input type="hidden" id="forn-id">
        <div class="space-y-3">
          <input type="text" id="forn-name" required placeholder="Nome do Fornecedor / Empresa" class="w-full p-2 border rounded">
          <input type="text" id="forn-phone" placeholder="Telefone / WhatsApp" class="w-full p-2 border rounded">
          <input type="text" id="forn-doc" placeholder="CNPJ / CPF" class="w-full p-2 border rounded">
          <input type="text" id="forn-addr" placeholder="Endereço" class="w-full p-2 border rounded">
        </div>
        <div class="flex gap-2 mt-6">
          <button type="button" onclick="document.getElementById('fornecedor-form-container').classList.add('hidden')" class="flex-1 p-2 bg-slate-200 rounded font-bold hover:bg-slate-300">Cancelar</button>
          <button type="submit" class="flex-1 p-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-800">Salvar</button>
        </div>
      </form>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  fornModalsCreated = true;
}

function renderViewFornecedores() {
  const container = document.getElementById('view-fornecedores');
  if (container.dataset.rendered === 'true') {
    renderFornecedores();
    return;
  }

  const viewHTML = `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-slate-800">Fornecedores</h2>
      <button onclick="openFornecedorForm()" class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2"><i data-lucide="plus"></i> Novo Fornecedor</button>
    </div>
    <div class="mb-4 bg-white p-4 rounded-xl shadow-sm border">
      <div class="relative w-full">
        <i data-lucide="search" class="absolute left-3 top-2.5 text-slate-400 w-5 h-5"></i>
        <input type="text" id="forn-search" placeholder="Buscar fornecedor por nome, telefone ou documento..." class="w-full pl-10 p-2 border rounded outline-none focus:border-blue-600 font-medium" onkeyup="renderFornecedores()">
      </div>
    </div>
    <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-100 text-slate-700"><tr><th class="p-4">Nome</th><th class="p-4">Telefone</th><th class="p-4">Documento</th><th class="p-4 text-center">Ações</th></tr></thead>
        <tbody id="fornecedores-list" class="divide-y"></tbody>
      </table>
    </div>`;

  container.innerHTML = viewHTML;
  container.dataset.rendered = 'true';
  renderFornecedores();
  lucide.createIcons();
}

function renderFornecedores() {
  const term = document.getElementById('forn-search')?.value.toLowerCase() || '';
  const list = document.getElementById('fornecedores-list');
  const fil = STATE.fornecedores.filter(f => f.nome.toLowerCase().includes(term) || (f.documento||'').includes(term));
  list.innerHTML = fil.map(f => `<tr class="border-b hover:bg-slate-50"><td class="p-4 font-bold">${f.nome}</td><td class="p-4">${f.telefone||'-'}</td><td class="p-4">${f.documento||'-'}</td><td class="p-4 text-center"><button onclick="openFornecedorForm('${f.id}')" class="text-blue-600 hover:text-blue-800"><i data-lucide="edit-3" width="16"></i></button></td></tr>`).join('');
  lucide.createIcons();
}

function openFornecedorForm(id) {
  document.getElementById('fornecedor-form-container').classList.remove('hidden');
  if(id) {
    const f = STATE.fornecedores.find(x => x.id == id);
    document.getElementById('forn-id').value = f.id;
    document.getElementById('forn-name').value = f.nome;
    document.getElementById('forn-phone').value = f.telefone;
    document.getElementById('forn-doc').value = f.documento;
    document.getElementById('forn-addr').value = f.endereco;
  } else {
    document.getElementById('fornecedor-form-container').querySelector('form').reset();
    document.getElementById('forn-id').value = '';
  }
}

async function saveFornecedor(e) {
  e.preventDefault(); showLoading(true);
  const isNew = !document.getElementById('forn-id').value;
  const payload = {
    nome: document.getElementById('forn-name').value,
    telefone: document.getElementById('forn-phone').value,
    documento: document.getElementById('forn-doc').value,
    endereco: document.getElementById('forn-addr').value
  };
  if(!isNew) payload.id = document.getElementById('forn-id').value;
  const { error } = await sb.from('jsp_fornecedores').upsert(payload);
  if(error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  document.getElementById('fornecedor-form-container').classList.add('hidden');
  showToast("Fornecedor Salvo!"); loadData();
}
