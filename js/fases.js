// ============================================================
// ABA: FASES DE OBRA (view-fases)
// ============================================================

let fasesModalsCreated = false;

function createFasesModals() {
  if (fasesModalsCreated) return;
  const modalHTML = `
    <div id="fase-form-container" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <form onsubmit="saveFase(event)" class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2"><i data-lucide="layers" class="text-blue-600"></i> Fase da Obra</h3>
        <input type="hidden" id="fas-id">
        <div class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase">Ordem de Exibição (Ex: 1, 2, 3...)</label>
            <input type="number" id="fas-ordem" required placeholder="1" class="w-full p-2 border rounded font-bold text-blue-700 bg-blue-50 focus:border-blue-600 outline-none">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase">Nome da Fase (Ex: LAJE, ALVENARIA)</label>
            <input type="text" id="fas-name" required placeholder="Nome da Fase" class="w-full p-2 border rounded uppercase focus:border-blue-600 outline-none">
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button type="button" onclick="document.getElementById('fase-form-container').classList.add('hidden')" class="flex-1 p-2 bg-slate-200 rounded font-bold hover:bg-slate-300 text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 p-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-800 shadow-md">Salvar</button>
        </div>
      </form>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  fasesModalsCreated = true;
}

function renderViewFases() {
  const container = document.getElementById('view-fases');
  if (container.dataset.rendered === 'true') {
    renderFases();
    return;
  }

  const viewHTML = `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2"><i data-lucide="layers" class="text-blue-700"></i> Fases de Obra</h2>
      <button onclick="openFaseForm()" class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2"><i data-lucide="plus"></i> Nova Fase</button>
    </div>
    <div class="mb-4 bg-white p-4 rounded-xl shadow-sm border">
      <div class="relative w-full">
        <i data-lucide="search" class="absolute left-3 top-2.5 text-slate-400 w-5 h-5"></i>
        <input type="text" id="fase-search" placeholder="Buscar fase por nome..." class="w-full pl-10 p-2 border rounded outline-none focus:border-blue-600 font-medium" onkeyup="renderFases()">
      </div>
    </div>
    <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-100 text-slate-700"><tr><th class="p-4 w-24 text-center">Ordem</th><th class="p-4">Nome da Fase</th><th class="p-4 text-center w-32">Ações</th></tr></thead>
        <tbody id="fases-list" class="divide-y"></tbody>
      </table>
    </div>`;

  container.innerHTML = viewHTML;
  container.dataset.rendered = 'true';
  renderFases();
  lucide.createIcons();
}

function renderFases() {
  const term = document.getElementById('fase-search')?.value.toLowerCase() || '';
  const list = document.getElementById('fases-list');
  const fil = STATE.fases.filter(f => f.nome.toLowerCase().includes(term) || String(f.ordem).includes(term));

  list.innerHTML = fil.map(f => `
    <tr class="border-b hover:bg-slate-50 transition">
      <td class="p-4 text-center font-black text-blue-700 text-lg">${f.ordem}</td>
      <td class="p-4 font-bold text-slate-700 uppercase">${f.nome}</td>
      <td class="p-4 text-center">
        <button onclick="openFaseForm('${f.id}')" class="p-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><i data-lucide="edit-3" width="16"></i></button>
        <button onclick="deleteFase('${f.id}')" class="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded ml-1" title="Excluir"><i data-lucide="trash-2" width="16"></i></button>
      </td>
    </tr>`).join('');
  lucide.createIcons();
}

function openFaseForm(id) {
  document.getElementById('fase-form-container').classList.remove('hidden');
  if(id) {
    const f = STATE.fases.find(x => x.id == id);
    document.getElementById('fas-id').value = f.id;
    document.getElementById('fas-ordem').value = f.ordem;
    document.getElementById('fas-name').value = f.nome;
  } else {
    document.getElementById('fase-form-container').querySelector('form').reset();
    document.getElementById('fas-id').value = '';
    const maxOrdem = STATE.fases.reduce((max, f) => (f.ordem > max ? f.ordem : max), 0);
    document.getElementById('fas-ordem').value = maxOrdem + 1;
  }
}

async function saveFase(e) {
  e.preventDefault(); showLoading(true);
  const isNew = !document.getElementById('fas-id').value;
  const payload = {
    ordem: parseInt(document.getElementById('fas-ordem').value),
    nome: document.getElementById('fas-name').value.toUpperCase()
  };
  if(!isNew) {
    payload.id = document.getElementById('fas-id').value;
  } else {
    payload.id = crypto.randomUUID();
  }

  const { error } = await sb.from('jsp_fase').upsert(payload);
  if(error) { showLoading(false); return showToast("Erro: " + error.message, true); }

  document.getElementById('fase-form-container').classList.add('hidden');
  showToast("Fase de Obra salva com sucesso!"); loadData();
}

async function deleteFase(id) {
  if(!confirm("Tem certeza que deseja excluir esta fase? Ela deixará de aparecer nas opções.")) return;
  showLoading(true);
  const { error } = await sb.from('jsp_fase').delete().eq('id', id);
  if(error) { showLoading(false); return showToast("Erro: " + error.message, true); }
  showToast("Fase Excluída!"); loadData();
}
