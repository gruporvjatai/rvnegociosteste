// ====== PONTO DE ENTRADA PRINCIPAL ======
window.onload = function () {
    verificarSessao();

    const hoje = new Date();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoAtual = hoje.getFullYear();

    // Seta defaults da Equipe
    const eqpMes = document.getElementById('eqp-filter-mes');
    const eqpAno = document.getElementById('eqp-filter-ano');
    if (eqpMes) eqpMes.value = mesAtual;
    if (eqpAno) eqpAno.value = anoAtual;

    // Seta defaults dos Terceirizados
    const tercMes = document.getElementById('terc-filter-mes');
    const tercAno = document.getElementById('terc-filter-ano');
    if (tercMes) tercMes.value = mesAtual;
    if (tercAno) tercAno.value = anoAtual;

    if (dadosUsuario) {
        showLoading(true);
        loadData();
    }
};