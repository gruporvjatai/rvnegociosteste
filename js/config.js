// ====== CONFIGURAÇÕES GLOBAIS ======
const supabaseUrl = 'https://lyieiqhkspbowsrlngvn.supabase.co';
const supabaseKey = 'sb_publishable_B2a4vA22qf4XGcrxPDRAaw_13rW51uI';
const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

// Estado global
let dadosUsuario = null;
let STATE = {
    obras: [],
    fornecedores: [],
    produtos: [],
    logs: [],
    users: [],
    equipe: [],
    fases: [],
    ponto: [],
    terceirizados: [],
    producao_terc: []
};
let CART = [];
let CURRENT_OC_ID = null;

// Variáveis de ponto
let currentPontoDias = [];
let currentPontoDiaria = 0;

// Senha secreta para transferência portal
const SENHA_SECRETA = "147258369";