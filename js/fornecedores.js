// =============================================
//   RV NEGÓCIOS - js/fornecedores.js
//   CRUD de Fornecedores
// =============================================

function renderFornecedores() {
    const term = document.getElementById('forn-search').value.toLowerCase();
    const list = document.getElementById('fornecedores-list');
    const fil  = STATE.fornecedores.filter(f =>
        f.nome.toLowerCase().includes(term) || (f.documento || '').includes(term)
    );
    list.innerHTML = fil.map(f => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-4 font-bold">${f.nome}</td>
            <td class="p-4">${f.telefone || '-'}</td>
            <td class="p-4">${f.documento || '-'}</td>
            <td class="p-4 text-center">
                <button onclick="openFornecedorForm('${f.id}')" class="text-blue-600 hover:text-blue-800">
                    <i data-lucide="edit-3" width="16"></i>
                </button>
            </td>
        </tr>`).join('');
    lucide.createIcons();
}

function openFornecedorForm(id) {
    document.getElementById('fornecedor-form-container').classList.remove('hidden');
    if (id) {
        const f = STATE.fornecedores.find(x => x.id == id);
        document.getElementById('forn-id').value    = f.id;
        document.getElementById('forn-name').value  = f.nome;
        document.getElementById('forn-phone').value = f.telefone;
        document.getElementById('forn-doc').value   = f.documento;
        document.getElementById('forn-addr').value  = f.endereco;
    } else {
        document.getElementById('fornecedor-form-container').querySelector('form').reset();
        document.getElementById('forn-id').value = '';
    }
}

async function saveFornecedor(e) {
    e.preventDefault();
    showLoading(true);
    const isNew = !document.getElementById('forn-id').value;
    const payload = {
        nome:      document.getElementById('forn-name').value,
        telefone:  document.getElementById('forn-phone').value,
        documento: document.getElementById('forn-doc').value,
        endereco:  document.getElementById('forn-addr').value
    };
    if (!isNew) payload.id = document.getElementById('forn-id').value;

    const { error } = await sb.from('jsp_fornecedores').upsert(payload);
    if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    document.getElementById('fornecedor-form-container').classList.add('hidden');
    showToast("Fornecedor Salvo!");
    loadData();
}
