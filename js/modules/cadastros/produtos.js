// Variável global para armazenar a lista e facilitar o filtro
let listaProdutos = [];

async function initProdutos() {
    console.log("Módulo de Produtos carregado!");
    await carregarProdutos();
    
    // Filtro em tempo real
    document.getElementById('busca-produto')?.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = listaProdutos.filter(p => 
            (p.descricao && p.descricao.toLowerCase().includes(termo)) || 
            (p.codigo && p.codigo.toLowerCase().includes(termo))
        );
        renderizarTabelaProdutos(filtrados);
    });
}

// ---------------------------------------------
// LEITURA (READ)
// ---------------------------------------------
async function carregarProdutos() {
    mostrarLoading();
    try {
        const { data, error } = await supabase
            .from('jsp_produtos')
            .select('*')
            .order('descricao', { ascending: true });

        if (error) throw error;
        
        listaProdutos = data; // Guarda na memória para o filtro
        renderizarTabelaProdutos(data);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        mostrarToast("Erro ao buscar produtos no banco.", "erro");
    } finally {
        esconderLoading();
    }
}

function renderizarTabelaProdutos(dados) {
    const tbody = document.getElementById('tabela-produtos-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if(dados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    dados.forEach(prod => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                <td class="p-4 text-slate-500 font-mono text-sm">${prod.codigo || 'S/N'}</td>
                <td class="p-4 font-bold text-slate-800">${prod.descricao}</td>
                <td class="p-4 text-slate-600"><span class="bg-slate-100 px-2 py-1 rounded text-xs">${prod.categoria || 'Geral'}</span></td>
                <td class="p-4 text-slate-600">${prod.unidade || 'UN'}</td>
                <td class="p-4 text-center">
                    <button onclick="editarProduto(${prod.id})" class="text-blue-500 hover:text-blue-700 mx-1 transition-colors" title="Editar">
                        <i data-lucide="edit" class="w-5 h-5"></i>
                    </button>
                    <button onclick="excluirProduto(${prod.id})" class="text-red-500 hover:text-red-700 mx-1 transition-colors" title="Excluir">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

// ---------------------------------------------
// INSERÇÃO E EDIÇÃO (CREATE / UPDATE)
// ---------------------------------------------
let idProdutoEditando = null;

function abrirModalProduto() {
    idProdutoEditando = null;
    document.getElementById('form-produto').reset();
    document.getElementById('modal-titulo-produto').innerText = "Novo Produto";
    document.getElementById('modal-produto').classList.remove('hidden');
}

function fecharModalProduto() {
    document.getElementById('modal-produto').classList.add('hidden');
}

async function editarProduto(id) {
    const produto = listaProdutos.find(p => p.id === id);
    if (!produto) return;

    idProdutoEditando = id;
    document.getElementById('prod-codigo').value = produto.codigo || '';
    document.getElementById('prod-descricao').value = produto.descricao || '';
    document.getElementById('prod-categoria').value = produto.categoria || '';
    document.getElementById('prod-unidade').value = produto.unidade || '';
    
    document.getElementById('modal-titulo-produto').innerText = "Editar Produto";
    document.getElementById('modal-produto').classList.remove('hidden');
}

async function salvarProduto(event) {
    event.preventDefault();
    mostrarLoading();

    const dadosFormulario = {
        codigo: document.getElementById('prod-codigo').value,
        descricao: document.getElementById('prod-descricao').value,
        categoria: document.getElementById('prod-categoria').value,
        unidade: document.getElementById('prod-unidade').value
    };

    try {
        if (idProdutoEditando) {
            // Atualizar existente
            const { error } = await supabase
                .from('jsp_produtos')
                .update(dadosFormulario)
                .eq('id', idProdutoEditando);
            if (error) throw error;
            mostrarToast("Produto atualizado com sucesso!", "sucesso");
        } else {
            // Criar novo
            const { error } = await supabase
                .from('jsp_produtos')
                .insert([dadosFormulario]);
            if (error) throw error;
            mostrarToast("Produto cadastrado com sucesso!", "sucesso");
        }

        fecharModalProduto();
        await carregarProdutos(); // Recarrega a tabela

    } catch (error) {
        console.error("Erro ao salvar produto:", error);
        mostrarToast("Erro ao salvar o produto.", "erro");
    } finally {
        esconderLoading();
    }
}

// ---------------------------------------------
// EXCLUSÃO (DELETE)
// ---------------------------------------------
async function excluirProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) return;
    
    mostrarLoading();
    try {
        const { error } = await supabase
            .from('jsp_produtos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        mostrarToast("Produto excluído!", "sucesso");
        await carregarProdutos();

    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        mostrarToast("Erro ao excluir o produto.", "erro");
    } finally {
        esconderLoading();
    }
}
