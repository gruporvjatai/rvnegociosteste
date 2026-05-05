// ============================================================
// ABA: NOVA O.C. (view-pos) – view e modais gerados via JS
// ============================================================

let posModalsCreated = false;

// Cria os modais (fornecedor e produto) e injeta no body, uma única vez
function createPosModals() {
    if (posModalsCreated) return;
    const modalHTML = `
    <div id="pos-fornecedor-modal" class="hidden fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div class="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2"><i data-lucide="users" class="text-blue-600"></i> Selecionar Fornecedor</h3>
                <button onclick="closePosFornecedorModal()" class="text-slate-400 hover:text-red-500"><i data-lucide="x"></i></button>
            </div>
            <div class="p-4 border-b">
                <div class="relative w-full">
                    <i data-lucide="search" class="absolute left-3 top-3.5 text-slate-400 w-5 h-5"></i>
                    <input type="text" id="pos-fornecedor-modal-search" placeholder="Buscar fornecedor..." class="w-full pl-10 p-3 border-2 border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600" onkeyup="renderPosFornecedorModal()">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                <div id="pos-fornecedor-modal-grid" class="flex flex-col gap-2"></div>
            </div>
            <div class="p-4 border-t bg-slate-50 rounded-b-2xl flex flex-col gap-2">
                <button onclick="selectPosFornecedor('', 'A Definir')" class="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition">Limpar (A Definir)</button>
            </div>
        </div>
    </div>
    <div id="pos-product-modal" class="hidden fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div class="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2"><i data-lucide="package-search" class="text-blue-600"></i> Selecionar Material</h3>
                <button onclick="closePosProductModal()" class="text-slate-400 hover:text-red-500"><i data-lucide="x"></i></button>
            </div>
            <div class="p-4 border-b">
                <div class="relative w-full">
                    <i data-lucide="search" class="absolute left-3 top-3.5 text-slate-400 w-5 h-5"></i>
                    <input type="text" id="pos-modal-search" placeholder="Digite o nome..." class="w-full pl-10 p-3 border-2 border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600" onkeyup="renderPosProductModal()">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                <div id="pos-modal-grid" class="flex flex-col gap-2"></div>
            </div>
            <div class="p-4 border-t bg-slate-50 rounded-b-2xl">
                <button onclick="closePosProductModal()" class="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition">Concluído</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    posModalsCreated = true;
}

// Cria a view da Nova O.C. (estrutura completa) e injeta no container
function renderViewPos() {
    const container = document.getElementById('view-pos');
    // Se a view já foi montada, apenas atualiza os selects e o carrinho
    if (container.dataset.rendered === 'true') {
        updateSelects(); // atualiza selects de obra e fase
        renderCart();    // atualiza carrinho
        return;
    }
    const viewHTML = `
        <div class="flex flex-col h-[calc(100vh-100px)]">
            <div class="bg-white p-0 rounded-xl border shadow-lg flex flex-col h-full overflow-hidden border-t-4 border-t-blue-800">
                <div class="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <div class="font-bold text-slate-700 flex gap-2 items-center"><i data-lucide="shopping-cart" class="text-blue-700"></i> NOVA ORDEM DE COMPRA</div>
                    <div class="flex gap-2">
                        <button onclick="openPosProductModal()" class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition text-sm"><i data-lucide="search" class="w-4 h-4"></i> Buscar Materiais</button>
                        <button onclick="clearCart()" class="text-xs text-red-500 hover:text-red-700 font-bold border border-red-200 px-3 py-2 rounded-lg bg-white">LIMPAR</button>
                    </div>
                </div>
                <div id="pos-cart-items" class="flex-1 space-y-2 overflow-y-auto p-4 bg-slate-50"></div>
                <div class="bg-white p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Destino (Obra)</label>
                            <select id="pos-obra" class="w-full p-2 border rounded-lg text-sm bg-slate-50 font-bold text-slate-700 focus:border-blue-600 outline-none"></select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fase da Obra</label>
                            <select id="pos-fase" class="w-full p-2 border rounded-lg text-sm bg-slate-50 font-bold text-slate-700 focus:border-blue-600 outline-none">
                                <option value="">-- Não especificada --</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fornecedor</label>
                            <div class="flex gap-2">
                                <input type="hidden" id="pos-fornecedor" value="">
                                <button id="pos-fornecedor-btn" onclick="openPosFornecedorModal()" class="w-full p-2 border rounded-lg text-sm bg-slate-50 focus:border-blue-600 text-left flex justify-between items-center text-slate-600 font-bold">
                                    <span class="truncate">Selecione Fornecedor</span>
                                    <i data-lucide="search" class="w-4 h-4 text-slate-400 shrink-0"></i>
                                </button>
                                <button onclick="navigate('fornecedores')" class="p-2 bg-slate-200 rounded-lg hover:bg-slate-300 shrink-0" title="Novo Fornecedor"><i data-lucide="user-plus" class="w-4 h-4"></i></button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Solicitante / Comprador</label>
                            <input type="text" id="pos-solicitante" placeholder="Nome de quem solicitou..." class="w-full p-2 border rounded-lg text-sm bg-slate-50 focus:border-blue-600 outline-none font-medium">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações (Recados)</label>
                            <textarea id="pos-custom-obs" rows="1" placeholder="Observações da Cotação..." class="w-full p-2 border rounded-lg text-sm bg-slate-50 focus:border-blue-600 outline-none resize-none"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-between items-end border-t border-slate-200 pt-3">
                        <div class="text-sm font-bold text-slate-500">Total de Itens: <span id="cart-count" class="text-blue-700">0</span></div>
                        <div class="text-right flex items-center gap-4">
                            <div>
                                <div class="text-xs text-slate-500 font-bold uppercase">Total da O.C.</div>
                                <div id="pos-total-display" class="text-3xl font-black text-slate-800 leading-none">R$ 0,00</div>
                            </div>
                            <button onclick="saveOC()" class="btn-action bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-xl shadow-lg text-lg"><i data-lucide="save"></i> Salvar O.C.</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    container.innerHTML = viewHTML;
    container.dataset.rendered = 'true';
    updateSelects(); // preenche os selects de obra e fase
    renderCart();    // carrinho vazio
    lucide.createIcons();
}












// ----- CARRINHO -----===================================================================================
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
