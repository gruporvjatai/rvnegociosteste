// js/modules/financeiro/financeiro.js

// 1. Inicialização do Módulo
async function initFinanceiro() {
    console.log("Módulo Financeiro carregado!");
    await carregarDadosFinanceiros();
    
    // Adicione aqui os Event Listeners dos filtros (se houver)
    document.getElementById('filtro-obra-financeiro')?.addEventListener('change', (e) => {
        // Lógica para refazer a busca no banco baseada na obra selecionada
        filtrarFinanceiroPorObra(e.target.value);
    });
}

// 2. Chamadas ao Supabase - COLE SUAS FUNÇÕES AQUI
async function carregarDadosFinanceiros() {
    mostrarLoading();
    try {
        const { data, error } = await supabase
            .from('tabela_financeiro') // Substitua pelo nome correto da sua tabela
            .select('*')
            .order('data_lancamento', { ascending: false });

        if (error) throw error;
        
        renderizarTabelaFinanceiro(data);
        calcularTotaisFinanceiros(data); // Chama a função que atualiza os cards

    } catch (error) {
        console.error("Erro ao carregar financeiro:", error);
        mostrarToast("Erro ao carregar dados financeiros", "erro");
    } finally {
        esconderLoading();
    }
}

// 3. Renderização Visual - COLE SUA LÓGICA AQUI
function renderizarTabelaFinanceiro(dados) {
    const tbody = document.getElementById('tabela-financeiro-body');
    tbody.innerHTML = '';

    dados.forEach(item => {
        // Exemplo de formatação de cor dependendo se é receita ou despesa
        const corTexto = item.tipo === 'receita' ? 'text-green-600' : 'text-red-600';
        const sinal = item.tipo === 'receita' ? '+' : '-';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 text-slate-600">${formatarDataBrasil(item.data_lancamento)}</td>
                <td class="p-4 font-medium text-slate-800">${item.descricao}</td>
                <td class="p-4 text-slate-600">${item.obra}</td>
                <td class="p-4"><span class="px-2 py-1 bg-slate-100 rounded text-xs font-semibold capitalize">${item.tipo}</span></td>
                <td class="p-4 font-bold ${corTexto}">${sinal} R$ ${parseFloat(item.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="p-4 text-center">
                    <button onclick="editarLancamento(${item.id})" class="text-blue-500 hover:text-blue-700 mr-2">
                        <i data-lucide="edit" class="w-5 h-5"></i>
                    </button>
                    <button onclick="excluirLancamento(${item.id})" class="text-red-500 hover:text-red-700">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

// 4. Lógica de Cálculos e Cards - COLE AQUI
function calcularTotaisFinanceiros(dados) {
    let totalReceitas = 0;
    let totalDespesas = 0;

    dados.forEach(item => {
        if(item.tipo === 'receita') totalReceitas += parseFloat(item.valor);
        if(item.tipo === 'despesa') totalDespesas += parseFloat(item.valor);
    });

    const saldo = totalReceitas - totalDespesas;

    // Atualiza o HTML dos cards (Verifique os IDs que você usou no seu código)
    document.getElementById('saldo-geral-texto').innerText = `R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    // Atualize os outros cards...
}

// 5. Funções de Salvar/Editar/Excluir vêm aqui para baixo...

// Função auxiliar de data (caso você não tenha colocado no utils.js ainda)
function formatarDataBrasil(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}
