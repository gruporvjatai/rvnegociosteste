// ====== ORDENS DE COMPRA (OC) E CARRINHO ======
function renderCart() {
    const box = document.getElementById('pos-cart-items');
    if (!CART.length) {
        box.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-slate-400 mt-10"><i data-lucide="shopping-basket" class="w-16 h-16 mb-4 opacity-50"></i><p class="text-sm">Nenhum item adicionado.</p></div>';
        document.getElementById('pos-total-display').innerText = formatMoney(0);
        document.getElementById('cart-count').innerText = '0';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    let sub = 0;
    box.innerHTML = CART.map((i, idx) => {
        const totalItem = i.qty * i.price;
        sub += totalItem;
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
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateCart(idx, field, value) {
    CART[idx][field] = parseFloat(value) || 0;
    renderCart();
}

function clearCart() {
    CART = [];
    CURRENT_OC_ID = null;
    document.getElementById('pos-solicitante').value = '';
    document.getElementById('pos-custom-obs').value = '';
    document.getElementById('pos-fornecedor').value = '';
    document.getElementById('pos-fornecedor-btn').querySelector('span').innerText = 'Selecione Fornecedor';
    document.getElementById('pos-fase').value = '';
    renderCart();
}

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
                <button onclick="addCartModal(${p.id}, '${p.nome.replace(/'/g, "")}', ${p.preco})" class="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition"><i data-lucide="plus" width="16"></i></button>
            </div>
        </div>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addCartModal(id, name, price) {
    const p = STATE.produtos.find(x => x.id == id);
    const cat = p ? p.categoria : 'Geral';
    const exist = CART.find(x => x.id == id);
    if (exist) exist.qty += 1;
    else CART.push({ id, name, price, qty: 1, cat: cat });
    showToast(`${name} adicionado!`);
    renderCart();
}

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
        <div class="p-4 border rounded-xl hover:shadow-md bg-white flex items-center justify-between cursor-pointer" onclick="selectPosFornecedor(${f.id}, '${f.nome.replace(/'/g, "")}')">
            <div class="flex flex-col"><h4 class="font-black text-sm text-slate-800">${f.nome}</h4><span class="text-[10px] text-slate-500">Doc: ${f.documento || '-'}</span></div>
            <button class="bg-slate-100 p-2 rounded-lg"><i data-lucide="check" width="16"></i></button>
        </div>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function selectPosFornecedor(id, name) {
    document.getElementById('pos-fornecedor').value = id;
    document.getElementById('pos-fornecedor-btn').querySelector('span').innerText = name;
    closePosFornecedorModal();
}

async function saveOC() {
    if (!CART.length) return showToast("Adicione itens à O.C.", true);
    const obraId = document.getElementById('pos-obra').value;
    if (!obraId) return showToast("Selecione a Obra de destino!", true);

    showLoading(true);
    const fornId = document.getElementById('pos-fornecedor').value || null;
    const faseObra = document.getElementById('pos-fase').value;
    const solicitante = document.getElementById('pos-solicitante').value;
    const obs = document.getElementById('pos-custom-obs').value;
    const newId = CURRENT_OC_ID || getNextIdNum(STATE.logs);
    const dt = new Date().toISOString();

    const obsFinal = `Solicitante: ${solicitante || 'Não informado'} | Obs: ${obs}`;

    if (CURRENT_OC_ID) await sb.from('jsp_logs').delete().eq('id', CURRENT_OC_ID).eq('tipo', 'oc_pendente');

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
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }

    clearCart();
    showToast("O.C. Salva com sucesso!");
    await loadData();
    navigate('oc');
}

function renderOCList() {
    const list = document.getElementById('oc-list');
    const term = document.getElementById('oc-search').value.toLowerCase();

    const ocs = {};
    STATE.logs.filter(l => (l.tipo === 'oc_pendente' || l.tipo === 'compra') && l.status_financeiro !== 'CANCELADO').forEach(l => {
        if (!ocs[l.id]) ocs[l.id] = { id: l.id, data: l.data, itemsLog: [], itemsText: [], total: 0, obra_id: l.obra_id, forn_id: l.fornecedor_id, obs: l.observacao, tipo: l.tipo, fase: l.fase_obra };

        ocs[l.id].itemsLog.push({ name: l.produto_nome, qty: l.quantidade, price: (parseFloat(l.valor_total) / parseFloat(l.quantidade)) });
        ocs[l.id].itemsText.push(l.produto_nome + ` (x${l.quantidade})`);
        ocs[l.id].total += parseFloat(l.valor_total);
    });

    let arr = Object.values(ocs).sort((a, b) => parseInt(b.id) - parseInt(a.id));

    if (arr.length === 0) {
        list.innerHTML = `<td><td colspan="6" class="p-8 text-center text-slate-400">Nenhuma Ordem de Compra encontrada.</td></tr>`;
        return;
    }

    list.innerHTML = arr.map(o => {
        const obra = STATE.obras.find(x => x.id == o.obra_id);
        const forn = STATE.fornecedores.find(x => x.id == o.forn_id);
        const txt = (obra?.nome || '?') + ' ' + (forn?.nome || '');
        if (term && !txt.toLowerCase().includes(term) && !String(o.id).includes(term)) return '';

        return `
        <tr class="border-b hover:bg-slate-50 transition">
            <td class="p-4 font-black text-slate-700">#${o.id}</td>
            <td class="p-4">
                <div class="font-bold text-slate-800">${forn?.nome || 'Fornecedor A Definir'}</div>
                <div class="text-[10px] text-blue-600 font-bold uppercase mt-0.5"><i data-lucide="building" class="inline w-3 h-3"></i> ${obra?.nome || 'Sem Obra'}</div>
                ${o.fase ? `<div class="text-[9px] text-slate-500 font-bold uppercase mt-0.5"><i data-lucide="layers" class="inline w-3 h-3"></i> ${o.fase}</div>` : ''}
            </td>
            <td class="p-4 text-center">
                <span class="px-2 py-1 rounded text-[10px] font-bold ${o.tipo === 'compra' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}">${o.tipo === 'compra' ? 'CONFIRMADA' : 'PENDENTE'}</span>
            </td>
            <td class="p-4 text-xs text-slate-500 truncate max-w-[200px]" title="${o.itemsText.join(', ')}">${o.itemsText.join(', ')}</td>
            <td class="p-4 text-right font-bold text-slate-800">${formatMoney(o.total)}</td>
            <td class="p-4 text-center">
                <div class="flex justify-center gap-2">
                    ${o.tipo === 'oc_pendente' ? `
                        <button onclick="openConfirmOC('${o.id}')" class="p-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm font-bold text-xs" title="Confirmar Compra">Comprar</button>
                        <button onclick="loadOCToCart('${o.id}')" class="p-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded" title="Editar Itens"><i data-lucide="edit-3" width="14"></i></button>
                    ` : `
                        <button onclick="estornarCompra('${o.id}')" class="p-2 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded" title="Estornar Confirmação (Voltar para Pendente)"><i data-lucide="rotate-ccw" width="14"></i></button>
                    `}
                    <button onclick="printOC('${o.id}')" class="p-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded" title="Imprimir"><i data-lucide="printer" width="14"></i></button>
                    <button onclick="printRomaneio('${o.id}')" class="p-2 border border-teal-200 text-teal-700 hover:bg-teal-50 rounded bg-teal-50/50" title="Imprimir Romaneio p/ Motorista (Sem Valores)"><i data-lucide="truck" width="14"></i></button>
                    <button onclick="downloadOCPDF('${o.id}')" class="p-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded" title="Baixar PDF"><i data-lucide="download" width="14"></i></button>
                    <button onclick="abrirModalTransferencia('${o.id}')" class="p-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded bg-indigo-50/50 font-bold flex items-center gap-1" title="Gerar Orçamento RV Portal"><i data-lucide="send" width="14"></i></button>
                    ${o.tipo === 'oc_pendente' ? `
                        <button onclick="deleteOC('${o.id}')" class="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded" title="Excluir"><i data-lucide="trash-2" width="14"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function loadOCToCart(id) {
    const itemsLog = STATE.logs.filter(l => String(l.id) === String(id) && l.tipo === 'oc_pendente');
    if (!itemsLog.length) return;

    CART = itemsLog.map(i => ({ name: i.produto_nome, qty: parseFloat(i.quantidade), price: (parseFloat(i.valor_total) / parseFloat(i.quantidade)), total: parseFloat(i.valor_total), cat: i.categoria }));
    CURRENT_OC_ID = id;

    document.getElementById('pos-obra').value = itemsLog[0].obra_id || '';
    document.getElementById('pos-fase').value = itemsLog[0].fase_obra || '';

    const fornObj = STATE.fornecedores.find(f => f.id == itemsLog[0].fornecedor_id);
    if (fornObj) {
        document.getElementById('pos-fornecedor').value = fornObj.id;
        document.getElementById('pos-fornecedor-btn').querySelector('span').innerText = fornObj.nome;
    } else {
        document.getElementById('pos-fornecedor').value = '';
        document.getElementById('pos-fornecedor-btn').querySelector('span').innerText = 'Selecione Fornecedor';
    }

    const fullObs = itemsLog[0].observacao || '';
    let sol = '';
    let justObs = fullObs;
    if (fullObs.includes(' | Obs: ')) {
        const parts = fullObs.split(' | Obs: ');
        sol = parts[0].replace('Solicitante: ', '');
        justObs = parts[1];
    }

    document.getElementById('pos-solicitante').value = sol;
    document.getElementById('pos-custom-obs').value = justObs;

    navigate('pos');
    renderCart();
    showToast(`Editando Ordem de Compra #${id}`);
}

async function estornarCompra(id) {
    if (!confirm("Deseja estornar a confirmação desta O.C.? Ela voltará a ser Pendente e sairá do quadro Financeiro.")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_logs').update({
        tipo: 'oc_pendente',
        status_financeiro: 'PENDENTE'
    }).eq('id', id).eq('tipo', 'compra');

    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("O.C. estornada para Pendente!");
    loadData();
}

async function deleteOC(id) {
    if (!confirm("Excluir esta O.C.?")) return;
    showLoading(true);
    await sb.from('jsp_logs').delete().eq('id', id).eq('tipo', 'oc_pendente');
    showToast("O.C. Excluída!");
    loadData();
}

function openConfirmOC(id) {
    document.getElementById('confirm-oc-id').value = id;
    document.getElementById('modal-confirm-oc').classList.remove('hidden');
}

async function executeConfirmOC() {
    const id = document.getElementById('confirm-oc-id').value;
    const formPagto = document.getElementById('confirm-oc-payment').value;
    showLoading(true);

    let statusFinal = 'PENDENTE';
    let dataHoje = new Date();
    let dataVenc = new Date();

    if (formPagto === 'PIX') {
        statusFinal = 'PAGO';
    } else {
        dataVenc.setDate(dataVenc.getDate() + 30);
    }

    const { error } = await sb.from('jsp_logs').update({
        tipo: 'compra',
        forma_pagamento: formPagto,
        status_financeiro: statusFinal,
        data: dataHoje.toISOString(),
        vencimento: dataVenc.toISOString()
    }).eq('id', id).eq('tipo', 'oc_pendente');

    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }

    document.getElementById('modal-confirm-oc').classList.add('hidden');
    showToast("Compra confirmada e enviada ao Financeiro!");
    loadData();
}

function buildHTMLOC(id) {
    const logsOC = STATE.logs.filter(l => String(l.id) === String(id) && (l.tipo === 'oc_pendente' || l.tipo === 'compra'));
    if (!logsOC.length) return '';

    const o = logsOC[0];
    const obra = STATE.obras.find(x => x.id == o.obra_id) || { nome: 'Sem Obra', endereco: '-' };
    const forn = STATE.fornecedores.find(x => x.id == o.fornecedor_id) || { nome: 'A Definir', documento: '', telefone: '' };

    let fullObs = o.observacao || 'Nenhuma observação informada.';
    let justObs = fullObs;
    if (fullObs.includes(' | Obs: ')) {
        const parts = fullObs.split(' | Obs: ');
        justObs = parts[0] + '<br>' + parts[1];
    }

    let total = 0;
    const linhas = logsOC.map((i, index) => {
        const valor = parseFloat(i.valor_total);
        total += valor;
        const price = valor / parseFloat(i.quantidade);
        const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `<tr style="background-color: ${bg};">
            <td style="border-bottom: 1px solid #000; padding: 8px;">${i.produto_nome}</td>
            <td align="center" style="border-bottom: 1px solid #000; padding: 8px;">${i.quantidade}</td>
            <td align="right" style="border-bottom: 1px solid #000; padding: 8px;">${formatMoney(price)}</td>
            <td align="right" style="border-bottom: 1px solid #000; padding: 8px;">${formatMoney(valor)}</td>
        </tr>`;
    }).join('');

    return `
    <div style="font-family: 'Helvetica', sans-serif; padding: 15px; width: 100%; border: 1px solid #000; min-height: 27.5cm;">
        <table width="100%" style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
            <tr>
                <td width="130" valign="middle" style="border-right: 1px solid #e2e8f0; padding-right: 15px;">
                    <img src="https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png" crossorigin="anonymous" style="max-height: 80px; display: block; margin: 0 auto;" />
                </td>
                <td valign="middle" style="padding-left: 15px;">
                    <h2 style="margin: 0; color: #1d4ed8; font-size: 20px; font-weight: 800;">RV NEGÓCIOS E COMPANHIA</h2>
                    <div style="font-size: 11px; color: #475569; margin-top: 5px; line-height: 1.4;">CNPJ: 61.893.912/0001-24</div>
                    <div style="font-size: 11px; color: #475569; line-height: 1.4;">Rua Mineiros, 530 | Jataí - GO | (64) 99981-5852</div>
                </td>
                <td align="right" valign="top">
                    <h2 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 900;">ORDEM DE COMPRA</h2>
                    <div style="font-size: 11px;"><strong>Nº:</strong> ${o.id}</div>
                    <div style="font-size: 11px;"><strong>Emissão:</strong> ${formatDate(o.data)}</div>
                    <div style="font-size: 11px;"><strong>Fase:</strong> ${o.fase_obra || '-'}</div>
                </td>
            </tr>
        </table>
        <table width="100%" style="margin-bottom: 20px;">
            <tr>
                <td width="48%" valign="top" style="border: 1px solid #000; padding: 0;">
                    <div style="background-color: #f1f5f9; padding: 5px; font-size: 10px; font-weight: bold; border-bottom: 1px solid #000;">DADOS DO FORNECEDOR</div>
                    <div style="padding: 10px; font-size: 11px;">
                        <strong>${forn.nome}</strong><br>
                        Doc: ${forn.documento || '-'}<br>
                        Tel: ${forn.telefone || '-'}
                    </div>
                </td>
                <td width="4%"></td>
                <td width="48%" valign="top" style="border: 1px solid #000; padding: 0;">
                    <div style="background-color: #f1f5f9; padding: 5px; font-size: 10px; font-weight: bold; border-bottom: 1px solid #000;">DESTINO (OBRA)</div>
                    <div style="padding: 10px; font-size: 11px;">
                        <strong>${obra.nome}</strong><br>
                        Endereço: ${obra.endereco || '-'}
                    </div>
                </td>
            </tr>
        </table>
        <table width="100%" style="border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
            <thead>
                <tr>
                    <th align="left" style="background-color: #0f172a; color: #fff; padding: 8px;">Descrição</th>
                    <th align="center" style="background-color: #0f172a; color: #fff; padding: 8px;">Qtd</th>
                    <th align="right" style="background-color: #0f172a; color: #fff; padding: 8px;">Unit. Estimado</th>
                    <th align="right" style="background-color: #0f172a; color: #fff; padding: 8px;">Total Estimado</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
        <table width="100%">
            <tr>
                <td valign="top">
                    <div style="border: 1px dashed #cbd5e1; padding: 10px; min-height: 50px;">
                        <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">Observações:</div>
                        <div style="font-size: 10px;">${justObs}</div>
                    </div>
                </td>
                <td width="250" valign="top">
                    <table width="100%" style="font-size: 12px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; font-weight: 900;">TOTAL ESTIMADO:</td>
                            <td align="right" style="padding: 10px 0; font-size: 14px; font-weight: 900;">${formatMoney(total)}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <div style="margin-top: 50px; text-align: center; width: 300px; border-top: 1px solid #000; padding-top: 5px; font-size: 10px; font-weight: bold; margin-left: auto; margin-right: auto;">
            ASSINATURA RESPONSÁVEL
        </div>
    </div>`;
}

function printOC(id) {
    document.getElementById('print-area').innerHTML = buildHTMLOC(id);
    setTimeout(() => window.print(), 300);
}

async function downloadOCPDF(id) {
    showLoading(true);
    const logsOC = STATE.logs.filter(l => String(l.id) === String(id) && (l.tipo === 'oc_pendente' || l.tipo === 'compra'));
    if (!logsOC.length) {
        showLoading(false);
        return showToast("O.C. não encontrada", true);
    }

    const o = logsOC[0];
    const obra = STATE.obras.find(x => x.id == o.obra_id) || { nome: 'Sem Obra', endereco: '-' };
    const forn = STATE.fornecedores.find(x => x.id == o.fornecedor_id) || { nome: 'A Definir', documento: '', telefone: '' };

    let justObs = o.observacao || 'Nenhuma observação informada.';
    if (justObs.includes(' | Obs: ')) {
        const parts = justObs.split(' | Obs: ');
        justObs = parts[0] + '\n' + parts[1];
    }

    let total = 0;
    const bodyTabela = [
        [
            { text: 'Descrição', style: 'tableHeader', alignment: 'left' },
            { text: 'Qtd', style: 'tableHeader', alignment: 'center' },
            { text: 'Unit. Estimado', style: 'tableHeader', alignment: 'right' },
            { text: 'Total Estimado', style: 'tableHeader', alignment: 'right' }
        ]
    ];

    logsOC.forEach((i, index) => {
        const valor = parseFloat(i.valor_total);
        total += valor;
        const price = valor / parseFloat(i.quantidade);
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';

        bodyTabela.push([
            { text: i.produto_nome, fillColor: bgColor, margin: [4, 6, 4, 6], fontSize: 10 },
            { text: i.quantidade.toString(), alignment: 'center', fillColor: bgColor, margin: [4, 6, 4, 6], fontSize: 10 },
            { text: formatMoney(price), alignment: 'right', fillColor: bgColor, margin: [4, 6, 4, 6], fontSize: 10 },
            { text: formatMoney(valor), alignment: 'right', fillColor: bgColor, margin: [4, 6, 4, 6], fontSize: 10 }
        ]);
    });

    async function getLogoBase64(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    const logoBase64 = await getLogoBase64("https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png");

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        defaultStyle: { font: 'Roboto' },

        background: function (currentPage, pageCount) {
            return {
                canvas: [
                    {
                        type: 'rect',
                        x: 25, y: 25, w: 545.28, h: 791.89,
                        lineWidth: 1, lineColor: '#000000'
                    }
                ]
            };
        },

        content: [
            {
                table: {
                    widths: [90, '*', 'auto'],
                    body: [
                        [
                            logoBase64 ? { image: logoBase64, width: 80, alignment: 'center', margin: [0, 0, 10, 0] } : '',
                            {
                                text: [
                                    { text: 'RV NEGÓCIOS E COMPANHIA\n', fontSize: 16, bold: true, color: '#1d4ed8' },
                                    { text: 'CNPJ: 61.893.912/0001-24\n', fontSize: 9, color: '#475569', lineHeight: 1.3 },
                                    { text: 'Rua Mineiros, 530 | Jataí - GO | (64) 99981-5852', fontSize: 9, color: '#475569', lineHeight: 1.3 }
                                ],
                                margin: [0, 10, 0, 0]
                            },
                            {
                                text: [
                                    { text: 'ORDEM DE COMPRA\n', fontSize: 13, bold: true },
                                    { text: `Nº: ${o.id}\n`, fontSize: 9 },
                                    { text: `Emissão: ${formatDate(o.data)}\n`, fontSize: 9 },
                                    { text: `Fase: ${o.fase_obra || '-'}`, fontSize: 9 }
                                ],
                                alignment: 'right', margin: [0, 10, 0, 0]
                            }
                        ]
                    ]
                },
                layout: 'noBorders', margin: [0, 0, 0, 10]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2 }], margin: [0, 0, 0, 20] },
            {
                columns: [
                    {
                        width: '48%',
                        table: {
                            widths: ['*'],
                            body: [
                                [{ text: 'DADOS DO FORNECEDOR', fillColor: '#f1f5f9', bold: true, fontSize: 8, margin: [4, 4, 4, 4] }],
                                [{ text: `${forn.nome}\nDoc: ${forn.documento || '-'}\nTel: ${forn.telefone || '-'}`, fontSize: 9, margin: [6, 8, 6, 8] }]
                            ]
                        },
                        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#000000', vLineColor: () => '#000000' }
                    },
                    { width: '4%', text: '' },
                    {
                        width: '48%',
                        table: {
                            widths: ['*'],
                            body: [
                                [{ text: 'DESTINO (OBRA)', fillColor: '#f1f5f9', bold: true, fontSize: 8, margin: [4, 4, 4, 4] }],
                                [{ text: `${obra.nome}\nEndereço: ${obra.endereco || '-'}`, fontSize: 9, margin: [6, 8, 6, 8] }]
                            ]
                        },
                        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#000000', vLineColor: () => '#000000' }
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            {
                table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto'], body: bodyTabela },
                layout: {
                    hLineWidth: function (i, node) { return (i === 0 || i === node.table.body.length) ? 0 : 1; },
                    vLineWidth: function () { return 0; },
                    hLineColor: function () { return '#000000'; },
                    paddingLeft: function () { return 4; }, paddingRight: function () { return 4; }
                },
                margin: [0, 0, 0, 20]
            },
            {
                columns: [
                    {
                        width: '60%',
                        table: {
                            widths: ['*'],
                            body: [
                                [{ text: [{ text: 'Observações:\n', fontSize: 9, bold: true }, { text: justObs, fontSize: 9 }], margin: [6, 6, 6, 25] }]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#cbd5e1', vLineColor: () => '#cbd5e1',
                            hLineStyle: () => ({ dash: { length: 4, space: 4 } }), vLineStyle: () => ({ dash: { length: 4, space: 4 } })
                        }
                    },
                    {
                        width: '40%', alignment: 'right', margin: [0, 10, 0, 0],
                        text: [{ text: 'TOTAL ESTIMADO:   ', bold: true, fontSize: 10 }, { text: formatMoney(total), bold: true, fontSize: 13 }]
                    }
                ],
                margin: [0, 0, 0, 60]
            },
            { text: '_________________________________________________\nASSINATURA RESPONSÁVEL', alignment: 'center', fontSize: 9, bold: true }
        ],
        styles: { tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#0f172a', margin: [4, 6, 4, 6] } }
    };

    pdfMake.createPdf(docDefinition).download(`Ordem_Compra_${id}.pdf`);
    showLoading(false);
    showToast("PDF Baixado com Sucesso!");
}

function buildHTMLRomaneio(id) {
    const logsOC = STATE.logs.filter(l => String(l.id) === String(id) && (l.tipo === 'oc_pendente' || l.tipo === 'compra'));
    if (!logsOC.length) return '';

    const o = logsOC[0];
    const obra = STATE.obras.find(x => x.id == o.obra_id) || { nome: 'Sem Obra', endereco: '-' };
    const forn = STATE.fornecedores.find(x => x.id == o.fornecedor_id) || { nome: 'A Definir', documento: '', telefone: '' };

    let fullObs = o.observacao || 'Nenhuma observação informada.';
    let justObs = fullObs;
    if (fullObs.includes(' | Obs: ')) {
        const parts = fullObs.split(' | Obs: ');
        justObs = parts[0] + '<br>' + parts[1];
    }

    const linhas = logsOC.map((i, index) => {
        const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `<tr style="background-color: ${bg};">
            <td align="center" style="border-bottom: 1px solid #000; padding: 10px; width: 50px;">
                <div style="width: 20px; height: 20px; border: 2px solid #0f172a; border-radius: 4px; margin: 0 auto;"></div>
            </td>
            <td align="center" style="border-bottom: 1px solid #000; padding: 10px; font-size: 14px; font-weight: 900;">${i.quantidade}</td>
            <td style="border-bottom: 1px solid #000; padding: 10px; font-size: 13px;">${i.produto_nome}</td>
        </tr>`;
    }).join('');

    return `
    <div style="font-family: 'Helvetica', sans-serif; padding: 15px; width: 100%; border: 1px solid #000; min-height: 27.5cm;">
        <table width="100%" style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
            <tr>
                <td width="130" valign="middle" style="border-right: 1px solid #e2e8f0; padding-right: 15px;">
                    <img src="https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png" crossorigin="anonymous" style="max-height: 80px; display: block; margin: 0 auto;" />
                </td>
                <td valign="middle" style="padding-left: 15px;">
                    <h2 style="margin: 0; color: #1d4ed8; font-size: 20px; font-weight: 800;">RV NEGÓCIOS E COMPANHIA</h2>
                    <div style="font-size: 11px; color: #475569; margin-top: 5px; line-height: 1.4;">CNPJ: 61.893.912/0001-24</div>
                    <div style="font-size: 11px; color: #475569; line-height: 1.4;">Rua Mineiros, 530 | Jataí - GO | (64) 99981-5852</div>
                </td>
                <td align="right" valign="top">
                    <h2 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 900; background-color: #0f172a; color: white; padding: 5px 10px; display: inline-block;">ROMANEIO DE RETIRADA</h2>
                    <div style="font-size: 12px; margin-top: 5px;"><strong>O.C. Referência Nº:</strong> ${o.id}</div>
                    <div style="font-size: 12px;"><strong>Emissão:</strong> ${formatDate(o.data)}</div>
                    <div style="font-size: 12px;"><strong>Fase:</strong> ${o.fase_obra || '-'}</div>
                </td>
            </tr>
        </table>
        <table width="100%" style="margin-bottom: 20px;">
            <tr>
                <td width="48%" valign="top" style="border: 1px solid #000; padding: 0;">
                    <div style="background-color: #f1f5f9; padding: 5px; font-size: 10px; font-weight: bold; border-bottom: 1px solid #000;">RETIRAR MATERIAL EM:</div>
                    <div style="padding: 10px; font-size: 12px;">
                        <strong>${forn.nome}</strong><br>
                        Doc: ${forn.documento || '-'}<br>
                        Tel: ${forn.telefone || '-'}
                    </div>
                </td>
                <td width="4%"></td>
                <td width="48%" valign="top" style="border: 1px solid #000; padding: 0;">
                    <div style="background-color: #f1f5f9; padding: 5px; font-size: 10px; font-weight: bold; border-bottom: 1px solid #000;">ENTREGAR MATERIAL EM:</div>
                    <div style="padding: 10px; font-size: 12px;">
                        <strong>${obra.nome}</strong><br>
                        Endereço: ${obra.endereco || '-'}
                    </div>
                </td>
            </tr>
        </table>
        <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th align="center" style="background-color: #0f172a; color: #fff; padding: 10px; width: 50px;">OK</th>
                    <th align="center" style="background-color: #0f172a; color: #fff; padding: 10px; width: 80px;">Qtd</th>
                    <th align="left" style="background-color: #0f172a; color: #fff; padding: 10px;">Descrição do Material</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
        <div style="border: 1px dashed #cbd5e1; padding: 10px; min-height: 50px; margin-bottom: 40px;">
            <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">Observações da Cotação:</div>
            <div style="font-size: 11px;">${justObs}</div>
        </div>
        <table width="100%" style="margin-top: 80px;">
            <tr>
                <td align="center" width="45%">
                    <div style="border-top: 1px solid #000; padding-top: 5px; font-size: 11px; font-weight: bold;">
                        ASSINATURA MOTORISTA / RETIRADA
                    </div>
                </td>
                <td width="10%"></td>
                <td align="center" width="45%">
                    <div style="border-top: 1px solid #000; padding-top: 5px; font-size: 11px; font-weight: bold;">
                        ASSINATURA RECEBIMENTO (OBRA)
                    </div>
                </td>
            </tr>
        </table>
    </div>`;
}

function printRomaneio(id) {
    document.getElementById('print-area').innerHTML = buildHTMLRomaneio(id);
    setTimeout(() => window.print(), 300);
}

function abrirModalTransferencia(ocId) {
    document.getElementById('transf-oc-id').value = ocId;
    document.getElementById('transf-senha').value = '';
    document.getElementById('modal-transf-portal').classList.remove('hidden');
}

async function executarTransferenciaPortal() {
    const senhaDigitada = document.getElementById('transf-senha').value;
    const ocId = document.getElementById('transf-oc-id').value;

    if (senhaDigitada !== SENHA_SECRETA) {
        return showToast("Senha Incorreta! Transferência abortada.", true);
    }

    showLoading(true);

    const itensOC = STATE.logs.filter(l => String(l.id) === String(ocId) && (l.tipo === 'oc_pendente' || l.tipo === 'compra'));

    if (!itensOC.length) {
        showLoading(false);
        return showToast("Erro: Itens da O.C. não encontrados.", true);
    }

    try {
        const { data: ultimosLogs, error: errLogs } = await sb.from('logs').select('id').order('id', { ascending: false }).limit(1);

        let nextId = 1;
        if (ultimosLogs && ultimosLogs.length > 0) {
            nextId = parseInt(ultimosLogs[0].id) + 1;
        }

        const dataHojeTexto = new Date().toLocaleDateString('pt-BR');

        const insertsRVPortal = itensOC.map(item => {
            return {
                uid: crypto.randomUUID(),
                id: nextId,
                tipo: 'orcamento',
                produto_nome: item.produto_nome,
                quantidade: parseFloat(item.quantidade),
                data: dataHojeTexto,
                observacao: item.observacao || 'Gerado automaticamente via RV Negócios',
                valor_total: parseFloat(item.valor_total),
                cliente_nome: 'RV Negócios',
                forma_pagamento: '',
                status: 'ATIVO',
                status_entrega: '',
                qtd_entregue: 0,
                desconto: 0,
                status_financeiro: 'PENDENTE',
                vencimento: '',
                valor_pago: 0,
                endereco_entrega: ''
            };
        });

        const { error: erroInsert } = await sb.from('logs').insert(insertsRVPortal);

        if (erroInsert) throw erroInsert;

        document.getElementById('modal-transf-portal').classList.add('hidden');
        showLoading(false);
        showToast("Sucesso! Orçamento gerado na RV Portal.");

    } catch (erro) {
        showLoading(false);
        showToast("Erro na comunicação: " + erro.message, true);
    }
}