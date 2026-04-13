// js/modules/equipe/equipe.js

// 1. Função de Inicialização (O roteador vai chamar isso quando abrir a aba)
async function initEquipe() {
    console.log("Módulo de Equipe carregado!");
    await carregarMembrosEquipe();
    
    // Se tiver eventos de input (como a barra de busca), coloque aqui:
    document.getElementById('busca-equipe')?.addEventListener('input', (e) => {
        filtrarEquipe(e.target.value);
    });
}

// 2. Funções de Banco de Dados (Supabase) - COLE SUAS FUNÇÕES AQUI
async function carregarMembrosEquipe() {
    mostrarLoading();
    try {
        // Exemplo da sua chamada Supabase
        const { data, error } = await supabase
            .from('jsp_equipe') // Lembre-se da tabela que você migrou!
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;
        renderizarTabelaEquipe(data);
    } catch (error) {
        console.error("Erro ao carregar equipe:", error);
        mostrarToast("Erro ao carregar equipe", "erro");
    } finally {
        esconderLoading();
    }
}

// 3. Funções de Renderização Visual - COLE SUA LÓGICA DE TABELA AQUI
function renderizarTabelaEquipe(dados) {
    const tbody = document.getElementById('tabela-equipe-body');
    tbody.innerHTML = '';

    dados.forEach(membro => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 font-medium text-slate-800">${membro.nome}</td>
                <td class="p-4 text-slate-600">${membro.cargo}</td>
                <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Ativo</span></td>
                <td class="p-4 text-center">
                    <button onclick="gerarPdfMedicao(${membro.id})" class="text-blue-500 hover:text-blue-700">
                        <i data-lucide="printer" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

// 4. Outras funções (Salvar, Editar, Excluir) vêm aqui para baixo...
