// ====== CRUD EQUIPE E PONTO ======
function renderEquipe() {
    const term = document.getElementById('eqp-search').value.toLowerCase();
    const obraFiltro = document.getElementById('eqp-obra-filter').value;
    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;
    const statusFiltro = document.getElementById('eqp-filter-status').value;

    const list = document.getElementById('equipe-list');

    let fil = STATE.equipe.filter(e => e.nome.toLowerCase().includes(term) || (e.categoria || '').toLowerCase().includes(term));
    if (obraFiltro) fil = fil.filter(e => e.obra_atual_id == obraFiltro);

    if (statusFiltro !== "todos") {
        const isAtivo = statusFiltro === "true";
        fil = fil.filter(e => e.ativo === isAtivo || (isAtivo && e.ativo === undefined));
    }

    fil.sort((a, b) => a.nome.localeCompare(b.nome));

    list.innerHTML = fil.map(e => {
        const phoneClean = (e.telefone || '').replace(/\D/g, '');
        const wppBtn = phoneClean ? `<a href="https://wa.me/55${phoneClean}" target="_blank" class="p-1.5 border border-green-200 text-green-600 hover:bg-green-50 rounded bg-green-50/50" title="WhatsApp"><i data-lucide="message-circle" width="14"></i></a>` : '';

        const obraAtual = STATE.obras.find(o => o.id == e.obra_atual_id);
        const nomeObra = obraAtual ? obraAtual.nome : '<span class="text-slate-400 italic">Sem obra fixa</span>';
        const diaria = parseFloat(e.valor_diaria || 0);

        let pt = STATE.ponto.find(x => x.equipe_id == e.id && x.mes === mes && x.ano === ano);
        let dias = pt ? parseFloat(pt.total_dias || 0) : 0;
        let total = pt ? parseFloat(pt.valor_total || 0) : (dias * diaria);
        let status = pt ? pt.status : 'PENDENTE';
        let isPago = status === 'PAGO';
        let btnDocColor = e.contrato_assinado ? 'bg-green-600 text-white' : 'bg-slate-800 text-white';

        return `<tr class="border-b hover:bg-slate-50 transition ${e.ativo === false ? 'opacity-60 bg-red-50' : ''}">
            <td class="p-2">
                <div class="font-bold text-slate-800 text-sm">${e.nome} ${e.ativo === false ? '<span class="text-[9px] text-red-500 font-bold">(DESATIVADO)</span>' : ''}</div>
                <div class="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase font-bold inline-block mt-0.5">${e.categoria || 'Geral'}</div>
            </td>
            <td class="p-2 text-xs font-bold text-blue-700"><i data-lucide="building" class="w-3 h-3 inline"></i> ${nomeObra}</td>
            <td class="p-2 text-center">
                <div class="font-bold text-slate-700 text-xs">${formatMoney(diaria)} <span class="text-[9px] text-slate-400 font-normal">/dia</span></div>
            </td>
            <td class="p-2 text-center">
                <div class="text-xs font-black ${dias > 0 ? 'text-indigo-600' : 'text-slate-400'}">${dias} dias</div>
            </td>
            <td class="p-2 text-right">
                <div class="font-black text-sm ${isPago ? 'text-slate-400' : 'text-green-700'}">${formatMoney(total)}</div>
            </td>
            <td class="p-2 text-center">
                <div class="flex items-center justify-center gap-1">
                    <span class="px-2 py-1 rounded text-[9px] font-bold ${isPago ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">${isPago ? 'PAGO' : 'PENDENTE'}</span>
                    ${isPago ? `<button onclick="estornarPagamentoPonto('${pt?.id}', '${e.id}')" class="text-slate-400 hover:text-red-500 transition ml-1" title="Estornar Pagamento e Cancelar Despesa"><i data-lucide="rotate-ccw" width="12"></i></button>` : ''}
                </div>
            </td>
            <td class="p-2 text-center">
                <div class="flex items-center justify-start gap-1">
                    ${!isPago ? `<button onclick="openPontoModal('${e.id}')" class="p-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded shadow font-bold text-[10px] flex items-center gap-1"><i data-lucide="calendar-check-2" width="12"></i> PONTO</button>` : ''}
                    <button onclick="imprimirRecibo('${e.id}', '${pt?.id}')" class="p-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded" title="Gerar Recibo"><i data-lucide="receipt" width="14"></i></button>
                    <button onclick="abrirModalDocumentos('${e.id}')" class="p-1.5 ${btnDocColor} rounded shadow" title="Contratos e Documentos"><i data-lucide="file-signature" width="14"></i></button>
                    <button onclick="openEquipeForm('${e.id}')" class="p-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><i data-lucide="edit-3" width="14"></i></button>
                    <button onclick="toggleStatusEquipe('${e.id}', ${e.ativo !== false})" class="p-1.5 border ${e.ativo !== false ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'} rounded" title="${e.ativo !== false ? 'Desativar / Demitir' : 'Reativar'}"><i data-lucide="power" width="14"></i></button>
                    ${wppBtn}
                    ${!isPago && total > 0 ? `<button onclick="pagarMesPonto('${pt?.id}', '${e.id}')" class="p-1.5 bg-green-600 text-white hover:bg-green-700 rounded shadow font-bold text-[10px] flex items-center gap-1"><i data-lucide="check-circle" width="12"></i> PAGAR</button>` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openEquipeForm(id) {
    document.getElementById('equipe-form-container').classList.remove('hidden');
    if (id) {
        const e = STATE.equipe.find(x => x.id == id);
        document.getElementById('eqp-id').value = e.id;
        document.getElementById('eqp-name').value = e.nome;
        document.getElementById('eqp-cat').value = e.categoria || '';
        document.getElementById('eqp-phone').value = e.telefone || '';
        document.getElementById('eqp-cpf').value = e.cpf || '';
        document.getElementById('eqp-rg').value = e.rg || '';
        document.getElementById('eqp-endereco').value = e.endereco || '';
        document.getElementById('eqp-obra').value = e.obra_atual_id || '';
        document.getElementById('eqp-diaria').value = e.valor_diaria || '';
        document.getElementById('eqp-pix').value = e.chave_pix || '';
        document.getElementById('eqp-contrato').value = e.data_contrato || '';
    } else {
        document.getElementById('equipe-form-container').querySelector('form').reset();
        document.getElementById('eqp-id').value = '';
    }
}

async function saveEquipe(e) {
    e.preventDefault();
    showLoading(true);
    const isNew = !document.getElementById('eqp-id').value;
    const payload = {
        nome: document.getElementById('eqp-name').value,
        categoria: document.getElementById('eqp-cat').value,
        telefone: document.getElementById('eqp-phone').value,
        cpf: document.getElementById('eqp-cpf').value,
        rg: document.getElementById('eqp-rg').value,
        endereco: document.getElementById('eqp-endereco').value,
        obra_atual_id: document.getElementById('eqp-obra').value || null,
        valor_diaria: parseFloat(document.getElementById('eqp-diaria').value) || 0,
        chave_pix: document.getElementById('eqp-pix').value,
        data_contrato: document.getElementById('eqp-contrato').value || null
    };

    if (isNew) {
        payload.id = crypto.randomUUID();
        payload.ativo = true;
        payload.contrato_assinado = false;
    } else {
        payload.id = document.getElementById('eqp-id').value;
    }

    const { error } = await sb.from('jsp_equipe').upsert(payload);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }

    document.getElementById('equipe-form-container').classList.add('hidden');
    showToast("Membro salvo na equipe!");
    loadData();
}

async function toggleStatusEquipe(id, isAtivo) {
    const acao = isAtivo ? "DESATIVAR (Demitir)" : "REATIVAR";
    if (!confirm(`Tem certeza que deseja ${acao} este colaborador?`)) return;

    showLoading(true);
    const { error } = await sb.from('jsp_equipe').update({ ativo: !isAtivo }).eq('id', id);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast(`Status atualizado com sucesso!`);
    loadData();
}

function getDiasNoMes(mes, ano) {
    return new Date(ano, mes, 0).getDate();
}

function openPontoModal(equipe_id) {
    const e = STATE.equipe.find(x => x.id == equipe_id);
    if (!e) return;

    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;
    currentPontoDiaria = parseFloat(e.valor_diaria || 0);

    document.getElementById('ponto-modal-subtitle').innerText = `${e.nome} - Mês: ${mes}/${ano} - Diária Base: ${formatMoney(currentPontoDiaria)}`;
    document.getElementById('ponto-equipe-id').value = e.id;

    window.modoPontoAtivo = null;
    window.diariasEletronicasAtivas = undefined;

    const primeiroDia = `${ano}-${mes.padStart(2, '0')}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const ultimoDiaStr = `${ano}-${mes.padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    document.getElementById('ponto-auto-data-ini').value = primeiroDia;
    document.getElementById('ponto-auto-data-fim').value = ultimoDiaStr;

    let pt = STATE.ponto.find(x => x.equipe_id == e.id && x.mes === mes && x.ano === ano);
    if (pt && pt.dias_marcados) {
        currentPontoDias = Array.isArray(pt.dias_marcados) ? pt.dias_marcados : JSON.parse(pt.dias_marcados);
    } else {
        currentPontoDias = [];
    }
    renderPontoGrid(mes, ano);

    selecionarModoPonto('selecao');
    document.getElementById('ponto-modal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function selecionarModoPonto(modo) {
    document.getElementById('ponto-view-selecao').classList.add('hidden');
    document.getElementById('ponto-view-manual').classList.add('hidden');
    document.getElementById('ponto-view-auto').classList.add('hidden');

    const btnVoltar = document.getElementById('ponto-btn-voltar');

    if (modo === 'selecao') {
        document.getElementById('ponto-view-selecao').classList.remove('hidden');
        btnVoltar.classList.add('hidden');
        window.modoPontoAtivo = null;
    } else if (modo === 'manual') {
        document.getElementById('ponto-view-manual').classList.remove('hidden');
        btnVoltar.classList.remove('hidden');
        window.modoPontoAtivo = 'manual';
    } else if (modo === 'auto') {
        document.getElementById('ponto-view-auto').classList.remove('hidden');
        btnVoltar.classList.remove('hidden');
        window.modoPontoAtivo = 'auto';

        document.getElementById('ponto-auto-tbody').innerHTML = '<tr><td colspan="4" class="text-center p-6 text-slate-400 font-bold text-xs">Clique em Buscar para carregar a folha.</td></tr>';
        document.getElementById('ponto-auto-total-dias').innerText = '0.00';
        document.getElementById('ponto-auto-total-valor').innerText = 'R$ 0,00';
        window.diariasEletronicasAtivas = undefined;
    }
}

function renderPontoGrid(mes, ano) {
    const grid = document.getElementById('ponto-grid');
    grid.innerHTML = '';

    const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
    const totalDiasMes = new Date(ano, mes, 0).getDate();

    let html = '';

    for (let x = 0; x < primeiroDiaSemana; x++) {
        html += `<div class="h-10"></div>`;
    }

    for (let i = 1; i <= totalDiasMes; i++) {
        const ativo = currentPontoDias.includes(i);
        const classeStatus = ativo
            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50';

        html += `
            <div onclick="toggleDiaPonto(${i})" 
                 class="h-10 flex items-center justify-center border rounded-lg font-bold text-sm cursor-pointer transition-all ${classeStatus}">
                ${i}
            </div>`;
    }

    grid.innerHTML = html;
    updatePontoTotais();
}

function toggleDiaPonto(dia) {
    if (currentPontoDias.includes(dia)) {
        currentPontoDias = currentPontoDias.filter(d => d !== dia);
    } else {
        currentPontoDias.push(dia);
    }

    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;
    renderPontoGrid(mes, ano);
}

function updatePontoTotais() {
    const totalDias = currentPontoDias.length;
    const valor = totalDias * currentPontoDiaria;
    document.getElementById('ponto-total-dias').innerText = totalDias;
    document.getElementById('ponto-total-valor').innerText = formatMoney(valor);
}

async function savePonto() {
    showLoading(true);
    const equipe_id = document.getElementById('ponto-equipe-id').value;
    const e = STATE.equipe.find(x => x.id == equipe_id);
    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;

    let totalDias = 0;

    if (window.modoPontoAtivo === 'auto' && window.diariasEletronicasAtivas !== undefined) {
        totalDias = window.diariasEletronicasAtivas;
    } else {
        totalDias = currentPontoDias.length;
    }

    const valorTotal = totalDias * currentPontoDiaria;

    let pt = STATE.ponto.find(x => x.equipe_id == equipe_id && x.mes === mes && x.ano === ano);
    const isNew = !pt;

    const payload = {
        equipe_id: equipe_id,
        obra_id: e.obra_atual_id,
        mes: mes,
        ano: ano,
        dias_marcados: (window.modoPontoAtivo === 'auto') ? [] : currentPontoDias,
        total_dias: totalDias,
        valor_diaria: currentPontoDiaria,
        valor_total: valorTotal,
        status: pt ? pt.status : 'PENDENTE'
    };

    if (!isNew) payload.id = pt.id;

    const { error } = await sb.from('jsp_ponto').upsert(payload);

    if (error) {
        showLoading(false);
        return showToast("Erro ao salvar ponto: " + error.message, true);
    }

    document.getElementById('ponto-modal').classList.add('hidden');
    showToast("Fechamento de Ponto salvo com sucesso!");
    loadData();
}

async function buscarRegistrosEletronicos() {
    showLoading(true);
    const funcId = document.getElementById('ponto-equipe-id').value;
    const e = STATE.equipe.find(x => x.id == funcId);

    if (!e || !e.obra_atual_id) {
        showLoading(false);
        return showToast("Erro: O colaborador precisa estar vinculado a uma obra.", true);
    }

    const dataIni = document.getElementById('ponto-auto-data-ini').value;
    const dataFim = document.getElementById('ponto-auto-data-fim').value;

    if (!dataIni || !dataFim) {
        showLoading(false);
        return showToast("Preencha as datas de início e fim.", true);
    }

    try {
        const { data, error } = await sb.from('jsp_ponto_diario')
            .select('*')
            .eq('funcionario_id', funcId)
            .eq('obra_id', e.obra_atual_id)
            .eq('status', 'VALIDADO')
            .gte('hora_registro', dataIni + 'T00:00:00Z')
            .lte('hora_registro', dataFim + 'T23:59:59Z')
            .order('hora_registro', { ascending: true });

        if (error) throw error;

        let diasTrabalhados = {};

        (data || []).forEach(ponto => {
            const dataDia = new Date(ponto.hora_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            if (!diasTrabalhados[dataDia]) diasTrabalhados[dataDia] = { pontos: [], rawDate: new Date(ponto.hora_registro) };

            diasTrabalhados[dataDia].pontos.push({
                tipo: ponto.tipo,
                hora: new Date(ponto.hora_registro)
            });
        });

        const diasArray = Object.values(diasTrabalhados).sort((a, b) => a.rawDate - b.rawDate);
        let totalDiarias = 0;
        const JORNADA_BASE_HORAS = 8;
        const TOLERANCIA_HORAS = 20 / 60;
        let htmlTabela = '';

        window.dadosFolhaImpressao = [];

        if (diasArray.length === 0) {
            document.getElementById('ponto-auto-tbody').innerHTML = '<tr><td colspan="4" class="text-center p-6 text-slate-400 font-bold text-xs">Nenhum registro validado neste período.</td></tr>';
            document.getElementById('ponto-auto-total-dias').innerText = '0.00';
            document.getElementById('ponto-auto-total-valor').innerText = 'R$ 0,00';
            window.diariasEletronicasAtivas = 0;
            showLoading(false);
            return;
        }

        diasArray.forEach(registro => {
            let pt = registro.pontos.sort((a, b) => a.hora - b.hora);

            let fracao = 0;
            let totalHoras = 0;

            let entradas = pt.filter(p => p.tipo === 'ENTRADA');
            let saidas = pt.filter(p => p.tipo === 'SAIDA');

            if (entradas.length > 0 && saidas.length > 0) {
                if (pt.length >= 4) {
                    let msManha = pt[1].hora - pt[0].hora;
                    let msTarde = pt[3].hora - pt[2].hora;

                    if (msManha > 0) totalHoras += msManha / (1000 * 60 * 60);
                    if (msTarde > 0) totalHoras += msTarde / (1000 * 60 * 60);
                } else {
                    let diffMilisegundos = saidas[saidas.length - 1].hora - entradas[0].hora;
                    let horasBrutas = diffMilisegundos / (1000 * 60 * 60);
                    if (horasBrutas >= 6) horasBrutas -= 1;
                    totalHoras = horasBrutas;
                }

                if (totalHoras >= (JORNADA_BASE_HORAS - TOLERANCIA_HORAS) && totalHoras < JORNADA_BASE_HORAS) {
                    totalHoras = JORNADA_BASE_HORAS;
                }

                fracao = totalHoras / JORNADA_BASE_HORAS;

                if (fracao > 1) fracao = 1;
                else if (fracao < 0) fracao = 0;
                else fracao = parseFloat(fracao.toFixed(2));

                totalDiarias += fracao;
            }

            const dataStr = registro.rawDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            const formatHoraHtml = (dateObj, isEntrada) => {
                if (!dateObj) return '<span class="text-slate-300 mx-0.5">--:--</span>';
                const horaStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                return isEntrada
                    ? `<span class="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold inline-block mx-0.5">${horaStr}</span>`
                    : `<span class="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold inline-block mx-0.5">${horaStr}</span>`;
            };

            let manhaHtml = `${formatHoraHtml(pt[0]?.hora, true)} <span class="text-slate-300 text-[10px] mx-1">➜</span> ${formatHoraHtml(pt[1]?.hora, false)}`;
            let tardeHtml = `${formatHoraHtml(pt[2]?.hora, true)} <span class="text-slate-300 text-[10px] mx-1">➜</span> ${formatHoraHtml(pt[3]?.hora, false)}`;

            let e1 = pt.length > 0 ? pt[0].hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '--:--';
            let s1 = pt.length > 1 ? pt[1].hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '--:--';
            let e2 = pt.length > 2 ? pt[2].hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '--:--';
            let s2 = pt.length > 3 ? pt[3].hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '--:--';

            window.dadosFolhaImpressao.push({ data: dataStr, e1: e1, s1: s1, e2: e2, s2: s2, fracao: fracao });

            htmlTabela += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-2 text-xs font-bold text-slate-700 text-center">${dataStr}</td>
                <td class="p-2 text-xs text-center whitespace-nowrap">${manhaHtml}</td>
                <td class="p-2 text-xs text-center whitespace-nowrap">${tardeHtml}</td>
                <td class="p-2 text-xs text-center font-black text-indigo-600">${fracao}</td>
            </tr>`;
        });

        document.getElementById('ponto-auto-tbody').innerHTML = htmlTabela;
        document.getElementById('ponto-auto-total-dias').innerText = totalDiarias.toFixed(2);

        let valorDiaria = parseFloat(e.valor_diaria || 0);
        let valorTotalPagar = totalDiarias * valorDiaria;
        document.getElementById('ponto-auto-total-valor').innerText = formatMoney(valorTotalPagar);

        window.diariasEletronicasAtivas = totalDiarias;

        showLoading(false);
        showToast("Registros carregados!");

    } catch (err) {
        showLoading(false);
        console.error(err);
        showToast("Erro ao buscar registros.", true);
    }
}

function imprimirFolhaPontoEletronico() {
    if (!window.dadosFolhaImpressao || window.dadosFolhaImpressao.length === 0) {
        return showToast("Busque os registros primeiro antes de imprimir!", true);
    }

    const funcId = document.getElementById('ponto-equipe-id').value;
    const e = STATE.equipe.find(x => x.id == funcId);
    const dataIni = document.getElementById('ponto-auto-data-ini').value.split('-').reverse().join('/');
    const dataFim = document.getElementById('ponto-auto-data-fim').value.split('-').reverse().join('/');

    const totalDiariasFloat = window.diariasEletronicasAtivas;
    const totalDiariasFormatado = totalDiariasFloat.toFixed(2);

    const valorDiaria = parseFloat(e.valor_diaria || 0);
    const valorTotalPagar = totalDiariasFloat * valorDiaria;

    function timeToMinutes(timeStr) {
        if (!timeStr || timeStr === '--:--') return 0;
        const parts = timeStr.split(':');
        return (parseInt(parts[0]) * 60) + parseInt(parts[1]);
    }

    let htmlTabelaImp = window.dadosFolhaImpressao.map(i => {
        let diffText = "--";
        let bgColor = "transparent";
        let diffColor = "#333";
        let workedMinutes = 0;

        if (i.e1 !== '--:--') {
            if (i.e2 !== '--:--' && i.s2 !== '--:--') {
                workedMinutes = (timeToMinutes(i.s1) - timeToMinutes(i.e1)) + (timeToMinutes(i.s2) - timeToMinutes(i.e2));
            } else if (i.s1 !== '--:--') {
                workedMinutes = timeToMinutes(i.s1) - timeToMinutes(i.e1);
                if (workedMinutes >= 360) workedMinutes -= 60;
            }

            const JORNADA_MINUTOS = 480;
            const diff = workedMinutes - JORNADA_MINUTOS;

            if (diff < -20) {
                const absDiff = Math.abs(diff);
                const h = Math.floor(absDiff / 60).toString().padStart(2, '0');
                const m = (absDiff % 60).toString().padStart(2, '0');
                diffText = `-${h}h ${m}m`;
                bgColor = "#fef2f2";
                diffColor = "#b91c1c";
            } else if (diff > 20) {
                const h = Math.floor(diff / 60).toString().padStart(2, '0');
                const m = (diff % 60).toString().padStart(2, '0');
                diffText = `+${h}h ${m}m`;
                diffColor = "#15803d";
            } else {
                diffText = "Exato";
                diffColor = "#475569";
            }
        }

        return `
        <tr style="background-color: ${bgColor};">
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${i.data}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${i.e1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${i.s1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${i.e2}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${i.s2}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: ${diffColor};">${diffText}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">${i.fracao}</td>
        </tr>
        `;
    }).join('');

    const htmlImpressao = `
        <div style="font-family: Arial, sans-serif; color: #000; width: 100%;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
                <img src="https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png" style="height: 60px; margin-bottom: 10px;" />
                <h2 style="margin: 0; font-size: 18pt; font-weight: bold;">FOLHA DE PONTO INDIVIDUAL</h2>
                <p style="margin: 5px 0 0 0; font-size: 11pt;">Período Apurado: ${dataIni} a ${dataFim}</p>
            </div>
            
            <div style="margin-bottom: 20px; font-size: 11pt;">
                <strong>Colaborador:</strong> ${(e.nome).toUpperCase()}<br>
                <strong style="color: #1d4ed8;">Chave PIX:</strong> <span style="color: #1d4ed8; font-weight: bold;">${e.chave_pix || 'Não informada'}</span><br>
                <strong>Função:</strong> ${(e.categoria || 'Geral').toUpperCase()}<br>
                <strong>Obra:</strong> ${STATE.obras.find(o => o.id == e.obra_atual_id)?.nome || 'Não definida'}<br>
                <strong>CPF:</strong> ${e.cpf || 'Não informado'}
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f1f5f9;">
                        <th style="border: 1px solid #cbd5e1; padding: 8px;">Data</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px;">Entrada 1</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px;">Saída 1</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px;">Entrada 2</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px;">Saída 2</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px;">Saldo (Horas)</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px;">Diária</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTabelaImp}
                </tbody>
            </table>

            <div style="text-align: right; font-size: 13pt; margin-bottom: 50px;">
                <strong>TOTAL DE DIÁRIAS APURADAS: ${totalDiariasFormatado}</strong><br>
                <strong style="color: #1d4ed8; font-size: 16pt; display: block; margin-top: 8px;">VALOR A PAGAR: ${formatMoney(valorTotalPagar)}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 10pt;">
                <div style="text-align: center; width: 45%; border-top: 1px solid #000; padding-top: 10px;">
                    <strong>RV NEGÓCIOS E COMPANHIA</strong>
                </div>
                <div style="text-align: center; width: 45%; border-top: 1px solid #000; padding-top: 10px;">
                    <strong>${(e.nome).toUpperCase()}</strong><br>
                    Declaro corretas as anotações acima.
                </div>
            </div>
        </div>
    `;

    document.getElementById('print-area').innerHTML = htmlImpressao;
    setTimeout(() => window.print(), 300);
}

async function pagarMesPonto(ponto_id, equipe_id) {
    if (!confirm("Deseja confirmar o pagamento deste mês? Isso criará uma Despesa automática na Obra atual do funcionário.")) return;
    showLoading(true);

    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;
    const e = STATE.equipe.find(x => x.id == equipe_id);
    const pt = STATE.ponto.find(x => x.id == ponto_id);

    if (!e || !pt) {
        showLoading(false);
        return showToast("Dados inconsistentes", true);
    }
    if (!e.obra_atual_id) {
        showLoading(false);
        return showToast("Funcionário precisa estar vinculado a uma obra para lançar a despesa.", true);
    }

    const dtPagamento = new Date().toISOString();

    const { error: errPt } = await sb.from('jsp_ponto').update({ status: 'PAGO', data_pagamento: dtPagamento }).eq('id', ponto_id);
    if (errPt) {
        showLoading(false);
        return showToast("Erro: " + errPt.message, true);
    }

    const desc = `Pagamento Mensal (${mes}/${ano}) - ${e.nome}`;
    const { error: errFin } = await sb.from('jsp_logs').insert([{
        id: getNextIdNum(STATE.logs).toString(),
        obra_id: parseInt(e.obra_atual_id),
        tipo: 'despesa',
        produto_nome: desc,
        valor_total: parseFloat(pt.valor_total),
        data: dtPagamento, vencimento: dtPagamento,
        status_financeiro: 'PAGO',
        categoria: 'Mão de Obra',
        observacao: `Tipo: Mão de Obra | Equipe: ${e.nome} | Dias Trab: ${pt.total_dias}`
    }]);

    if (errFin) {
        showLoading(false);
        return showToast("Erro financeiro: " + errFin.message, true);
    }

    showToast("Pagamento e Despesa lançados com sucesso!");
    loadData();
}

async function estornarPagamentoPonto(ponto_id, equipe_id) {
    if (!confirm("Tem certeza que deseja ESTORNAR este pagamento? O status voltará para PENDENTE e a despesa gerada no Financeiro será cancelada.")) return;

    showLoading(true);

    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;
    const e = STATE.equipe.find(x => x.id == equipe_id);

    if (!e) {
        showLoading(false);
        return showToast("Dados do funcionário não encontrados.", true);
    }

    const { error: errPt } = await sb.from('jsp_ponto')
        .update({ status: 'PENDENTE', data_pagamento: null })
        .eq('id', ponto_id);

    if (errPt) {
        showLoading(false);
        return showToast("Erro ao estornar ponto: " + errPt.message, true);
    }

    const descProcurada = `Pagamento Mensal (${mes}/${ano}) - ${e.nome}`;
    const logVinculado = STATE.logs.find(l =>
        l.tipo === 'despesa' &&
        l.produto_nome === descProcurada &&
        l.status_financeiro === 'PAGO'
    );

    if (logVinculado) {
        await sb.from('jsp_logs')
            .update({ status_financeiro: 'CANCELADO' })
            .eq('id', logVinculado.id)
            .eq('tipo', 'despesa');
    }

    showToast("Pagamento estornado com sucesso!");
    loadData();
}

function imprimirFolha() {
    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;
    const term = document.getElementById('eqp-search').value.toLowerCase();
    const obraFiltro = document.getElementById('eqp-obra-filter').value;
    const statusFiltro = document.getElementById('eqp-filter-status').value;

    let fil = STATE.equipe.filter(e => e.nome.toLowerCase().includes(term) || (e.categoria || '').toLowerCase().includes(term));
    if (obraFiltro) fil = fil.filter(e => e.obra_atual_id == obraFiltro);
    if (statusFiltro !== "todos") {
        const isAtivo = statusFiltro === "true";
        fil = fil.filter(e => e.ativo === isAtivo || (isAtivo && e.ativo === undefined));
    }

    let htmlReport = `
        <div style="font-family: Arial, sans-serif; color: #333; width: 100%;">
            <div style="text-align: center; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 20px;">
                <img src="https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png" style="height: 60px; margin-bottom: 10px;" />
                <h2 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 900;">RELATÓRIO DE FREQUÊNCIA E PAGAMENTO</h2>
                <h3 style="margin: 5px 0 0 0; color: #1d4ed8;">Competência: ${mes}/${ano}</h3>
                ${obraFiltro ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Obra: ${STATE.obras.find(o => o.id == obraFiltro)?.nome}</p>` : ''}
            </div>
            <table width="100%" style="border-collapse: collapse; text-align: left; font-size: 11px;">
                <thead>
                    <tr style="background-color: #f1f5f9; color: #1e293b;">
                        <th style="padding: 8px; border: 1px solid #cbd5e1;">Funcionário / PIX</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Diária</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Dias Trabalhados</th>
                        <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Total R$ (Subtotal)</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let somaTotal = 0;
    fil.forEach(e => {
        let pt = STATE.ponto.find(x => x.equipe_id == e.id && x.mes === mes && x.ano === ano);
        let dias = pt ? parseFloat(pt.total_dias || 0) : 0;
        let diaria = parseFloat(e.valor_diaria || 0);
        let total = pt ? parseFloat(pt.valor_total || 0) : (dias * diaria);
        somaTotal += total;

        htmlReport += `
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">
                    <div style="font-weight: 900; font-size: 12px;">${e.nome.toUpperCase()}</div>
                    <div style="font-size: 10px; color: #1d4ed8; font-weight: bold; margin-top: 2px;">PIX: ${e.chave_pix || '<span style="color:#ef4444">NÃO INFORMADO</span>'}</div>
                    <div style="font-size: 9px; color:#64748b; text-transform: uppercase; margin-top: 2px;">FUNÇÃO: ${e.categoria || 'Geral'}</div>
                </td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${formatMoney(diaria)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #1d4ed8;">${dias}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 12px;">${formatMoney(total)}</td>
            </tr>
        `;
    });

    htmlReport += `
                </tbody>
            </table>
            <div style="margin-top: 20px; text-align: right; font-size: 16px;">
                <strong>TOTAL GERAL PAGO: <span style="color: #b91c1c;">${formatMoney(somaTotal)}</span></strong>
            </div>
        </div>
    `;

    document.getElementById('print-area').innerHTML = htmlReport;
    setTimeout(() => window.print(), 300);
}

function imprimirRecibo(equipe_id, ponto_id) {
    const mes = document.getElementById('eqp-filter-mes').value;
    const ano = document.getElementById('eqp-filter-ano').value;
    const e = STATE.equipe.find(x => x.id == equipe_id);
    let pt = STATE.ponto.find(x => x.id == ponto_id);

    let dias = pt ? parseFloat(pt.total_dias || 0) : 0;
    let diaria = parseFloat(e.valor_diaria || 0);
    let total = pt ? parseFloat(pt.valor_total || 0) : (dias * diaria);

    const hoje = new Date().toLocaleDateString('pt-BR');

    const htmlRecibo = `
        <div style="font-family: Arial, sans-serif; width: 100%; border: 2px solid #1e293b; padding: 30px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                <img src="https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png" style="height: 60px;" />
                <div style="text-align: right;">
                    <h1 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 900;">RECIBO DE PAGAMENTO</h1>
                    <p style="margin: 5px 0 0 0; font-size: 18px; color: #1d4ed8; font-weight: bold;">VALOR: ${formatMoney(total)}</p>
                </div>
            </div>
            
            <div style="font-size: 14px; line-height: 1.8; text-align: justify; margin-bottom: 40px;">
                Recebi(emos) de <strong>RV NEGÓCIOS E COMPANHIA</strong> (CNPJ: 61.893.912/0001-24), a importância supra de <strong>${formatMoney(total)}</strong>, 
                referente ao pagamento de prestação de serviços (${e.categoria || 'Serviços Gerais'}), contabilizando <strong>${dias} dias trabalhados</strong> 
                com a diária acordada em <strong>${formatMoney(diaria)}</strong>, durante a competência de <strong>${mes}/${ano}</strong>.
            </div>
            
            <div style="font-size: 14px; margin-bottom: 40px;">
                Para maior clareza, firmo(amos) o presente recibo para que produza os seus efeitos legais.
            </div>
            
            <div style="text-align: center; margin-bottom: 30px; font-size: 14px;">
                Jataí - GO, ${hoje}.
            </div>
            
            <div style="margin-top: 60px; display: flex; justify-content: center;">
                <div style="text-align: center; width: 60%; border-top: 1px solid #000; padding-top: 10px;">
                    <strong>${e.nome}</strong><br>
                    <span style="font-size: 12px; color: #64748b;">CPF: ${e.cpf || '_______________________'} | RG: ${e.rg || '_______________________'}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('print-area').innerHTML = htmlRecibo;
    setTimeout(() => window.print(), 300);
}

function abrirModalDocumentos(equipe_id) {
    const e = STATE.equipe.find(x => x.id == equipe_id);
    document.getElementById('doc-equipe-id').value = e.id;
    document.getElementById('doc-equipe-nome').innerText = `Colaborador: ${e.nome}`;

    const btnAssinar = document.getElementById('btn-assinar-doc');
    if (e.contrato_assinado) {
        btnAssinar.innerHTML = `<i data-lucide="check-double" class="w-4 h-4"></i> Contrato Já Assinado`;
        btnAssinar.classList.replace('bg-green-600', 'bg-emerald-700');
        btnAssinar.classList.replace('hover:bg-green-700', 'hover:bg-emerald-800');
    } else {
        btnAssinar.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Marcar como Assinado`;
        btnAssinar.classList.replace('bg-emerald-700', 'bg-green-600');
        btnAssinar.classList.replace('hover:bg-emerald-800', 'hover:bg-green-700');
    }

    document.getElementById('modal-docs-equipe').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function marcarContratoAssinado() {
    const id = document.getElementById('doc-equipe-id').value;
    showLoading(true);
    const { error } = await sb.from('jsp_equipe').update({ contrato_assinado: true }).eq('id', id);
    if (error) {
        showLoading(false);
        return showToast("Erro: " + error.message, true);
    }
    showToast("Contrato marcado como assinado com sucesso!");
    document.getElementById('modal-docs-equipe').classList.add('hidden');
    loadData();
}

function imprimirDocumento() {
    const id = document.getElementById('doc-equipe-id').value;
    const tipo = document.getElementById('doc-tipo-select').value;

    if (!tipo) {
        alert("Por favor, selecione um documento na lista antes de imprimir.");
        return;
    }

    const e = STATE.equipe.find(x => x.id == id);

    if (!e) {
        alert("Erro ao encontrar os dados do colaborador.");
        return;
    }

    const dataAtual = new Date();
    const dia = dataAtual.getDate();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const mes = meses[dataAtual.getMonth()];
    const ano = dataAtual.getFullYear();
    const dataExtenso = `${dia} de ${mes} de ${ano}`;
    const hojeCurto = dataAtual.toLocaleDateString('pt-BR');

    const obraVinculada = STATE.obras.find(o => o.id == e.obra_atual_id);
    const enderecoObra = obraVinculada ? (obraVinculada.endereco || obraVinculada.nome) : 'Endereço não informado / Obra não definida';
    const diariaTexto = formatMoney(e.valor_diaria || 0);
    const matricula = parseFloat(e.matricula || 0);

    let dataTerminoContrato = "____/____/______";
    if (obraVinculada && obraVinculada.data_termino) {
        const partes = obraVinculada.data_termino.split('-');
        dataTerminoContrato = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    let dataInicioContrato = "____/____/______";
    if (e.data_contrato) {
        const p = e.data_contrato.split('-');
        dataInicioContrato = `${p[2]}/${p[1]}/${p[0]}`;
    }

    let titulo = "";
    let corpoTexto = "";
    let nomeContratanteAssinatura = "";

    if (tipo === 'epi') {
        titulo = "FICHA DE EPI / TERMO DE RECEBIMENTO";
        nomeContratanteAssinatura = "RV NEGÓCIOS E COMPANHIA LTDA";

        corpoTexto = `
        <div style="font-size: 12pt; line-height: 1.5; text-align: justify;">
            <p style="margin-bottom: 5px;"><strong>Nome do Prestador de Serviços:</strong> ${(e.nome || '').toUpperCase()}</p>
            <p style="margin-bottom: 15px;"><strong>Atividade a ser desenvolvida:</strong> ${(e.categoria || 'Geral').toUpperCase()}</p>
            
            <p style="margin-bottom: 20px;">"Declaro ter recebido orientação sobre o uso correto dos Equipamentos de Segurança, bem como, estou ciente de que sou obrigado a usá-los sob pena de SUSPENSÃO ou CANCELAMENTO do contrato de prestação dos serviços de autônomo."</p>
            
            <h3 style="text-align: center; font-size: 12pt; margin-bottom: 10px; font-weight: bold;">RECEBIMENTO</h3>
            
            <table style="width: 100%; border-collapse: collapse; text-align: center; border: 1px solid #000; font-size: 10pt; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f1f5f9;">
                        <th style="border: 1px solid #000; padding: 6px;">DATA</th>
                        <th style="border: 1px solid #000; padding: 6px;">EPI (Descrição)</th>
                        <th style="border: 1px solid #000; padding: 6px;">C.A.</th>
                        <th style="border: 1px solid #000; padding: 6px;">QUANT.</th>
                        <th style="border: 1px solid #000; padding: 6px;">Motivo da retirada</th>
                        <th style="border: 1px solid #000; padding: 6px;">Assinatura</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;">Capacete</td><td style="border: 1px solid #000; padding: 6px;">21420</td><td style="border: 1px solid #000; padding: 6px;">1</td><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;"></td></tr>
                    <tr><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;">Sapato de segurança</td><td style="border: 1px solid #000; padding: 6px;">24312</td><td style="border: 1px solid #000; padding: 6px;">1</td><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;"></td></tr>
                    <tr><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;">Óculos</td><td style="border: 1px solid #000; padding: 6px;">07732</td><td style="border: 1px solid #000; padding: 6px;">1</td><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;"></td></tr>
                    <tr><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;">Protetor Auricular</td><td style="border: 1px solid #000; padding: 6px;">07790</td><td style="border: 1px solid #000; padding: 6px;">1</td><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;"></td></tr>
                    <tr><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;">Luva</td><td style="border: 1px solid #000; padding: 6px;">00501</td><td style="border: 1px solid #000; padding: 6px;">1</td><td style="border: 1px solid #000; padding: 6px;"></td><td style="border: 1px solid #000; padding: 6px;"></td></tr>
                </tbody>
            </table>

            <p style="margin-bottom: 10px;">Eu, <strong>${(e.nome || '').toUpperCase()}</strong>, declaro ter recebido os equipamentos de proteção necessários para execução da função ao qual irei exercer COMO <strong>${(e.categoria || 'SERVENTE').toUpperCase()}</strong> POR OBRA CERTA OU PRAZO DETERMINADO, bem como, o treinamento de utilização da forma correta.</p>
            
            <p>Por fim, estando ciente e de acordo assino este termo de compromisso em duas vias.</p>
        </div>
        `;
    } else if (tipo === 'contrato1') {
        titulo = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORNECIMENTO DE MÃO DE OBRA QUALIFICADA PARA SERVIÇOS DE CONSTRUÇÃO CIVIL <br> SEM VÍNCULO EMPREGATÍCIO <br><br> Nº ${matricula}/2026 | JATAÍ – GOIÁS`;
        nomeContratanteAssinatura = "RV NEGOCIOS E COMPANHIA LTDA";

        corpoTexto = `
        <div style="text-align: justify; font-size: 12pt; line-height: 1.6;">
            <p style="text-indent: 40px; margin-bottom: 20px;">Contrato de Prestação de Serviços celebrado entre as seguintes partes:</p>

            <p style="margin-bottom: 5px;"><strong>CONTRATANTE</strong></p>
            <p style="text-indent: 40px; margin-bottom: 15px;"><strong>RV NEGOCIOS E COMPRANHIA LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ nº 61.893.912/0001-24, com sede na Rua Mineiros, S/N - QD 09 LT 12  - CEP 75.800-094, Santa Maria, no Município de Jataí, Estado de Goiás, neste ato representada por seu titular NÚBIA LAFAIETE APARECIDA DA SILVA, brasileiro, portador do CPF nº 320.993.981-00, residente e domiciliado na Rua Mineiros, S/N - QD 09 LT 12  - CEP 75.800-094, Santa Maria, Município de Jataí, Estado de Goiás, doravante denominado(a) simplesmente <strong>CONTRATANTE</strong>.</p>

            <p style="margin-bottom: 5px;"><strong>CONTRATADO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 15px;"><strong>${(e.nome || '').toUpperCase()}</strong>, portador do RG ${e.rg || '______________'}, inscrito no CPF nº ${e.cpf || '______________'} residente e domiciliado na ${e.endereco || '____________________________________________________'}, no Município de Jataí, Estado de Goiás, doravante denominado simplesmente <strong>CONTRATADO</strong>.</p>

            <p style="text-indent: 40px; margin-bottom: 30px;">As partes acima identificadas, tendo em vista o interesse mútuo, resolvem celebrar o presente contrato de prestação de serviços, que se regerá pelas cláusulas e condições seguintes:</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA PRIMEIRA – DO OBJETO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">O presente contrato tem como objeto a prestação de serviços com o fornecimento de mão de obra qualificada para execução de obra de construção civil, a serem executados pelo CONTRATADO, compreendendo as atividades descritas no item 1.3.1, conforme:</p>
            
            <div style="margin-left: 40px; margin-bottom: 15px;">
                <div style="margin-bottom: 8px;"><strong>1.1.</strong> O CONTRATADO realizará os serviços com sua própria mão de obra, ou mediante disponibilização de profissional integrante de sua equipe, com qualificações iguais ou superiores às exigidas.</div>
                <div style="margin-bottom: 8px;"><strong>1.2.</strong> No caso de envio de subcontratado, os dados do(s) colaborador(es) deverão ser encaminhados com antecedência mínima de 48 (quarenta e oito) horas, acompanhados de documentos pessoais, comprovação de qualificação e programação dos períodos de atuação na obra.</div>
                <div style="margin-bottom: 8px;"><strong>1.3.</strong> Na execução das atividades, o(s) profissional(is) deverá(ão) realizar os serviços conforme o objeto contratual abaixo:</div>
                <div style="margin-left: 20px; margin-bottom: 8px;"><strong>1.3.1.</strong> Transporte de materiais entre ambientes de descarga até o local de utilização; abastecimento de materiais nos postos indicados pela CONTRATANTE; adequação de espaço para início da obra; auxílio na execução de galpão de almoxarifado, galpão de engenharia e administrativo; limpeza da área de trabalho com destinação adequada dos materiais; demolição de salas desde a cobertura até as fundações; implantação de gabarito; locação de obra; escavação e compactação de fundação; concretagem de blocos de fundação; concretagem de vigas baldrames; concretagem de pilares e vigas superiores; concretagem de laje; desforma de caixarias; impermeabilização de estruturas; produção e transporte de argamassa para alvenaria, chapisco, reboco e emboço; separação e transporte de materiais hidráulicos e elétricos; lixamento de paredes; preparação de áreas para pintura; execução de concreto dosado para pisos e contrapisos; marcação e cortes em alvenaria para passagem de eletrodutos; limpeza do canteiro de obras; quantificação de materiais; produção de argamassa para assentamento de pisos cerâmicos e revestimentos de parede, conforme indicação da CONTRATANTE.</div>
            </div>

            <p style="text-indent: 40px; margin-bottom: 10px;"><strong>Parágrafo Primeiro:</strong> As atividades serão executadas na obra localizada na <strong>${enderecoObra}</strong>.</p>
            <p style="text-indent: 40px; margin-bottom: 30px;"><strong>Parágrafo Segundo:</strong> O CONTRATADO declara possuir capacidade técnica, experiência e disponibilidade para execução direta ou por meio de profissionais de sua equipe, responsabilizando-se pela qualidade e segurança dos serviços.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO CONTRATADO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">Além das obrigações implícitas, o CONTRATADO se obriga a:</p>
            <div style="margin-left: 40px; margin-bottom: 30px;">
                <div style="margin-bottom: 5px;"><strong>2.1.</strong> Executar os serviços com qualidade, presteza e diligência, observando normas técnicas e orientações da CONTRATANTE.</div>
                <div style="margin-bottom: 5px;"><strong>2.2.</strong> Utilizar e exigir o uso de Equipamentos de Proteção Individual (EPIs), responsabilizando-se por sua correta utilização.</div>
                <div style="margin-bottom: 5px;"><strong>2.3.</strong> Responsabilizar-se por danos causados a terceiros ou à CONTRATANTE por dolo ou culpa.</div>
                <div style="margin-bottom: 5px;"><strong>2.4.</strong> Manter disciplina e ordem no local de trabalho.</div>
                <div style="margin-bottom: 5px;"><strong>2.5.</strong> Emitir recibos de pagamento pelos serviços prestados.</div>
                <div style="margin-bottom: 5px;"><strong>2.6.</strong> Arcar com despesas de deslocamento, alimentação e vestuário.</div>
                <div style="margin-bottom: 5px;"><strong>2.7.</strong> Responsabilizar-se pelo recolhimento de todos os tributos incidentes (ISS, IR, INSS, entre outros).</div>
                <div style="margin-bottom: 5px;"><strong>2.8.</strong> Cumprir rigorosamente os prazos estabelecidos.</div>
                <div style="margin-bottom: 5px;"><strong>2.9.</strong> Manter todas as condições de habilitação durante a vigência do contrato.</div>
            </div>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES DO CONTRATANTE</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">O CONTRANTE se obriga a:</p>
            <div style="margin-left: 40px; margin-bottom: 30px;">
                <div style="margin-bottom: 5px;"><strong>3.1.</strong> Fornecer informações e materiais necessários à execução dos serviços.</div>
                <div style="margin-bottom: 5px;"><strong>3.2.</strong> Fiscalizar a execução dos serviços.</div>
                <div style="margin-bottom: 5px;"><strong>3.3.</strong> Efetuar os pagamentos conforme estabelecido.</div>
                <div style="margin-bottom: 5px;"><strong>3.4.</strong> Disponibilizar ambiente de trabalho seguro.</div>
                <div style="margin-bottom: 5px;"><strong>3.5.</strong> Disponibilizar treinamentos obrigatórios, quando necessário, conforme normas regulamentadoras.</div>
            </div>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA QUARTA – DO VALOR E DA FORMA DE PAGAMENTO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">Os serviços serão remunerados conforme entregas executadas e aprovadas, mediante Recibo de Prestação de Serviços.</p>
            <div style="margin-left: 40px; margin-bottom: 30px;">
                <div style="margin-bottom: 5px;"><strong>4.1.</strong> O valor será de <strong>${diariaTexto}</strong> por entrega diária completa.</div>
                <div style="margin-bottom: 5px;"><strong>4.2.</strong> O pagamento será efetuado a cada 18 (dezoito) dias corridos, com medição quinzenal.</div>
                <div style="margin-bottom: 5px;"><strong>4.3.</strong> O pagamento será realizado via transferência bancária para a conta indicada pelo CONTRATADO.</div>
            </div>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA QUINTA – DO PRAZO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">O contrato terá início em <strong> ${dataInicioContrato}</strong> e término em <strong>${dataTerminoContrato}</strong>, podendo ser prorrogado até o limite de 24 (vinte e quatro) meses.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA SEXTA – DA RESCISÃO</strong></p>
            <p style="margin-bottom: 30px;">O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 5 (cinco) dias, ou de forma imediata nos casos previstos neste instrumento.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA SÉTIMA – DA NATUREZA DO CONTRATO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">O presente contrato possui natureza civil, não gerando vínculo empregatício, sendo o CONTRATADO integralmente responsável por obrigações fiscais, previdenciárias e trabalhistas.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA OITAVA – DO SIGILO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">O CONTRATADO compromete-se a manter sigilo sobre informações da CONTRATANTE.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA NONA – DO ABANDONO DA OBRA</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">Em caso de abandono injustificado, valores pendentes somente serão pagos após conclusão da etapa por terceiros e recebimento integral pela CONTRATANTE.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA DÉCIMA – DAS DISPOSIÇÕES GERAIS</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">O contrato obriga as partes e seus sucessores.</p>
            <div style="margin-left: 40px; margin-bottom: 10px;">
                <div style="margin-bottom: 5px;"><strong>10.1.</strong> Alterações somente por escrito.</div>
            </div>
            <p style="text-indent: 40px; margin-bottom: 30px;">Fica eleito o foro da comarca de Jataí-GO, para dirimir quaisquer controvérsias.</p>
        </div>`;
    } else if (tipo === 'contrato2') {
        titulo = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORNECIMENTO DE MÃO DE OBRA QUALIFICADA PARA SERVIÇOS DE CONSTRUÇÃO CIVIL <br> SEM VÍNCULO EMPREGATÍCIO <br><br> Nº ${matricula}/2026 | JATAÍ – GOIÁS`;
        nomeContratanteAssinatura = "RV NEGOCIOS E COMPANHIA LTDA";

        corpoTexto = `
        <div style="text-align: justify; font-size: 12pt; line-height: 1.6;">
            <p style="text-indent: 40px; margin-bottom: 20px;">Contrato de Prestação de Serviços celebrado entre as seguintes partes:</p>

            <p style="margin-bottom: 5px;"><strong>CONTRATANTE</strong></p>
            <p style="text-indent: 40px; margin-bottom: 15px;"><strong>RV NEGOCIOS E COMPANHIA LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ nº 61.893.912-0001-24, com sede na Rua Mineiros, sn - Vila Santa Maria, CEP: 75.800-094 - no Município de Jataí, Estado de Goiás, neste ato representada por seu titular NUBIA LAFAIETE APARECIDA DA SILVA, brasileiro(a), portador(a) do CPF nº 320.993.981-00, residente e domiciliado(a) na Rua Mineiros, sn - Vila Santa Maria, CEP: 75.800-094 - no Município de Jataí, Estado de Goiás, doravante denominado(a) simplesmente <strong>CONTRATANTE</strong>.</p>

            <p style="margin-bottom: 5px;"><strong>CONTRATADO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 15px;"><strong>${(e.nome || '').toUpperCase()}</strong>, portador do RG ${e.rg || '______________'}, inscrito no CPF nº ${e.cpf || '______________'} residente e domiciliado na ${e.endereco || '____________________________________________________'}, no Município de Jataí, Estado de Goiás, doravante denominado simplesmente <strong>CONTRATADO</strong>.</p>

            <p style="text-indent: 40px; margin-bottom: 30px;">As partes acima identificadas, tendo em vista o interesse mútuo, resolvem celebrar o presente contrato de prestação de serviços, que se regerá pelas cláusulas e condições seguintes:</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA PRIMEIRA – DO OBJETO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">O presente contrato tem como objeto a prestação de serviços com o fornecimento de mão de obra qualificada para execução de obra de construção civil, a serem executados pelo CONTRATADO, compreendendo as atividades descritas no item 1.3.1, conforme:</p>
            
            <div style="margin-left: 40px; margin-bottom: 15px;">
                <div style="margin-bottom: 8px;"><strong>1.1.</strong> O CONTRATADO realizará os serviços com sua própria mão de obra, ou mediante disponibilização de profissional integrante de sua equipe, com qualificações iguais ou superiores às exigidas.</div>
                <div style="margin-bottom: 8px;"><strong>1.2.</strong> No caso de envio de subcontratado, os dados do(s) colaborador(es) deverão ser encaminhados com antecedência mínima de 48 (quarenta e oito) horas, acompanhados de documentos pessoais, comprovação de qualificação e programação dos períodos de atuação na obra.</div>
                <div style="margin-bottom: 8px;"><strong>1.3.</strong> Na execução das atividades, o(s) profissional(is) deverá(ão) realizar os serviços conforme o objeto contratual abaixo:</div>
                <div style="margin-left: 20px; margin-bottom: 8px; text-align: justify;"><strong>1.3.1.</strong> Coordenação, supervisão e organização das atividades de obra no local de execução dos serviços; orientação e distribuição das tarefas à equipe operacional conforme cronograma definido pela CONTRATANTE; acompanhamento do abastecimento, conferência e correta utilização dos materiais nos pontos indicados; apoio à adequação do espaço para início da obra, incluindo impluração e organização de áreas de almoxarifado, engenharia e administrativo; fiscalização da limpeza e organização da área de trabalho, garantindo a correta destinação dos resíduos e materiais excedentes; acompanhamento das atividades de demolição, desde a cobertura até as fundações, assegurando a execução conforme orientações técnicas; supervisão da implantação de gabarito, locação da obra, escavação, compactação e execução das fundações; acompanhamento das etapas de concretagem de blocos, vigas baldrames, pilares, vigas superiores, lajes e demais elementos estruturais; verificação da correta desforma de caixarias e aplicação de impermeabilizações; controle da produção, transporte e aplicação de argamassas para alvenaria, chapisco, reboco e emboço; orientação quanto à separação, transporte e instalação de materiais hidráulicos e elétricos; supervisão da preparação de superfícies para acabamento, incluindo lixamento, preparo para pintura, execução de pisos e contrapisos; acompanhamento das marcações e cortes em alvenaria para passagem de eletrodutos; controle da limpeza geral do canteiro de obras; apoio à quantificação de materiais e acompanhamento da produção de argamassa para assentamento de pisos cerâmicos e revestimentos, sempre conforme as diretrizes técnicas e orientações da CONTRATANTE.</div>
            </div>

            <p style="text-indent: 40px; margin-bottom: 10px;"><strong>Parágrafo Primeiro:</strong> As atividades serão executadas na obra localizada na <strong>${enderecoObra}</strong>.</p>
            <p style="text-indent: 40px; margin-bottom: 30px;"><strong>Parágrafo Segundo:</strong> O CONTRATADO declara possuir capacidade técnica, experiência e disponibilidade para execução direta ou por meio de profissionais de sua equipe, responsabilizando-se pela qualidade e segurança dos serviços.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO CONTRATADO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">Além das obrigações implícitas, o CONTRATADO se obriga a:</p>
            <div style="margin-left: 40px; margin-bottom: 30px;">
                <div style="margin-bottom: 5px;"><strong>2.1.</strong> Executar os serviços com qualidade, presteza e diligência, observando normas técnicas e orientações da CONTRATANTE.</div>
                <div style="margin-bottom: 5px;"><strong>2.2.</strong> Utilizar e exigir o uso de Equipamentos de Proteção Individual (EPIs), responsabilizando-se por sua correta utilização.</div>
                <div style="margin-bottom: 5px;"><strong>2.3.</strong> Responsabilizar-se por danos causados a terceiros ou à CONTRATANTE por dolo ou culpa.</div>
                <div style="margin-bottom: 5px;"><strong>2.4.</strong> Manter disciplina e ordem no local de trabalho.</div>
                <div style="margin-bottom: 5px;"><strong>2.5.</strong> Emitir recibos de pagamento pelos serviços prestados.</div>
                <div style="margin-bottom: 5px;"><strong>2.6.</strong> Arcar com despesas de deslocamento, alimentação e vestuário.</div>
                <div style="margin-bottom: 5px;"><strong>2.7.</strong> Responsabilizar-se pelo recolhimento de todos os tributos incidentes (ISS, IR, INSS, entre outros).</div>
                <div style="margin-bottom: 5px;"><strong>2.8.</strong> Cumprir rigorosamente os prazos estabelecidos.</div>
                <div style="margin-bottom: 5px;"><strong>2.9.</strong> Manter todas as condições de habilitação durante a vigência do contrato.</div>
            </div>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES DO CONTRATANTE</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">O CONTRANTE se obriga a:</p>
            <div style="margin-left: 40px; margin-bottom: 30px;">
                <div style="margin-bottom: 5px;"><strong>3.1.</strong> Fornecer informações e materiais necessários à execução dos serviços.</div>
                <div style="margin-bottom: 5px;"><strong>3.2.</strong> Fiscalizar a execução dos serviços.</div>
                <div style="margin-bottom: 5px;"><strong>3.3.</strong> Efetuar os pagamentos conforme estabelecido.</div>
                <div style="margin-bottom: 5px;"><strong>3.4.</strong> Disponibilizar ambiente de trabalho seguro.</div>
                <div style="margin-bottom: 5px;"><strong>3.5.</strong> Disponibilizar treinamentos obrigatórios, quando necessário, conforme normas regulamentadoras.</div>
            </div>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA QUARTA – DO VALOR E DA FORMA DE PAGAMENTO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">Os serviços serão remunerados conforme entregas executadas e aprovadas, mediante Recibo de Prestação de Serviços.</p>
            <div style="margin-left: 40px; margin-bottom: 30px;">
                <div style="margin-bottom: 5px;"><strong>4.1.</strong> O valor será de <strong>${diariaTexto}</strong> por entrega diária completa.</div>
                <div style="margin-bottom: 5px;"><strong>4.2.</strong> O pagamento será efetuado a cada 18 (dezoito) dias corridos, com medição quinzenal.</div>
                <div style="margin-bottom: 5px;"><strong>4.3.</strong> O pagamento será realizado via transferência bancária para a conta indicada pelo CONTRATADO.</div>
            </div>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA QUINTA – DO PRAZO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">O contrato terá início em <strong>${dataInicioContrato}</strong> e término em <strong> ${dataTerminoContrato} </strong>, podendo ser prorrogado até o limite de 24 (vinte e quatro) meses.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA SEXTA – DA RESCISÃO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 5 (cinco) dias, ou de forma imediata nos casos previstos neste instrumento.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA SÉTIMA – DA NATUREZA DO CONTRATO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">O presente contrato possui natureza civil, não gerando vínculo empregatício, sendo o CONTRATADO integralmente responsável por obrigações fiscais, previdenciárias e trabalhistas.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA OITAVA – DO SIGILO</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">O CONTRATADO compromete-se a manter sigilo sobre informações da CONTRATANTE.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA NONA – DO ABANDONO DA OBRA</strong></p>
            <p style="text-indent: 40px; margin-bottom: 30px;">Em caso de abandono injustificado, valores pendentes somente serão pagos após conclusão da etapa por terceiros e recebimento integral pela CONTRATANTE.</p>

            <p style="margin-bottom: 15px;"><strong>CLÁUSULA DÉCIMA – DAS DISPOSIÇÕES GERAIS</strong></p>
            <p style="text-indent: 40px; margin-bottom: 10px;">O contrato obriga as partes e seus sucessores.</p>
            <div style="margin-left: 40px; margin-bottom: 10px;">
                <div style="margin-bottom: 5px;"><strong>10.1.</strong> Alterações somente por escrito.</div>
            </div>
            <p style="text-indent: 40px; margin-bottom: 30px;">Fica eleito o foro da comarca de Jataí-GO, para dirimir quaisquer controvérsias.</p>
        </div>`;
    } else {
        titulo = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS (${tipo.toUpperCase()})`;
        nomeContratanteAssinatura = "CONTRATANTE";
        corpoTexto = `[ESTRUTURA PRONTA - Modelo pendente de configuração.]<br><br>
        <strong>CONTRATADO(A):</strong> ${e.nome}, portador do CPF nº ${e.cpf || '____'}, RG nº ${e.rg || '____'}, residente em ${e.endereco || '____'}.`;
    }

    const htmlDoc = `
        <div style="font-family: 'Times New Roman', Times, serif; width: 100%; padding: 20px 40px; box-sizing: border-box; color: #000;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px;">                
                <img src="https://i.postimg.cc/PqdgXGF0/logo-rv-negociospng.png" style="display: block; margin: 0 auto; height: 70px;"><br><br>
                <h2 style="margin: 0; font-size: 13pt; font-weight: bold; line-height: 1.3;">${titulo}</h2>
            </div>
            
            <div style="margin-bottom: 40px;">
                ${corpoTexto}<br>
            </div>
            
            <div style="text-align: right; margin-bottom: 80px; font-size: 13pt;">
                Jataí – GO, ____/____/______.<br>
            </div>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 10pt;">
                <div style="text-align: center; width: 45%; border-top: 1px solid #000; padding-top: 10px;">
                    <strong>${nomeContratanteAssinatura}</strong><br>
                    CONTRATANTE
                </div>
                <div style="text-align: center; width: 45%; border-top: 1px solid #000; padding-top: 10px;">
                    <strong>${(e.nome || '').toUpperCase()}</strong><br>
                    CONTRATADO(A)
                </div>
            </div>        
        </div>
    `;

    document.getElementById('print-area').innerHTML = htmlDoc;
    setTimeout(() => {
        requestAnimationFrame(() => {
            window.print();
        });
    }, 800);
}