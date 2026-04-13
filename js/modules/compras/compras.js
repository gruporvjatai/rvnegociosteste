// js/modules/compras/compras.js

// Variável global para controlar o carrinho da Nova O.C.
let carrinhoOC = [];

// 1. Inicialização da tela de Histórico (oc.html)
async function initOC() {
    console.log("Aba de Ordens de Compra carregada!");
    await carregarHistoricoOC();
}

// 2. Inicialização da tela de Nova O.C. (pos.html)
async function initPOS() {
    console.log("Aba de Nova O.C. (PDV) carregada!");
    carrinhoOC = []; // Limpa o carrinho ao abrir
    atualizarVisualCarrinho();
    await carregarListasParaNovaOC(); // Carrega fornecedores, obras e produtos
}

// --- FUNÇÕES DA TELA DE HISTÓRICO (oc.html) ---

async function carregarHistoricoOC() {
    mostrarLoading();
    try {
        const { data, error } = await supabase
            .from('tabela_oc') // Substitua pelo nome correto da sua tabela
            .select('*')
            .order('data_emissao', { ascending: false });

        if (error) throw error;
        renderizarTabelaOC(data);
    } catch (error) {
        console.error("Erro ao carregar O.C.s:", error);
    } finally {
        esconderLoading();
    }
}

function renderizarTabelaOC(dados) {
    const tbody = document.getElementById('tabela-oc-body');
    if(!tbody) return; // Segurança caso a pessoa mude de tela rápido
    
    tbody.innerHTML = '';
    // COLE SUA LÓGICA DE RENDERIZAÇÃO DE LINHAS AQUI
    // Exemplo: 
    // dados.forEach(oc => { tbody.innerHTML += `<tr>...</tr>`; });
    lucide.createIcons();
}


// --- FUNÇÕES DA TELA DE NOVA O.C. (pos.html) ---

async function carregarListasParaNovaOC() {
    // COLE AQUI SUAS CHAMADAS PARA PREENCHER OS SELECTS (Fornecedores, Obras, Produtos)
}

function adicionarAoCarrinho(produto) {
    // COLE AQUI SUA LÓGICA DE ADICIONAR ITEM
    // Exemplo básico:
    carrinhoOC.push(produto);
    atualizarVisualCarrinho();
}

function atualizarVisualCarrinho() {
    const divCarrinho = document.getElementById('carrinho-itens');
    const spanTotal = document.getElementById('carrinho-total');
    if(!divCarrinho || !spanTotal) return;

    // COLE AQUI SUA LÓGICA DE DESENHAR O CARRINHO E SOMAR O TOTAL
}

async function finalizarOrdemCompra() {
    // COLE AQUI SUA LÓGICA PARA SALVAR NO SUPABASE E GERAR O PDF
    // Lembre-se de validar se tem fornecedor selecionado e itens no carrinho
}

// Funções de PDF da O.C. podem vir aqui embaixo...
