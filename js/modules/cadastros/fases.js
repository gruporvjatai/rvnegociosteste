// Variável global
let listaFases = [];

async function initFases() {
    console.log("Módulo de Fases carregado!");
    await carregarFases();
}

// ---------------------------------------------
// LEITURA (READ)
// ---------------------------------------------
async function carregarFases() {
    mostrarLoading();
    try {
        const { data, error } = await supabase
            .from('jsp_fases')
            .select('*')
            .order('ordem', { ascending: true }); // Fases normalmente seguem uma sequência

        if (error) throw error;
        
        listaFases = data;
        renderizarTabelaFases(data);
    } catch (error) {
        console.error("Erro ao carregar fases:", error);
        mostrarToast("Erro ao buscar fases no banco.", "erro");
    } finally {
        esconderLoading();
    }
}

function renderizarTabelaFases(dados) {
    const tbody = document.getElementById('tabela-fases-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if(dados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-500">Nenhuma fase cadastrada.</td></tr>`;
        return;
    }

    dados.forEach(fase => {
        // Controle de cor de status
        const statusClass = fase.status === 'Inativo' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                <td class="p-4 font-black text-slate-400 text-lg"># ${fase.ordem || '-'}</td>
                <td class="p-4 font-bold text-slate-800">${fase.nome}</td>
                <td class="p-4"><span class="px-3 py-1 rounded-full text-xs font-bold ${statusClass}">${fase.status || 'Ativo'}</span></td>
                <td class="p-4 text-center">
                    <button onclick="editarFase(${fase.id})" class="text-blue-500 hover:text-blue-700 mx-1 transition-colors" title="Editar">
                        <i data-lucide="edit" class="w-5 h-5"></i>
                    </button>
                    <button onclick="excluirFase(${fase.id})" class="text-red-500 hover:text-red-700 mx-1 transition-colors" title="Excluir">
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
let idFaseEditando = null;

function abrirModalFase() {
    idFaseEditando = null;
    document.getElementById('form-fase').reset();
    document.getElementById('modal-titulo-fase').innerText = "Nova Fase da Obra";
    document.getElementById('modal-fase').classList.remove('hidden');
}

function fecharModalFase() {
    document.getElementById('modal-fase').classList.add('hidden');
}

async function editarFase(id) {
    const fase = listaFases.find(f => f.id === id);
    if (!fase) return;

    idFaseEditando = id;
    document.getElementById('fase-ordem').value = fase.ordem || '';
    document.getElementById('fase-nome').value = fase.nome || '';
    document.getElementById('fase-status').value = fase.status || 'Ativo';
    
    document.getElementById('modal-titulo-fase').innerText = "Editar Fase da Obra";
    document.getElementById('modal-fase').classList.remove('hidden');
}

async function salvarFase(event) {
    event.preventDefault();
    mostrarLoading();

    const dadosFormulario = {
        ordem: document.getElementById('fase-ordem').value,
        nome: document.getElementById('fase-nome').value,
        status: document.getElementById('fase-status').value
    };

    try {
        if (idFaseEditando) {
            // Atualizar existente
            const { error } = await supabase
                .from('jsp_fases')
                .update(dadosFormulario)
                .eq('id', idFaseEditando);
            if (error) throw error;
            mostrarToast("Fase atualizada com sucesso!", "sucesso");
        } else {
            // Criar novo
            const { error } = await supabase
                .from('jsp_fases')
                .insert([dadosFormulario]);
            if (error) throw error;
            mostrarToast("Fase cadastrada com sucesso!", "sucesso");
        }

        fecharModalFase();
        await carregarFases(); // Recarrega a tabela

    } catch (error) {
        console.error("Erro ao salvar fase:", error);
        mostrarToast("Erro ao salvar a fase.", "erro");
    } finally {
        esconderLoading();
    }
}

// ---------------------------------------------
// EXCLUSÃO (DELETE)
// ---------------------------------------------
async function excluirFase(id) {
    if (!confirm("Tem certeza que deseja excluir esta fase? Ela pode estar atrelada a ordens de compra.")) return;
    
    mostrarLoading();
    try {
        const { error } = await supabase
            .from('jsp_fases')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        mostrarToast("Fase excluída!", "sucesso");
        await carregarFases();

    } catch (error) {
        console.error("Erro ao excluir fase:", error);
        mostrarToast("Erro ao excluir a fase.", "erro");
    } finally {
        esconderLoading();
    }
}
