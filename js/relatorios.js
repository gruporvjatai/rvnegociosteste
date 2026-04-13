// ====== RELATÓRIOS ======

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

    let recebido = 0, gasto = 0;
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

    let htmlReport = `
        <div id="printable-report" style="font-family: Arial, sans-serif; color: #333; width: 100%;">
            <div style="text-align: center; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #1e293b; font-size: 24px;">Relatório de Acompanhamento - RV Negócios</h2>
                <h3 style="margin: 5px 0 0 0; color: #1d4ed8;">Obra: ${tituloObra}</h3>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Período Filtrado: ${tituloPeriodo} | Tipo: ${tipo.toUpperCase()}${tituloFase}</p>
            </div>
    `;

    if (tipo === 'geral' && obraObj && !faseFiltro) {
        const valorContrato = parseFloat(obraObj.valor_contrato) || 0;
        const percGasto = valorContrato > 0 ? Math.min((gasto / valorContrato) * 100, 100).toFixed(1) : '0.0';
        htmlReport += `
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Saldo Contrato</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1e293b;">${formatMoney(valorContrato)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Total Recebido</div>
                    <div style="font-size: 20px; font-weight: bold; color: #16a34a;">${formatMoney(recebido)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Total Gasto</div>
                    <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${formatMoney(gasto)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Caixa</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1d4ed8;">${formatMoney(recebido - gasto)}</div>
                </div>
            </div>
            <div style="margin-bottom: 20px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 5px;">Gastos vs Contrato: ${percGasto}%</div>
                <div style="background: #e2e8f0; border-radius: 4px; height: 8px;">
                    <div style="background: ${parseFloat(percGasto) > 90 ? '#dc2626' : '#1d4ed8'}; height: 8px; border-radius: 4px; width: ${percGasto}%;"></div>
                </div>
            </div>
        `;
    } else {
        htmlReport += `
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #fef2f2;">
                    <div style="font-size: 11px; font-weight: bold; color: #dc2626; text-transform: uppercase;">Total Gasto (Despesas)</div>
                    <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${formatMoney(gasto)}</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f0fdf4;">
                    <div style="font-size: 11px; font-weight: bold; color: #16a34a; text-transform: uppercase;">Total Medições (Receitas)</div>
                    <div style="font-size: 20px; font-weight: bold; color: #16a34a;">${formatMoney(recebido)}</div>
                </div>
            </div>
        `;
    }

    // Tabela por Categoria (somente para despesas/geral)
    if ((tipo === 'geral' || tipo === 'despesas' || tipo === 'todos') && Object.keys(gastosPorCategoria).length > 0) {
        htmlReport += `
            <h4 style="color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Gastos por Categoria</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
                <thead><tr style="background-color: #1e293b; color: white;">
                    <th style="padding: 10px; text-align: left;">Categoria</th>
                    <th style="padding: 10px; text-align: right;">Total Gasto</th>
                    <th style="padding: 10px; text-align: right;">% do Total</th>
                </tr></thead>
                <tbody>
                    ${Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]).map(([cat, val], idx) => `
                    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${cat}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #dc2626;">${formatMoney(val)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #64748b;">${gasto > 0 ? ((val / gasto) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        `;
    }

    // Extrato detalhado
    if (tipo === 'todos' || tipo === 'despesas' || tipo === 'receitas') {
        htmlReport += `
            <h4 style="color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Lançamentos Detalhados</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead><tr style="background-color: #1e293b; color: white;">
                    <th style="padding: 8px; text-align: left;">Data</th>
                    <th style="padding: 8px; text-align: left;">Descrição</th>
                    <th style="padding: 8px; text-align: left;">Fase</th>
                    <th style="padding: 8px; text-align: left;">Tipo</th>
                    <th style="padding: 8px; text-align: right;">Valor</th>
                </tr></thead>
                <tbody>
                    ${logsFilt.map((l, idx) => {
                        const isRec = l.tipo === 'receita';
                        return `<tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                            <td style="padding: 7px; border-bottom: 1px solid #e2e8f0;">${formatDate(l.data)}</td>
                            <td style="padding: 7px; border-bottom: 1px solid #e2e8f0;">${l.produto_nome}</td>
                            <td style="padding: 7px; border-bottom: 1px solid #e2e8f0; color: #7c3aed; font-size: 10px;">${l.fase_obra || '-'}</td>
                            <td style="padding: 7px; border-bottom: 1px solid #e2e8f0;"><span style="font-size: 10px; font-weight: bold; color: ${isRec ? '#16a34a' : '#dc2626'};">${isRec ? 'RECEITA' : 'DESPESA'}</span></td>
                            <td style="padding: 7px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${isRec ? '#16a34a' : '#dc2626'};">${formatMoney(l.valor_total)}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    if (logsFilt.length === 0) {
        htmlReport += `<div style="text-align: center; padding: 40px; color: #94a3b8; font-size: 14px;">Nenhum lançamento encontrado para os filtros selecionados.</div>`;
    }

    htmlReport += `</div>`;
    container.innerHTML = htmlReport;
}

function imprimirRelatorio() {
    const rep = document.getElementById('printable-report');
    if (!rep) return showToast("Gere o relatório primeiro!", true);
    document.getElementById('print-area').innerHTML = rep.outerHTML;
    setTimeout(() => window.print(), 300);
}
