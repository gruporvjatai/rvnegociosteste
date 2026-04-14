// ====== RELATÓRIOS AVANÇADOS ======
function gerarRelatorio() {
    const obraId = document.getElementById('rep-obra').value;
    const faseFiltro = document.getElementById('rep-fase').value;
    const tipo = document.getElementById('rep-tipo').value;
    const mes = document.getElementById('rep-mes').value;
    const ano = document.getElementById('rep-ano').value;

    const container = document.getElementById('report-container');

    let logsFilt = STATE.logs.filter(l => l.status_financeiro === 'PAGO' && l.tipo !== 'oc_pendente');

    if (obraId) logsFilt = logsFilt.filter(l => String(l.obra_id) === String(obraId));
    if (faseFiltro) logsFilt = logsFilt.filter(l => l.fase_obra === faseFiltro);

    if (mes || ano) {
        logsFilt = logsFilt.filter(l => {
            const d = new Date(l.vencimento || l.data);
            const mLog = String(d.getMonth() + 1).padStart(2, '0');
            const aLog = String(d.getFullYear());
            let passa = true;
            if (mes && mLog !== mes) passa = false;
            if (ano && aLog !== ano) passa = false;
            return passa;
        });
    }

    if (tipo === 'despesas') logsFilt = logsFilt.filter(l => l.tipo === 'compra' || l.tipo === 'despesa');
    if (tipo === 'receitas') logsFilt = logsFilt.filter(l => l.tipo === 'receita');

    logsFilt.sort((a, b) => new Date(a.data) - new Date(b.data));

    const obraObj = STATE.obras.find(o => String(o.id) === String(obraId));
    const tituloObra = obraObj ? obraObj.nome : "Todas as Obras (Geral)";
    const tituloPeriodo = (mes ? mes + '/' : '') + (ano ? ano : 'Todo o Período');
    const tituloFase = faseFiltro ? ` | Fase: ${faseFiltro}` : '';

    let htmlReport = `
        <div id="printable-report" style="font-family: Arial, sans-serif; color: #333; width: 100%;">
            <div style="text-align: center; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #1e293b; font-size: 24px;">Relatório de Acompanhamento - RV Negócios</h2>
                <h3 style="margin: 5px 0 0 0; color: #1d4ed8;">Obra: ${tituloObra}</h3>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Período Filtrado: ${tituloPeriodo} | Tipo: ${tipo.toUpperCase()}${tituloFase}</p>
            </div>
    `;

    let recebido = 0;
    let gasto = 0;
    const gastosPorCategoria = {};

    logsFilt.forEach(l => {
        if (l.tipo === 'receita') recebido += parseFloat(l.valor_total);
        else {
            gasto += parseFloat(l.valor_total);
            const cat = l.categoria || 'Outros / Sem Categoria';
            if (!gastosPorCategoria[cat]) gastosPorCategoria[cat] = 0;
            gastosPorCategoria[cat] += parseFloat(l.valor_total);
        }
    });

    if (tipo === 'geral' && obraObj && !faseFiltro) {
        const valorContrato = parseFloat(obraObj.valor_contrato) || 0;
        htmlReport += `
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Saldo Contrato</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1e293b;">${formatMoney(valorContrato)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #bbf7d0; border-radius: 8px; background-color: #f0fdf4;">
                    <div style="font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase;">Medições</div>
                    <div style="font-size: 20px; font-weight: bold; color: #15803d;">${formatMoney(recebido)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #fecaca; border-radius: 8px; background-color: #fef2f2;">
                    <div style="font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase;">Despesas</div>
                    <div style="font-size: 20px; font-weight: bold; color: #b91c1c;">${formatMoney(gasto)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #bfdbfe; border-radius: 8px; background-color: #eff6ff;">
                    <div style="font-size: 11px; font-weight: bold; color: #1e40af; text-transform: uppercase;">Caixa da Obra</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1d4ed8;">${formatMoney(recebido - gasto)}</div>
                </div>
            </div>
        `;
    } else if (tipo === 'geral') {
        htmlReport += `
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="flex: 1; padding: 15px; border: 1px solid #bbf7d0; border-radius: 8px; background-color: #f0fdf4;">
                    <div style="font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase;">Total Receitas (Filtro)</div>
                    <div style="font-size: 20px; font-weight: bold; color: #15803d;">${formatMoney(recebido)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #fecaca; border-radius: 8px; background-color: #fef2f2;">
                    <div style="font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase;">Total Despesas (Filtro)</div>
                    <div style="font-size: 20px; font-weight: bold; color: #b91c1c;">${formatMoney(gasto)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #bfdbfe; border-radius: 8px; background-color: #eff6ff;">
                    <div style="font-size: 11px; font-weight: bold; color: #1e40af; text-transform: uppercase;">Saldo Líquido (Filtro)</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1d4ed8;">${formatMoney(recebido - gasto)}</div>
                </div>
            </div>
        `;
    }

    if (tipo === 'despesas' || tipo === 'todos' || tipo === 'geral') {
        const catArray = Object.keys(gastosPorCategoria).map(k => ({ nome: k, valor: gastosPorCategoria[k] })).sort((a, b) => b.valor - a.valor);
        const maxCatValor = catArray.length > 0 ? catArray[0].valor : 0;

        if (catArray.length > 0) {
            htmlReport += `
            <div style="margin-bottom: 30px; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; background-color: #fff;">
                <h4 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">📊 Distribuição de Custos por Categoria</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${catArray.map(c => {
                        const pct = gasto > 0 ? ((c.valor / gasto) * 100).toFixed(1) : 0;
                        const w = maxCatValor > 0 ? ((c.valor / maxCatValor) * 100) : 0;
                        return `
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                                <span style="font-weight: bold; color: #475569; text-transform: uppercase;">${c.nome}</span>
                                <span style="font-weight: bold; color: #1e293b;">${formatMoney(c.valor)} <span style="color: #64748b; font-weight: normal;">(${pct}%)</span></span>
                            </div>
                            <div style="width: 100%; background-color: #f1f5f9; border-radius: 4px; height: 10px; overflow: hidden;">
                                <div style="width: ${w}%; background-color: #3b82f6; height: 100%; border-radius: 4px;"></div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }
    }

    let totalTabela = 0;
    let saldoCorrido = 0;
    const htmlLinhas = logsFilt.map(l => {
        const isReceita = l.tipo === 'receita';
        const valor = parseFloat(l.valor_total);

        if (isReceita) saldoCorrido += valor;
        else saldoCorrido -= valor;

        if (tipo === 'despesas') totalTabela += valor;
        else if (tipo === 'receitas') totalTabela += valor;

        const forn = STATE.fornecedores.find(x => x.id == l.fornecedor_id)?.nome || '-';
        const faseBadge = l.fase_obra ? `<br><span style="font-size: 10px; color: #7e22ce; font-weight: bold;">[${l.fase_obra}]</span>` : '';
        const catBadge = l.categoria && !isReceita ? `<br><span style="font-size: 10px; color: #475569; font-weight: bold;">CAT: ${l.categoria}</span>` : '';

        return `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${formatDate(l.data)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
                <strong>${isReceita ? 'Medição' : (l.tipo === 'compra' ? `O.C. #${l.id}` : 'Despesa Avulsa')}</strong><br>
                <span style="color: #64748b;">${l.produto_nome || '-'}</span>
                ${faseBadge} ${catBadge}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${forn}</td>
            <td align="right" style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; color: ${isReceita ? '#15803d' : '#b91c1c'};">
                ${isReceita ? '+' : '-'} ${formatMoney(valor)}
            </td>
            ${tipo === 'todos' || tipo === 'geral' ? `
            <td align="right" style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; color: #1e293b;">
                ${formatMoney(saldoCorrido)}
            </td>` : ''}
        </tr>`;
    }).join('');

    htmlReport += `
        <table width="100%" style="border-collapse: collapse; text-align: left;">
            <thead>
                <tr style="background-color: #f1f5f9;">
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px;">Data</th>
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px;">Referência / Descrição</th>
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px;">Fornecedor</th>
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-align: right;">Valor</th>
                    ${tipo === 'todos' || tipo === 'geral' ? '<th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-align: right;">Saldo Acumulado</th>' : ''}
                </tr>
            </thead>
            <tbody>${htmlLinhas || '<tr><td colspan="5" align="center" style="padding: 20px; color: #64748b;">Nenhum registro encontrado com estes filtros.</td></tr>'}</tbody>
        </table>
    `;

    if (tipo === 'despesas' || tipo === 'receitas') {
        htmlReport += `
        <div style="text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold;">
            TOTAL DA LISTA ACIMA: <span style="color: ${tipo === 'receitas' ? '#15803d' : '#b91c1c'};">${formatMoney(totalTabela)}</span>
        </div>`;
    }

    htmlReport += `</div>`;
    container.innerHTML = htmlReport;
}

function imprimirRelatorio() {
    const reportHTML = document.getElementById('report-container').innerHTML;
    if (reportHTML.includes("Selecione os filtros")) {
        return showToast("Gere a visualização antes de imprimir!", true);
    }
    document.getElementById('print-area').innerHTML = reportHTML;
    setTimeout(() => window.print(), 300);
}