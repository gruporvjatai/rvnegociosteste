// ============================================================
// ABA: NOVA O.C. (view-pos)
// ============================================================

// ----- CARRINHO -----
function renderCart() {
    const box = document.getElementById('pos-cart-items');
    if(!CART.length) { 
        box.innerHTML='<div class="flex flex-col items-center justify-center h-full text-slate-400 mt-10"><i data-lucide="shopping-basket" class="w-16 h-16 mb-4 opacity-50"></i><p class="text-sm">Nenhum item adicionado.</p></div>'; 
        document.getElementById('pos-total-display').innerText=formatMoney(0); 
        document.getElementById('cart-count').innerText='0'; 
        lucide.createIcons();
        return; 
    }
    let sub = 0;
    box.innerHTML = CART.map((i,idx) => {
        const totalItem = i.qty * i.price; sub += totalItem;
        return `
        <div class="bg-white p-3 border border-slate-200 rounded-xl mb-2 flex items-center justify-between gap-4 shadow-sm hover:border-blue-300 hover:shadow-md transition">
            <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-700 truncate">${i.name}</div>
                <div class="text-[10px] text-slate-400 uppercase font-bold">${i.cat || 'Geral'}</div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <input type="number" value="${i.qty}" onchange="updateCart(${idx}, 'qty', this.value)" class="w-16 p-2 border rounded-lg bg-slate-50 text-center text-sm font-bold focus:border-blue-500 outline-none">
                <span class="text-slate-400 text-xs font-bold">x</span>
                <input type="number" step="0.01" value="${i.price}" onchange="updateCart(${idx}, 'price', this.value)" class="w-24 p-2 border rounded-lg bg-slate-50 text-center text-sm font-bold focus:border-blue-500 outline-none">
            </div>
            <div class="font-black text-slate-800 w-24 text-right shrink-0 text-sm">${formatMoney(totalItem)}</div>
            <button onclick="CART.splice(${idx},1);renderCart()" class="text-red-400 hover:text-red-600 shrink-0 p-2 rounded-lg hover:bg-red-50"><i data-lucide="x-circle" width="18"></i></button>
        </div>`;
    }).join('');
    document.getElementById('pos-total-display').innerText = formatMoney(sub);
    document.getElementById('cart-count').innerText = CART.length;
    lucide.createIcons();
}

function updateCart(idx, field, value) { 
    CART[idx][field] = parseFloat(value)||0; 
    renderCart(); 
}

function clearCart() { 
    CART=[]; 
    CURRENT_OC_ID=null; 
    document.getElementById('pos-solicitante').value=''; 
    document.getElementById('pos-custom-obs').value=''; 
    document.getElementById('pos-fornecedor').value = '';
    document.getElementById('pos-fornecedor-btn').querySelector('span').innerText = 'Selecione Fornecedor';
    document.getElementById('pos-fase').value = '';
    renderCart(); 
}

// ----- MODAL DE SELEÇÃO DE PRODUTO -----
function openPosProductModal() { 
    document.getElementById('pos-product-modal').classList.remove('hidden'); 
    renderPosProductModal(); 
}

function closePosProductModal() { 
    document.getElementById('pos-product-modal').classList.add('hidden'); 
}

function renderPosProductModal() {
    const term = document.getElementById('pos-modal-search').value.toLowerCase();
    const grid = document.getElementById('pos-modal-grid');
    const fil = STATE.produtos.filter(p => p.nome.toLowerCase().includes(term));
    grid.innerHTML = fil.map(p => `
        <div class="p-4 border border-slate-200 rounded-xl hover:shadow-md bg-white flex items-center justify-between">
            <div class="w-1/2">
                <h4 class="font-black text-sm text-slate-800 truncate">${p.nome}</h4>
                <span class="text-[10px] text-slate-500 uppercase">${p.categoria || 'Geral'}</span>
            </div>
            <div class="flex items-center gap-3 w-1/2 justify-end">
                <span class="text-slate-500 font-bold text-xs">${formatMoney(p.preco)}</span>
                <button onclick="addCartModal(${p.id}, '${p.nome.replace(/'/g,"")}', ${p.preco})" class="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition"><i data-lucide="plus" width="16"></i></button>
            </div>
        </div>`).join('');
    lucide.createIcons();
}

function addCartModal(id, name, price) {
    const p = STATE.produtos.find(x => x.id == id);
    const cat = p ? p.categoria : 'Geral';
    const exist = CART.find(x => x.id == id);
    if(exist) exist.qty += 1; else CART.push({id, name, price, qty: 1, cat: cat});
    showToast(`${name} adicionado!`); renderCart();
}

// ----- MODAL DE SELEÇÃO DE FORNECEDOR -----
function openPosFornecedorModal() { 
    document.getElementById('pos-fornecedor-modal').classList.remove('hidden'); 
    renderPosFornecedorModal(); 
}

function closePosFornecedorModal() { 
    document.getElementById('pos-fornecedor-modal').classList.add('hidden'); 
}

function renderPosFornecedorModal() {
    const term = document.getElementById('pos-fornecedor-modal-search').value.toLowerCase();
    const fil = STATE.fornecedores.filter(f => f.nome.toLowerCase().includes(term));
    document.getElementById('pos-fornecedor-modal-grid').innerHTML = fil.map(f => `
        <div class="p-4 border rounded-xl hover:shadow-md bg-white flex items-center justify-between cursor-pointer" onclick="selectPosFornecedor(${f.id}, '${f.nome.replace(/'/g,"")}')">
            <div class="flex flex-col"><h4 class="font-black text-sm text-slate-800">${f.nome}</h4><span class="text-[10px] text-slate-500">Doc: ${f.documento||'-'}</span></div>
            <button class="bg-slate-100 p-2 rounded-lg"><i data-lucide="check" width="16"></i></button>
        </div>`).join('');
    lucide.createIcons();
}

function selectPosFornecedor(id, name) {
    document.getElementById('pos-fornecedor').value = id;
    document.getElementById('pos-fornecedor-btn').querySelector('span').innerText = name;
    closePosFornecedorModal();
}

// ----- SALVAR OC -----
async function saveOC() {
    if(!CART.length) return showToast("Adicione itens à O.C.", true);
    const obraId = document.getElementById('pos-obra').value;
    if(!obraId) return showToast("Selecione a Obra de destino!", true);

    showLoading(true);
    const fornId = document.getElementById('pos-fornecedor').value || null;
    const faseObra = document.getElementById('pos-fase').value;
    const solicitante = document.getElementById('pos-solicitante').value;
    const obs = document.getElementById('pos-custom-obs').value;
    const newId = CURRENT_OC_ID || getNextIdNum(STATE.logs);
    const dt = new Date().toISOString();

    const obsFinal = `Solicitante: ${solicitante || 'Não informado'} | Obs: ${obs}`;

    if(CURRENT_OC_ID) await sb.from('jsp_logs').delete().eq('id', CURRENT_OC_ID).eq('tipo', 'oc_pendente');

    const inserts = CART.map(i => ({
        id: newId.toString(),
        obra_id: parseInt(obraId),
        fornecedor_id: fornId ? parseInt(fornId) : null,
        tipo: 'oc_pendente',
        produto_nome: i.name,
        quantidade: i.qty,
        valor_total: (i.qty * i.price),
        data: dt,
        vencimento: dt,
        status_financeiro: 'PENDENTE',
        fase_obra: faseObra,
        categoria: i.cat || 'Geral',
        observacao: obsFinal
    }));

    const { error } = await sb.from('jsp_logs').insert(inserts);
    if(error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    clearCart(); showToast("O.C. Salva com sucesso!"); await loadData(); navigate('oc');
}
