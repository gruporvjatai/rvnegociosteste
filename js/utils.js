// ====== FUNÇÕES UTILITÁRIAS ======
function formatMoney(val) {
    return parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(d) {
    try {
        return d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
    } catch (e) {
        return '-';
    }
}

function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = show ? 'flex' : 'none';
}

function showToast(msg, isError) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `fixed top-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 ${isError ? 'bg-red-600' : 'bg-slate-800'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

function getTodayDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getNextIdNum(array) {
    let max = 0;
    array.forEach(item => {
        const val = parseInt(item.id);
        if (!isNaN(val) && val > max) max = val;
    });
    return max + 1;
}