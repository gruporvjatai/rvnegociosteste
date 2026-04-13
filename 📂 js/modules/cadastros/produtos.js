// js/modules/cadastros/produtos.js

async function initProdutos() {
    console.log("Aba de Produtos carregada!");
    await carregarProdutos();
    
    // Adiciona evento de busca em tempo real, se houver
    document.getElementById('busca-produto')?.addEventListener('input', (e) => {
        // filtrarListaProdutos(e.target.value);
    });
}

// Funções do Supabase para Produtos
async function carregarProdutos() {
    mostrarLoading();
    try {
        const { data, error } = await supabase
            .from('jsp_produtos') // Ajuste para o nome da sua tabela no Supabase
            .select('*')
            .order('descricao', { ascending: true });

        if (error) throw error;
        renderizarTabelaProdutos(data);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        mostrarToast("Erro ao buscar produtos", "erro");
    } finally {
        esconderLoading();
    }
}

function renderizarTabelaProdutos(dados) {
    const tbody = document.getElementById('tabela-produtos-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // COLE AQUI SUA LÓGICA DE GERAR AS LINHAS (TR) DA TABELA
    /* Exemplo:
    dados.forEach(prod => {
        tbody.innerHTML += `
            <tr>
                <td class="p-4">${prod.codigo || '-'}</td>
                <td class="p-4 font-medium">${prod.descricao}</td>
                <td class="p-4">${prod.categoria}</td>
                <td class="p-4">${prod.unidade}</td>
                <td class="p-4 text-center">
                    <button onclick="editarProduto(${prod.id})" class="text-blue-500 mr-2"><i data-lucide="edit"></i></button>
                </td>
            </tr>
        `;
    });
    */
    lucide.createIcons();
}

// COLE ABAIXO SUAS FUNÇÕES DE SALVAR, EDITAR E EXCLUIR PRODUTO...
