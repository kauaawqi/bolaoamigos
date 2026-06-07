// ═══════════════════════════════════════════════════════════════════════
//  BOLÃO COPA 2026 — app.js  (com Auth + código de convite)
// ═══════════════════════════════════════════════════════════════════════

// ── CONFIG — altere estes dois valores antes de fazer deploy ────────────
const SUPABASE_URL      = 'https://hxndfasblxzhgnbneobo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmRmYXNibHh6aGduYm5lb2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzcyMTAsImV4cCI6MjA5NjQxMzIxMH0.82y4oKWffk2keTqFSJUk8XqBiq3BV80k6TzL8mop9hg';

// Código de convite — mude para qualquer palavra/frase secreta
const CODIGO_CONVITE = 'hexabrasil';
// ────────────────────────────────────────────────────────────────────────

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── STATE ────────────────────────────────────────────────────────────────
let usuarioAtual = null;   // objeto { id, email, nome }
let meusBilhetes = [];
let rankingData  = [];
let editandoId   = null;
let realtimeSub  = null;

// ════════════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════════════
async function init() {
  mostrarLoading(true);

  if (SUPABASE_URL === 'COLE_SUA_URL_AQUI') {
    mostrarLoading(false);
    mostrarTela('auth');
    toast('⚙️ Configure SUPABASE_URL e SUPABASE_ANON_KEY no app.js', 6000);
    return;
  }

  // Verifica sessão existente
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    await entrarNoApp(session.user);
  } else {
    mostrarLoading(false);
    mostrarTela('auth');
  }

  // Escuta mudanças de auth (login/logout em outra aba)
  db.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      await entrarNoApp(session.user);
    } else {
      sairDoApp();
    }
  });
}

// ════════════════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════════════════
async function fazerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha  = document.getElementById('login-senha').value;
  if (!email || !senha) return toast('Preencha e-mail e senha.');

  setBtnLoading('btn-login', true);
  const { error } = await db.auth.signInWithPassword({ email, password: senha });
  setBtnLoading('btn-login', false);

  if (error) toast('Erro ao entrar: ' + traduzirErro(error.message));
}

async function fazerCadastro() {
  const nome    = document.getElementById('cad-nome').value.trim();
  const email   = document.getElementById('cad-email').value.trim();
  const senha   = document.getElementById('cad-senha').value;
  const convite = document.getElementById('cad-convite').value.trim();

  if (!nome)    return toast('Digite seu nome.');
  if (!email)   return toast('Digite seu e-mail.');
  if (senha.length < 6) return toast('Senha deve ter ao menos 6 caracteres.');
  if (convite.toLowerCase() !== CODIGO_CONVITE.toLowerCase())
    return toast('❌ Código de convite inválido.');

  setBtnLoading('btn-cadastro', true);

  // Cria conta no Supabase Auth
  const { data, error } = await db.auth.signUp({ email, password: senha });
  if (error) {
    setBtnLoading('btn-cadastro', false);
    return toast('Erro ao criar conta: ' + traduzirErro(error.message));
  }

  // Cria perfil na tabela perfis
  if (data.user) {
    await db.from('perfis').insert({ id: data.user.id, nome });
  }

  setBtnLoading('btn-cadastro', false);
  toast('✅ Conta criada! Entrando...', 3000);
}

async function fazerLogout() {
  await db.auth.signOut();
}

// ════════════════════════════════════════════════════════════════════════
//  ENTRAR / SAIR DO APP
// ════════════════════════════════════════════════════════════════════════
async function entrarNoApp(user) {
  // Busca perfil
  const { data: perfil } = await db.from('perfis').select('nome').eq('id', user.id).single();
  const nome = perfil?.nome || user.email;

  usuarioAtual = { id: user.id, email: user.email, nome };
  document.getElementById('user-nome').textContent = '👤 ' + nome;

  // Carrega dados
  await Promise.all([carregarMeusBilhetes(), carregarRanking()]);
  assinarRealtime();

  mostrarLoading(false);
  mostrarTela('app');
  renderTudo();
}

function sairDoApp() {
  if (realtimeSub) db.removeChannel(realtimeSub);
  usuarioAtual = null;
  meusBilhetes = [];
  rankingData  = [];
  mostrarTela('auth');
}

// ════════════════════════════════════════════════════════════════════════
//  DADOS
// ════════════════════════════════════════════════════════════════════════
async function carregarMeusBilhetes() {
  const { data } = await db
    .from('bilhetes')
    .select('*')
    .eq('user_id', usuarioAtual.id)
    .order('criado_em', { ascending: false });
  meusBilhetes = data || [];
}

async function carregarRanking() {
  const { data, error } = await db.rpc('get_ranking');
  if (error) console.error('Erro ranking:', error.message);
  rankingData = data || [];
}

// ── REALTIME ─────────────────────────────────────────────────────────────
function assinarRealtime() {
  if (realtimeSub) db.removeChannel(realtimeSub);

  realtimeSub = db.channel('bolao-sync')
    // Meus bilhetes (filtro por user_id via RLS — só recebe os próprios)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'bilhetes',
      filter: `user_id=eq.${usuarioAtual.id}`
    }, async () => {
      await carregarMeusBilhetes();
      renderBilhetes();
      // Atualiza ranking também (contagens mudaram)
      await carregarRanking();
      renderRanking();
    })
    // Perfis novos aparecem no ranking
    .on('postgres_changes', { event: '*', schema: 'public', table: 'perfis' }, async () => {
      await carregarRanking();
      renderRanking();
    })
    .subscribe();
}

// ════════════════════════════════════════════════════════════════════════
//  BILHETES
// ════════════════════════════════════════════════════════════════════════
async function registrarBilhete() {
  const descricao  = document.getElementById('input-bilhete').value.trim();
  const resultado  = document.getElementById('sel-resultado').value || null;
  const jogoId     = document.getElementById('sel-jogo').value || null;

  if (!descricao) return toast('Digite a descrição do bilhete.');

  setBtnLoading('btn-add-bilhete', true);
  const { error } = await db.from('bilhetes').insert({
    user_id: usuarioAtual.id,
    descricao,
    resultado,
    jogo_id: jogoId ? +jogoId : null,
  });
  setBtnLoading('btn-add-bilhete', false);

  if (error) return toast('Erro ao salvar: ' + error.message);
  document.getElementById('input-bilhete').value = '';
  document.getElementById('sel-resultado').value  = '';
  document.getElementById('sel-jogo').value        = '';
}

async function deletarBilhete(id) {
  if (!confirm('Remover este bilhete?')) return;
  const { error } = await db.from('bilhetes').delete().eq('id', id);
  if (error) toast('Erro: ' + error.message);
}

function abrirModal(id) {
  const b = meusBilhetes.find(b => b.id === id);
  if (!b) return;
  editandoId = id;
  document.getElementById('edit-bilhete').value   = b.descricao;
  document.getElementById('edit-resultado').value  = b.resultado || '';
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function fecharModal() {
  editandoId = null;
  document.getElementById('modal-overlay').classList.add('hidden');
}

async function salvarEdicao() {
  if (!editandoId) return;
  const desc = document.getElementById('edit-bilhete').value.trim();
  const res  = document.getElementById('edit-resultado').value || null;

  setBtnLoading('btn-salvar-edicao', true);
  const { error } = await db.from('bilhetes')
    .update({ descricao: desc, resultado: res })
    .eq('id', editandoId);
  setBtnLoading('btn-salvar-edicao', false);

  if (error) return toast('Erro: ' + error.message);
  fecharModal();
}

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});

// ════════════════════════════════════════════════════════════════════════
//  RENDERS
// ════════════════════════════════════════════════════════════════════════

// ── RANKING ───────────────────────────────────────────────────────────────
function renderRanking() {
  const el = document.getElementById('ranking-list');
  if (!rankingData.length) {
    el.innerHTML = '<p class="empty-msg">Nenhum participante ainda.</p>';
    return;
  }

  el.innerHTML = rankingData.map((p, i) => {
    const pos   = i + 1;
    const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '#' + pos;
    const eEu   = usuarioAtual && p.id === usuarioAtual.id;

    return `
      <div class="rank-card pos-${Math.min(pos,4)} ${eEu ? 'rank-eu' : ''}">
        <div class="rank-pos">${medal}</div>
        <div class="rank-name">
          ${esc(p.nome)}
          ${eEu ? '<span class="badge-eu">você</span>' : ''}
        </div>
        <div class="rank-stats">
          <span class="stat-pill pill-green">✅ ${p.greens}</span>
          <span class="stat-pill pill-red">❌ ${p.reds}</span>
          <span class="stat-pill pill-total">📋 ${p.total}</span>
        </div>
      </div>`;
  }).join('');
}

// ── MINI STATS ────────────────────────────────────────────────────────────
function renderMiniStats() {
  const el     = document.getElementById('mini-stats');
  const total  = meusBilhetes.length;
  const green  = meusBilhetes.filter(b => b.resultado === 'green').length;
  const red    = meusBilhetes.filter(b => b.resultado === 'red').length;
  const pend   = meusBilhetes.filter(b => !b.resultado).length;
  const taxa   = total > 0 ? Math.round((green / (green + red || 1)) * 100) : 0;

  el.innerHTML = `
    <div class="mini-stat"><span class="ms-num green">${green}</span><span class="ms-label">Greens</span></div>
    <div class="mini-stat"><span class="ms-num red">${red}</span><span class="ms-label">Reds</span></div>
    <div class="mini-stat"><span class="ms-num">${pend}</span><span class="ms-label">Aguardando</span></div>
    <div class="mini-stat"><span class="ms-num accent">${taxa}%</span><span class="ms-label">Aproveit.</span></div>`;
}

// ── BILHETES ──────────────────────────────────────────────────────────────
function renderBilhetes() {
  renderMiniStats();
  const el       = document.getElementById('lista-bilhetes');
  const filtroRes = document.getElementById('filtro-resultado').value;

  let bs = [...meusBilhetes];
  if (filtroRes === 'green')    bs = bs.filter(b => b.resultado === 'green');
  else if (filtroRes === 'red')    bs = bs.filter(b => b.resultado === 'red');
  else if (filtroRes === 'void')   bs = bs.filter(b => b.resultado === 'void');
  else if (filtroRes === 'pendente') bs = bs.filter(b => !b.resultado);

  if (!bs.length) {
    el.innerHTML = '<p class="empty-msg">Nenhum bilhete encontrado.</p>';
    return;
  }

  const badges = {
    green:   '<span class="bilhete-badge badge-green">✅ Green</span>',
    red:     '<span class="bilhete-badge badge-red">❌ Red</span>',
    void:    '<span class="bilhete-badge badge-void">↩️ Void</span>',
    pending: '<span class="bilhete-badge badge-pending">⏳ Aguardando</span>',
  };

  el.innerHTML = bs.map(b => {
    const jogo = b.jogo_id ? JOGOS.find(j => j.id === b.jogo_id) : null;
    const res  = b.resultado || 'pending';
    const jogoStr = jogo ? `${jogo.time1} x ${jogo.time2} · ${jogo.horario}` : '';

    return `
      <div class="bilhete-item ${res}">
        ${badges[res]}
        <div class="bilhete-info">
          <div class="bilhete-desc">${esc(b.descricao)}</div>
          <div class="bilhete-meta">
            ${jogoStr ? esc(jogoStr) + ' · ' : ''}${formatarData(b.criado_em)}
          </div>
        </div>
        <div class="bilhete-actions">
          <button class="btn btn-sm" onclick="abrirModal('${b.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deletarBilhete('${b.id}')">🗑</button>
        </div>
      </div>`;
  }).join('');
}

// ── JOGOS ─────────────────────────────────────────────────────────────────
function renderJogos() {
  const el     = document.getElementById('lista-jogos');
  const busca  = (document.getElementById('filtro-jogo').value || '').toLowerCase();
  const rodada = document.getElementById('filtro-rodada').value;

  let jogos = [...JOGOS];
  if (rodada) jogos = jogos.filter(j => j.rodada === +rodada);
  if (busca)  jogos = jogos.filter(j =>
    j.time1.toLowerCase().includes(busca) ||
    j.time2.toLowerCase().includes(busca) ||
    j.local.toLowerCase().includes(busca) ||
    j.grupo.toLowerCase().includes(busca)
  );

  if (!jogos.length) { el.innerHTML = '<p class="empty-msg">Nenhum jogo encontrado.</p>'; return; }

  const porRodada = {};
  jogos.forEach(j => {
    if (!porRodada[j.rodada]) porRodada[j.rodada] = {};
    if (!porRodada[j.rodada][j.data]) porRodada[j.rodada][j.data] = [];
    porRodada[j.rodada][j.data].push(j);
  });

  const nomeRodada = { 1: '1ª Rodada', 2: '2ª Rodada', 3: '3ª Rodada' };
  let html = '';
  Object.keys(porRodada).sort().forEach(r => {
    html += `<div class="rodada-titulo">${nomeRodada[r] || 'Rodada '+r}</div>`;
    Object.keys(porRodada[r]).sort().forEach(d => {
      html += `<div class="dia-titulo">${formatarDataJogo(d)}</div>`;
      porRodada[r][d].forEach(j => {
        html += `
          <div class="jogo-card">
            <span class="jogo-horario">${j.horario}</span>
            <div class="jogo-times">${esc(j.time1)} <span>x</span> ${esc(j.time2)}</div>
            <span class="jogo-grupo">Grupo ${j.grupo}</span>
            <span class="jogo-local">📍 ${esc(j.local)}</span>
          </div>`;
      });
    });
  });
  el.innerHTML = html;
}

// ── SELECTS ───────────────────────────────────────────────────────────────
function renderSelects() {
  const jogoOpts = JOGOS.map(j =>
    `<option value="${j.id}">${j.data.slice(5)} ${j.horario} · ${j.time1} x ${j.time2}</option>`
  ).join('');
  document.getElementById('sel-jogo').innerHTML = '<option value="">— nenhum —</option>' + jogoOpts;
}

function renderTudo() {
  renderSelects();
  renderRanking();
  renderBilhetes();
  renderJogos();
}

// ════════════════════════════════════════════════════════════════════════
//  UI HELPERS
// ════════════════════════════════════════════════════════════════════════
function mostrarTela(qual) {
  document.getElementById('tela-auth').classList.toggle('hidden', qual !== 'auth');
  document.getElementById('tela-app').classList.toggle('hidden',  qual !== 'app');
}

function mostrarLoading(sim) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !sim);
}

function setBtnLoading(id, sim) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled    = sim;
  btn.textContent = sim ? '⏳ Aguarde...' : btn.dataset.label;
}

function toast(msg, ms = 3500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), ms);
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatarData(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) + ' ' +
         d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
}

function formatarDataJogo(str) {
  const [y,m,d] = str.split('-').map(Number);
  const dias  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const meses = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const dt = new Date(y, m-1, d);
  return `${dias[dt.getDay()]}, ${d} de ${meses[m]} de ${y}`;
}

function traduzirErro(msg) {
  const map = {
    'Invalid login credentials':     'E-mail ou senha incorretos.',
    'Email not confirmed':            'Confirme seu e-mail antes de entrar.',
    'User already registered':        'E-mail já cadastrado.',
    'Password should be at least 6':  'Senha deve ter ao menos 6 caracteres.',
  };
  for (const [en, pt] of Object.entries(map))
    if (msg.includes(en)) return pt;
  return msg;
}

// ── TABS ──────────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── AUTH TABS ─────────────────────────────────────────────────────────────
document.querySelectorAll('.auth-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const qual = btn.dataset.auth;
    document.getElementById('form-login').classList.toggle('hidden',   qual !== 'login');
    document.getElementById('form-cadastro').classList.toggle('hidden', qual !== 'cadastro');
  });
});

// Enter para submeter formulários
document.getElementById('login-senha').addEventListener('keydown', e => {
  if (e.key === 'Enter') fazerLogin();
});
document.getElementById('cad-convite').addEventListener('keydown', e => {
  if (e.key === 'Enter') fazerCadastro();
});

// ── START ─────────────────────────────────────────────────────────────────
init();
