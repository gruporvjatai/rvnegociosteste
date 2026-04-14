// ====== CRUD FASES DE OBRA ======
function renderFases() {
    const term = document.getElementById('fase-search').value.toLowerCase();
    const list = document.getElementById('fases-list');
    const fil = STATE.fases.filter(f => f.nome.toLowerCase().includes(term) || String(f.ordem).includes(term));

    list.innerHTML = fil.map(f => `
    <tr class="border-b hover:bg-slate-50 transition">
        <td class="p-4 text-center font-black text-blue-700 text-lg">${f.ordem}</td>
        <td class="p-4 font-bold text-slate-700 uppercase">${f.nome}</td>
        <td class="p-4 text-center">
            <button onclick="openFaseForm('${f.id}')" class="p-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                <i data-lucide="edit-3" width="16"></i>
            </button>
            <button onclick="deleteFase('${f.id}')" class="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded ml-1" title="Excluir">
                <i data-lucide="trash-2" width="16"></i>
            </button>
        </td>
    </tr>`).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openFaseForm(id) {
    document.getElementById('fase-form-container').classList.remove('hidden');
    if (id) {
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
    e.preventDefault();
    showLoading(true);
    const isNew = !document.getElementById('fas-id').value;
    const payload = {
        ordem: parseInt(document.getElementById('fas-ordem').value),
        nome: document.getElementById('fas-name').value.toUpperCase()
    };

    if (!isNew) {
        payload.id = document.getElementById('fas-id').value;
    } else {
        payload.id = crypto.randomUUID();
    }

    const { error } = await sb.from('jsp_fase').upsert(payload);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }

    document.getElementById('fase-form-container').classList.add('hidden');
    showToast("Fase de Obra salva com sucesso!");
    loadData();
}

async function deleteFase(id) {
    if (!confirm("Tem certeza que deseja excluir esta fase? Ela deixará de aparecer nas opções.")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_fase').delete().eq('id', id);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("Fase Excluída!");
    loadData();
}