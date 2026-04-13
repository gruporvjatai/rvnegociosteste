async function initDashboard() {
    console.log("Dashboard carregado!");
    await carregarDadosDashboard();
}

async function carregarDadosDashboard() {
    mostrarLoading();
    try {
        // COLE AQUI SUAS BUSCAS NO SUPABASE PARA ALIMENTAR O DASHBOARD
        // Ex: Contar quantas obras estão ativas, somar despesas do mês, etc.
        
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    } finally {
        esconderLoading();
    }
}
