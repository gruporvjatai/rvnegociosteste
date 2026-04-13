// ====== TERCEIRIZADOS ======

function updateSelectTercObra() {
    const el = document.getElementById('terc-obra');
    if (el) el.innerHTML = '<option value="">-- Sem obra fixa --</option>' + STATE.obras.map(o => `<option value="${o.id}">${o.nome}</option>`).join('');
}

function renderTerceirizados() {
    updateSelectTercObra();

    const term = document.getElementById('terc-search').value.toLowerCase();
    const mes = document.getElementById('terc-filter-mes').value;
    const ano = document.getElementById('terc-filter-ano').value;
    const statusFiltro = document.getElementById('terc-filter-status').value;
    const pagFiltro = document.getElementById('terc-filter-pagamento').value;
    const list = document.getElementById('terc-list');

    let fil = STATE.terceirizados.filter(t => {
        const bateNome = t.nome.toLowerCase().includes(term) || (t.cpf_cnpj || '').includes(term);
        let bateStatus = true;
        if (statusFiltro !== "todos") {
            const isAtivo = statusFiltro === "true";
            bateStatus = (t.ativo === isAtivo || (isAtivo && t.ativo === undefined));
        }
        return bateNome && bateStatus;
    });

    fil.sort((a, b) => a.nome.localeCompare(b.nome));

    const htmlLinhas = fil.map(t => {
        const obraAtual = STATE.obras.find(o => o.id == t.obra_atual_id);
        const nomeObra = obraAtual ? obraAtual.nome : '<span class="text-slate-400 italic font-normal">Geral</span>';
        const valorMetro = parseFloat(t.valor_metro || 0);

        const producaoDoMes = STATE.producao_terc.filter(p => {
            if (p.terceirizado_id !== t.id) return false;
            const dt = new Date(p.data_registro);
            const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
            const a = String(dt.getUTCFullYear());
            return m === mes && a === ano;
        });

        const metrosPendentes = producaoDoMes.filter(p => p.status !== 'PAGO').reduce((acc, p) => acc + parseFloat(p.metros || 0), 0);
        const metrosPagos = producaoDoMes.filter(p => p.status === 'PAGO').reduce((acc, p) => acc + parseFloat(p.metros || 0), 0);

        if (pagFiltro === 'pendente' && metrosPendentes === 0) return '';
        if (pagFiltro === 'pago' && metrosPagos === 0) return '';

        const valorPendente = metrosPendentes * valorMetro;
        const valorPago = metrosPagos * valorMetro;

        return `<tr class="border-b hover:bg-slate-50 transition ${t.ativo === false ? 'opacity-60 bg-red-50' : ''}">
            <td class="p-3">
                <div class="font-black text-slate-800 text-sm uppercase truncate max-w-[200px]">${t.nome}</div>
                <div class="flex items-center gap-3 mt-0.5">
                    <span class="text-[10px] text-blue-700 font-bold"><i data-lucide="building" class="w-3 h-3 inline"></i> ${nomeObra}</span>
                    <span class="text-[10px] text-slate-400 font-bold">PIX: ${t.chave_pix || '-'}</span>
                </div>
            </td>
            <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-1">
                    <span class="font-bold text-slate-600 text-xs">${formatMoney(valorMetro)}</span>
                    <span class="text-[9px] text-slate-400 font-bold uppercase">/m</span>
                </div>
            </td>
            <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-3">
                    <span class="text-[11px] font-black text-orange-600 whitespace-nowrap">${metrosPendentes.toFixed(2)}m <span class="text-[9px] text-slate-400 font-bold">PEND.</span></span>
                    <span class="text-slate-200">|</span>
                    <span class="text-[11px] font-black text-green-600 whitespace-nowrap">${metrosPagos.toFixed(2)}m <span class="text-[9px] text-slate-400 font-bold">PAGO</span></span>
                </div>
            </td>
            <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-3">
                    <span class="font-black text-sm text-red-600 whitespace-nowrap">${formatMoney(valorPendente)}</span>
                    <span class="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded whitespace-nowrap">Pago: ${formatMoney(valorPago)}</span>
                </div>
            </td>
            <td class="p-3">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="openTercProdModal('${t.id}')" class="px-2 py-1.5 bg-slate-800 text-white hover:bg-black rounded shadow font-bold text-[10px] flex items-center gap-1 whitespace-nowrap"><i data-lucide="ruler" width="12"></i> MEDIÇÃO</button>
                    ${valorPendente > 0 ? `<button onclick="baixarPagamentoTerc('${t.id}')" class="px-2 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded shadow font-bold text-[10px] flex items-center gap-1 whitespace-nowrap"><i data-lucide="check-circle" width="12"></i> BAIXAR</button>` : ''}
                    <button onclick="openTercForm('${t.id}')" class="p-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded flex items-center justify-center"><i data-lucide="edit-3" width="14"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');

    list.innerHTML = htmlLinhas || `<tr><td colspan="5" class="p-8 text-center text-slate-400 font-medium">Nenhuma produção atende a este filtro no mês selecionado.</td></tr>`;
    lucide.createIcons();
}

function openTercForm(id) {
    updateSelectTercObra();
    document.getElementById('terc-form-container').classList.remove('hidden');
    if (id) {
        const t = STATE.terceirizados.find(x => x.id == id);
        document.getElementById('terc-id').value = t.id;
        document.getElementById('terc-name').value = t.nome;
        document.getElementById('terc-cpf').value = t.cpf_cnpj || '';
        document.getElementById('terc-rg').value = t.rg || '';
        document.getElementById('terc-phone').value = t.telefone || '';
        document.getElementById('terc-pix').value = t.chave_pix || '';
        document.getElementById('terc-endereco').value = t.endereco || '';
        document.getElementById('terc-obra').value = t.obra_atual_id || '';
        document.getElementById('terc-val-metro').value = t.valor_metro || '';
    } else {
        document.getElementById('terc-form-container').querySelector('form').reset();
        document.getElementById('terc-id').value = '';
    }
}

async function saveTerc(e) {
    e.preventDefault();
    showLoading(true);
    const isNew = !document.getElementById('terc-id').value;
    const payload = {
        nome: document.getElementById('terc-name').value,
        cpf_cnpj: document.getElementById('terc-cpf').value,
        rg: document.getElementById('terc-rg').value,
        telefone: document.getElementById('terc-phone').value,
        chave_pix: document.getElementById('terc-pix').value,
        endereco: document.getElementById('terc-endereco').value,
        obra_atual_id: document.getElementById('terc-obra').value || null,
        valor_metro: parseFloat(document.getElementById('terc-val-metro').value) || 0
    };

    if (isNew) { payload.id = crypto.randomUUID(); payload.ativo = true; }
    else { payload.id = document.getElementById('terc-id').value; }

    const { error } = await sb.from('jsp_terceirizados').upsert(payload);
    if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    document.getElementById('terc-form-container').classList.add('hidden');
    showToast("Terceirizado salvo com sucesso!");
    loadData();
}

async function toggleStatusTerc(id, isAtivo) {
    if (!confirm(`Tem certeza que deseja ${isAtivo ? 'DESATIVAR' : 'REATIVAR'} este terceirizado?`)) return;
    showLoading(true);
    const { error } = await sb.from('jsp_terceirizados').update({ ativo: !isAtivo }).eq('id', id);
    if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
    showToast("Status atualizado!");
    loadData();
}

// --- Produção Terceirizados ---

function openTercProdModal(id) {
    const t = STATE.terceirizados.find(x => x.id == id);
    if (!t) return;

    document.getElementById('prod-terc-id').value = t.id;
    document.getElementById('prod-terc-subtitle').innerText = `${t.nome} - Valor/Metro: ${formatMoney(t.valor_metro)}`;
    document.getElementById('prod-terc-data').value = getTodayDate();
    document.getElementById('prod-terc-metros').value = '';

    renderTercProdList(t.id);
    document.getElementById('modal-producao-terc').classList.remove('hidden');
}

function renderTercProdList(id) {
    const mes = document.getElementById('terc-filter-mes').value;
    const ano = document.getElementById('terc-filter-ano').value;
    const t = STATE.terceirizados.find(x => x.id == id);

    let prod = STATE.producao_terc.filter(p => {
        if (p.terceirizado_id !== id) return false;
        const dt = new Date(p.data_registro);
        const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
        const a = dt.getUTCFullYear();
        return m === mes && String(a) === ano;
    });

    prod.sort((a, b) => new Date(b.data_registro) - new Date(a.data_registro));

    let totalMetros = 0;

    document.getElementById('prod-terc-list-body').innerHTML = prod.map(p => {
        totalMetros += parseFloat(p.metros);
        const isPago = p.status === 'PAGO';
        return `<tr class="border-b ${isPago ? 'bg-green-50' : ''}">
            <td class="p-2 text-xs">${formatDate(p.data_registro)}</td>
            <td class="p-2 text-xs font-black text-center text-indigo-700">${parseFloat(p.metros).toFixed(2)}m</td>
            <td class="p-2 text-center">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${isPago ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">${isPago ? 'PAGO' : 'PEND.'}</span>
            </td>
            <td class="p-2 text-xs text-slate-500 truncate">${p.descricao || '-'}</td>
            <td class="p-2 text-right">
                <button onclick="deleteTercProd('${p.id}')" class="text-red-400 hover:text-red-600 p-1"><i data-lucide="trash-2" width="12"></i></button>
            </td>
        </tr>`;
    }).join('');

    const valorMetro = parseFloat(t?.valor_metro || 0);
    const totalVal = totalMetros * valorMetro;

    const sumEl = document.getElementById('prod-terc-total-metros');
    const sumValEl = document.getElementById('prod-terc-total-valor');
    if (sumEl) sumEl.innerText = totalMetros.toFixed(2) + 'm';
    if (sumValEl) sumValEl.innerText = formatMoney(totalVal);

    lucide.createIcons();
}

async function saveTercProd() {
    const tercId = document.getElementById('prod-terc-id').value;
    const metros = parseFloat(document.getElementById('prod-terc-metros').value);
    const data = document.getElementById('prod-terc-data').value;
    const descricao = document.getElementById('prod-terc-desc')?.value || '';

    if (!tercId || isNaN(metros) || metros <= 0) return showToast("Informe a metragem corretamente!", true);
    showLoading(true);

    const { error } = await sb.from('jsp_producao_terc').insert([{
        id: crypto.randomUUID(),
        terceirizado_id: tercId,
        metros: metros,
        data_registro: data,
        status: 'PENDENTE',
        descricao: descricao
    }]);

    if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    document.getElementById('prod-terc-metros').value = '';
    if (document.getElementById('prod-terc-desc')) document.getElementById('prod-terc-desc').value = '';
    showToast("Medição registrada!");
    await loadData();
    renderTercProdList(tercId);
}

async function deleteTercProd(id) {
    if (!confirm("Excluir este registro?")) return;
    showLoading(true);
    const { error } = await sb.from('jsp_producao_terc').delete().eq('id', id);
    if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }
    showToast("Registro excluído!");
    const tercId = document.getElementById('prod-terc-id').value;
    await loadData();
    renderTercProdList(tercId);
}

async function baixarPagamentoTerc(tercId) {
    if (!confirm("Confirmar baixa de todos os valores PENDENTES deste terceirizado no mês filtrado?")) return;
    showLoading(true);

    const mes = document.getElementById('terc-filter-mes').value;
    const ano = document.getElementById('terc-filter-ano').value;

    const pendentes = STATE.producao_terc.filter(p => {
        if (p.terceirizado_id !== tercId || p.status === 'PAGO') return false;
        const dt = new Date(p.data_registro);
        return String(dt.getUTCMonth() + 1).padStart(2, '0') === mes && String(dt.getUTCFullYear()) === ano;
    });

    if (!pendentes.length) { showLoading(false); return showToast("Nenhum valor pendente encontrado.", true); }

    const ids = pendentes.map(p => p.id);
    const { error } = await sb.from('jsp_producao_terc').update({ status: 'PAGO' }).in('id', ids);

    if (error) { showLoading(false); return showToast("Erro: " + error.message, true); }

    showToast("Pagamento baixado com sucesso!");
    loadData();
}

function imprimirExtratoTerc() {
    const tercId = document.getElementById('prod-terc-id').value;
    if (!tercId) return showToast("Nenhum terceirizado selecionado.", true);

    const t = STATE.terceirizados.find(x => x.id == tercId);
    const mes = document.getElementById('terc-filter-mes').value;
    const ano = document.getElementById('terc-filter-ano').value;
    const hoje = new Date().toLocaleDateString('pt-BR');

    const prodDoMes = STATE.producao_terc.filter(p => {
        if (p.terceirizado_id !== tercId) return false;
        const dt = new Date(p.data_registro);
        return String(dt.getUTCMonth() + 1).padStart(2, '0') === mes && String(dt.getUTCFullYear()) === ano;
    });

    const metrosPendentes = prodDoMes.filter(p => p.status !== 'PAGO').reduce((acc, p) => acc + parseFloat(p.metros || 0), 0);
    const metrosPagos = prodDoMes.filter(p => p.status === 'PAGO').reduce((acc, p) => acc + parseFloat(p.metros || 0), 0);
    const totalMetros = metrosPendentes + metrosPagos;
    const valorMetro = parseFloat(t.valor_metro || 0);
    const valorPendente = metrosPendentes * valorMetro;
    const valorPago = metrosPagos * valorMetro;
    const valorTotal = totalMetros * valorMetro;

    if (totalMetros === 0) return showToast("Não há produção registrada para este mês.", true);

    const htmlRecibo = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; width: 100%; color: #1e293b; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1d4ed8; padding-bottom: 15px; margin-bottom: 25px;">
                <img src="https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png" style="height: 60px;" />
                <div style="text-align: right;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; text-transform: uppercase;">Extrato de Produção</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #1d4ed8; font-weight: bold;">Competência: ${mes}/${ano}</p>
                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Emitido em: ${hoje}</p>
                </div>
            </div>
            <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background-color: #f8fafc;">
                    <h3 style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Dados da Contratante</h3>
                    <div style="font-size: 13px; line-height: 1.5; font-weight: bold; color: #334155;">
                        RV NEGÓCIOS E COMPANHIA<br>
                        <span style="font-weight: normal; color: #64748b;">CNPJ: 61.893.912/0001-24</span>
                    </div>
                </div>
                <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Dados do Profissional</h3>
                    <div style="font-size: 13px; line-height: 1.5;">
                        <strong style="color: #0f172a; font-size: 14px;">${t.nome.toUpperCase()}</strong><br>
                        <span style="color: #475569;">CPF/CNPJ:</span> ${t.cpf_cnpj || 'Não informado'}<br>
                        <span style="color: #475569;">CHAVE PIX:</span> <strong style="color: #1d4ed8;">${t.chave_pix || 'Não cadastrada'}</strong>
                    </div>
                </div>
            </div>
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Demonstrativo Financeiro</h3>
            <table width="100%" style="border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
                <thead>
                    <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
                        <th style="padding: 12px; border: 1px solid #cbd5e1;">Situação da Medição</th>
                        <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">Metragem</th>
                        <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">Vlr. Unitário</th>
                        <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #16a34a;">SERVIÇOS JÁ PAGOS</td>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: #16a34a;">${metrosPagos.toFixed(2)} m</td>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">${formatMoney(valorMetro)}</td>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: right; color: #16a34a;">${formatMoney(valorPago)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #ea580c;">SERVIÇOS PENDENTES</td>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: #ea580c;">${metrosPendentes.toFixed(2)} m</td>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">${formatMoney(valorMetro)}</td>
                        <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: right; color: #ea580c; font-weight: bold;">${formatMoney(valorPendente)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr style="background-color: #f8fafc; font-weight: 900; font-size: 15px;">
                        <td style="padding: 15px 12px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">PRODUÇÃO TOTAL DO MÊS:</td>
                        <td style="padding: 15px 12px; border: 1px solid #cbd5e1; text-align: center; color: #1d4ed8;">${totalMetros.toFixed(2)} m</td>
                        <td style="padding: 15px 12px; border: 1px solid #cbd5e1; text-align: center;">-</td>
                        <td style="padding: 15px 12px; border: 1px solid #cbd5e1; text-align: right; color: #1d4ed8;">${formatMoney(valorTotal)}</td>
                    </tr>
                </tfoot>
            </table>
            <div style="background-color: ${valorPendente > 0 ? '#fff7ed' : '#f0fdf4'}; border: 2px solid ${valorPendente > 0 ? '#fdba74' : '#86efac'}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 50px;">
                <span style="font-size: 13px; font-weight: bold; color: ${valorPendente > 0 ? '#c2410c' : '#16a34a'}; text-transform: uppercase;">
                    ${valorPendente > 0 ? 'SALDO LÍQUIDO A RECEBER NESTE EXTRATO' : 'NÃO HÁ VALORES PENDENTES. TUDO PAGO!'}
                </span>
                <div style="font-size: 32px; font-weight: 900; color: ${valorPendente > 0 ? '#b91c1c' : '#15803d'}; margin-top: 5px;">${formatMoney(valorPendente)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 80px;">
                <div style="text-align: center; width: 45%; border-top: 1px solid #94a3b8; padding-top: 10px;">
                    <strong style="font-size: 13px; color: #0f172a;">RV NEGÓCIOS E COMPANHIA</strong><br>
                    <span style="font-size: 11px; color: #64748b;">Contratante</span>
                </div>
                <div style="text-align: center; width: 45%; border-top: 1px solid #94a3b8; padding-top: 10px;">
                    <strong style="font-size: 13px; color: #0f172a;">${t.nome.toUpperCase()}</strong><br>
                    <span style="font-size: 11px; color: #64748b;">Profissional Contratado</span>
                </div>
            </div>
            <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                Declaro para os devidos fins que o demonstrativo acima confere com a medição de serviços prestados.<br>
                Jataí - GO, ${hoje}.
            </div>
        </div>
    `;

    document.getElementById('print-area').innerHTML = htmlRecibo;
    setTimeout(() => window.print(), 400);
}
