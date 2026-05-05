// ============================================================
// ABA: USUÁRIOS (view-users) – acesso restrito ao admin
// ============================================================

let usersModalsCreated = false;

function createUsersModals() {
  if (usersModalsCreated) return;
  const modalHTML = `
    <div id="user-form-container" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <form onsubmit="saveUser(event)" class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 class="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><i data-lucide="user-plus" class="text-blue-600"></i> Dados do Usuário</h3>
        <input type="hidden" id="usr-id">
        <div class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase">Nome Completo</label>
            <input type="text" id="usr-name" required class="w-full p-2 border rounded outline-none focus:border-blue-600">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase">Login (Usuário)</label>
            <input type="text" id="usr-login" required class="w-full p-2 border rounded outline-none focus:border-blue-600">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase">Senha (Somente números)</label>
            <input type="password" id="usr-pass" inputmode="numeric" pattern="[0-9]*" oninput="this.value = this.value.replace(/[^0-9]/g, '')" placeholder="Deixe em branco para não alterar" class="w-full p-2 border rounded outline-none focus:border-blue-600">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Nível de Acesso</label>
              <select id="usr-level" class="w-full p-2 border rounded outline-none focus:border-blue-600 font-bold">
                <option value="comprador">Comprador</option>
                <option value="admin">Administrador</option>
                <option value="registros">Registro de Ponto</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Status</label>
              <select id="usr-status" class="w-full p-2 border rounded outline-none focus:border-blue-600 font-bold">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button type="button" onclick="document.getElementById('user-form-container').classList.add('hidden')" class="flex-1 p-2 bg-slate-200 rounded font-bold hover:bg-slate-300">Cancelar</button>
          <button type="submit" class="flex-1 p-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-800">Salvar</button>
        </div>
      </form>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  usersModalsCreated = true;
}

function renderViewUsers() {
  const container = document.getElementById('view-users');
  if (container.dataset.rendered === 'true') {
    renderUsers();
    return;
  }

  const viewHTML = `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2"><i data-lucide="shield" class="text-blue-600"></i> Gerenciar Usuários</h2>
      <button onclick="openUserForm()" class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2"><i data-lucide="plus"></i> Novo Usuário</button>
    </div>
    <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-100 text-slate-700"><tr><th class="p-4">Nome</th><th class="p-4">Usuário (Login)</th><th class="p-4">Nível</th><th class="p-4 text-center">Status</th><th class="p-4 text-center">Ações</th></tr></thead>
        <tbody id="users-list" class="divide-y"></tbody>
      </table>
    </div>`;

  container.innerHTML = viewHTML;
  container.dataset.rendered = 'true';
  renderUsers();
  lucide.createIcons();
}

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
  lucide.createIcons();
}

function openUserForm(id) {
  document.getElementById('user-form-container').classList.remove('hidden');
  const passField = document.getElementById('usr-pass');
  if(id) {
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

  if(!isNew) payload.id = id;

  const { error } = await sb.from('jsp_usuarios').upsert(payload);

  if(error) {
    showLoading(false);
    return showToast("Erro ao salvar usuário: " + error.message, true);
  }

  document.getElementById('user-form-container').classList.add('hidden');
  showToast("Usuário salvo com sucesso!");
  loadData();
}
