// =============================================
//   RV NEGÓCIOS - js/produtos.js
//   CRUD de Produtos/Materiais
// =============================================

function renderProducts() {
    const term = document.getElementById('prod-search').value.toLowerCase();
    const fil  = STATE.produtos.filter(p => p.nome.toLowerCase().includes(term));

    document.getElementById('prod-list').innerHTML = fil.map(p => `
        <tr class="border-b hover:bg-slate-50 transition">
            <td class="p-4 font-bold text-slate-700">
                ${p.nome}<br>
                <span class="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded uppercase font-bold text-slate-600">${p.categoria || 'GERAL'}</span>
            </td>
            <td class="p-4 font-black text-slate-800">${formatMoney(p.preco)}</td>
            <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="openProductHistory('${p.nome.replace(/'/g, "\\'")}')" class="p-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded bg-indigo-50/50" title="Histórico de Compras">
                        <i data-lucide="history" width="16"></i>
                    </button>
                    <button onclick="openProductForm('${p.id}')" class="p-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded" title="Editar Material">
                        <i data-lucide="edit-3" width="16"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');
    lucide.createIcons();
}

function openProductHistory(prodNome) {
    document.getElementById('hist-prod-name').innerText = prodNome;
    const tbody = document.getElementById('hist-prod-list');

    let historico = STATE.logs.filter(l => l.tipo === 'compra' && l.produto_nome === prodNome);

    if (historico.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400 font-medium">Nenhuma compra registrada para este material ainda.</td></tr>`;
    } else {
        historico.sort((a, b) => new Date(b.data) - new Date(a.data));
        tbody.innerHTML = historico.map(h => {
            const forn     = STATE.fornecedores.find(x => x.id == h.fornecedor_id);
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

function openProductForm(id) {
    document.getElementById('prod-form-container').classList.remove('hidden');
    if (id) {
        const p = STATE.produtos.find(x => x.id == id);
        document.getElementById('prd-id').value    = p.id;
        document.getElementById('prd-name').value  = p.nome;
        document.getElementById('prd-cat').value   = p.categoria;
        document.getElementById('prd-price').value = p.preco;
    } else {
        document.getElementById('prod-form-container').querySelector('form').reset();
        document.getElementById('prd-id').value = '';
    }
}

async function saveProduct(e) {
    e.preventDefault();
    showLoading(true);
    const isNew = !document.getElementById('prd-id').value;
    const payload = {
        nome:      document.getElementById('prd-name').value,
        categoria: document.getElementById('prd-cat').value,
        preco:     document.getElementById('prd-price').value
    };
    if (!isNew) payload.id = document.getElementById('prd-id').value;

    const { error } = await sb.from('jsp_produtos').upsert(payload);
    if (error) { showLoading(false); return showToast("Erro", true); }

    document.getElementById('prod-form-container').classList.add('hidden');
    showToast("Material salvo!");
    loadData();
}
