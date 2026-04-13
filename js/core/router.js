// js/core/router.js

const router = {
    // Registra onde cada aba está localizada
    routes: {
        'dash': 'js/modules/dashboard/dashboard.html',
        'oc': 'js/modules/compras/oc.html',
        'pos': 'js/modules/compras/pos.html',
        'fin': 'js/modules/financeiro/financeiro.html',
        'equipe': 'js/modules/equipe/equipe.html',
        'terc': 'js/modules/equipe/terceirizados.html',
        'fornecedores': 'js/modules/cadastros/fornecedores.html',
        'produtos': 'js/modules/cadastros/produtos.html',
        'fases': 'js/modules/cadastros/fases.html'
    },

    navigate: async function(viewId) {
        // 1. Atualiza visual do menu
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('bg-slate-800', 'text-white');
            btn.classList.add('text-slate-400');
        });

        const activeBtn = document.getElementById(`nav-${viewId}`);
        if(activeBtn) {
            activeBtn.classList.add('bg-slate-800', 'text-white');
            activeBtn.classList.remove('text-slate-400');
        }

        // 2. Busca o HTML do módulo
        const mainContainer = document.getElementById('conteudo-principal');
        const url = this.routes[viewId];

        if (!url) {
            console.error("Rota não encontrada:", viewId);
            return;
        }

        try {
            // Mostra loading visualmente
            mainContainer.innerHTML = `<div class="flex justify-center items-center h-64"><div class="loader"></div></div>`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro ao carregar o módulo');
            
            const html = await response.text();
            
            // 3. Injeta o HTML e re-renderiza os ícones
            mainContainer.innerHTML = `<div class="active-section">${html}</div>`;
            lucide.createIcons();

            // Aqui futuramente chamaremos a função Init() de cada arquivo JS (ex: initEquipe())
            
        } catch (error) {
            console.error(error);
            mainContainer.innerHTML = `<div class="text-red-500 font-bold p-4">Erro ao carregar a página: ${viewId}</div>`;
        }
    }
};

// Ao carregar o sistema, abre a aba de dashboard por padrão
window.onload = () => {
    router.navigate('dash');
};
