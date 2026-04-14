// ====== CRUD USUÁRIOS ======
function renderUsers() {
    document.getElementById('users-list').innerHTML = STATE.users.map(u => `
    <tr class="border-b hover:bg-slate-50">
        <td class="p-4 font-bold text-slate-700">${u.nome}</td>
        <td class="p-4 text-blue-600 font-medium">${u.login}</td>
        <td class="p-4 uppercase text-[10px] font-bold text-slate-500">${u.nivel_acesso}</td>
        <td class="p-4 text-center">
            <span class="px-2 py-1 rounded text-[10px] font-bold ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${u.ativo ? 'ATIVO' : 'INATIVO'}</span>
        </td>
        <td class="p-4 text-center">
            <button onclick="openUserForm('${u.id}')" class="text-blue-600 hover:text-blue-800"><i data-lucide="edit-3" width="16"></i></button>
        </td>
    </tr>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openUserForm(id) {
    document.getElementById('user-form-container').classList.remove('hidden');
    const passField = document.getElementById('usr-pass');
    if (id) {
        const u = STATE.users.find(x => x.id == id);
        document.getElementById('usr-id').value = u.id;
        document.getElementById('usr-name').value = u.nome;
        document.getElementById('usr-login').value = u.login;
        document.getElementById('usr-level').value = u.nivel_acesso;
        document.getElementById('usr-status').value = u.ativo ? "true" : "false";
        passField.required = false;
        passField.placeholder = "Deixe em branco para manter a senha";
    } else {
        document.getElementById('user-form-container').querySelector('form').reset();
        document.getElementById('usr-id').value = '';
        document.getElementById('usr-status').value = "true";
        passField.required = true;
        passField.placeholder = "Senha apenas números";
    }
}

async function saveUser(e) {
    e.preventDefault();
    showLoading(true);
    const id = document.getElementById('usr-id').value;
    const isNew = !id;

    const payload = {
        nome: document.getElementById('usr-name').value,
        login: document.getElementById('usr-login').value.trim().toLowerCase(),
        nivel_acesso: document.getElementById('usr-level').value,
        ativo: document.getElementById('usr-status').value === "true"
    };

    const senha = document.getElementById('usr-pass').value;
    if (senha) {
        payload.senha = senha;
    } else if (isNew) {
        showLoading(false);
        return showToast("Senha é obrigatória para novos usuários!", true);
    }

    if (!isNew) payload.id = id;

    const { error } = await sb.from('jsp_usuarios').upsert(payload);

    if (error) {
        showLoading(false);
        return showToast("Erro ao salvar usuário: " + error.message, true);
    }

    document.getElementById('user-form-container').classList.add('hidden');
    showToast("Usuário salvo com sucesso!");
    loadData();
}