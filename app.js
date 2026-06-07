// ═══════════════════════════════════════════════════════════════════════
//  BOLÃO COPA 2026 — app.js
//  Backend: Supabase (realtime sync)
//  Configure SUPABASE_URL e SUPABASE_ANON_KEY abaixo antes de subir.
// ═══════════════════════════════════════════════════════════════════════

const SUPABASE_URL      = 'https://hxndfasblxzhgnbneobo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmRmYXNibHh6aGduYm5lb2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzcyMTAsImV4cCI6MjA5NjQxMzIxMH0.82y4oKWffk2keTqFSJUk8XqBiq3BV80k6TzL8mop9hg';

// ── CLIENTE SUPABASE ─────────────────────────────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── STATE ────────────────────────────────────────────────────────────────
let state = { participantes: [], bilhetes: [] };
let editandoId = null;
let realtimeSub = null;

// ── INIT ─────────────────────────────────────────────────────────────────
async function init() {
  mostrarLoading(true);

  // Verifica configuração
  if (SUPABASE_URL === 'COLE_SUA_URL_AQUI') {
    document.getElementById('config-banner').classList.remove('hidden');
    mostrarLoading(false);
    return;
  }

  await carregarTudo();
  assinarRealtime();
  mostrarLoading(false);
  renderTudo();
}

// ── CARREGAR DADOS ───────────────────────────────────────────────────────
async function carregarTudo() {
  const [{ data: parts }, { data: bills }] = await Promise.all([
    db.from('participantes').select('*').order('nome'),
    db.from('bilhetes').select('*').order('criado_em', { ascending: false }),
  ]);
  state.participantes = parts || [];
  state.bilhetes      = bills || [];
}

// ── REALTIME ─────────────────────────────────────────────────────────────
function assinarRealtime() {
  if (realtimeSub) db.removeChannel(realtimeSub);

  realtimeSub = db.channel('bolao-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'participantes' }, async () => {
      const { data } = await db.from('participantes').select('*').order('nome');
      state.participantes = data || [];
      renderSelects();
      renderRanking();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bilhetes' }, async () => {
      const { data } = await db.from('bilhetes').select('*').order('criado_em', { ascending: false });
      state.bilhetes = data || [];
      renderBilhetes();
      renderRanking();
    })
    .subscribe();
}

// ── PARTICIPANTES ────────────────────────────────────────────────────────
async function adicionarParticipante() {
  const nome = document.getElementById('input-nome').value.trim();
  if (!nome) return alerta('Digite o nome do participante.');
  if (state.participantes.find(p => p.nome.toLowerCase() === nome.toLowerCase()))
    return alerta('Participante já existe.');

  setBtnLoading('btn-add-part', true);
  const { error } = await db.from('participantes').insert({ nome });
  setBtnLoading('btn-add-part', false);

  if (error) return alerta('Erro ao adicionar: ' + error.message);
  document.getElementById('input-nome').value = '';
}

async function deletarParticipante(id) {
  if (!confirm('Remover participante e TODOS os seus bilhetes?')) return;
  await db.from('bilhetes').delete().eq('participante_id', id);
  await db.from('participantes').delete().eq('id', id);
}

// ── BILHETES ──────────────────────────────────────────────────────────────
async function registrarBilhete() {
  const participanteId = document.getElementById('sel-participante').value;
  const descricao      = document.getElementById('input-bilhete').value.trim();
  const resultado      = document.getElementById('sel-resultado').value || null;
  const jogoId         = document.getElementById('sel-jogo').value || null;

  if (!participanteId) return alerta('Selecione um participante.');
  if (!descricao)      return alerta('Digite a descrição do bilhete.');

  setBtnLoading('btn-add-bilhete', true);
  const { error } = await db.from('bilhetes').insert({
    participante_id: participanteId,
    descricao,
    resultado,
    jogo_id: jogoId ? +jogoId : null,
  });
  setBtnLoading('btn-add-bilhete', false);

  if (error) return alerta('Erro ao salvar: ' + error.message);
  document.getElementById('input-bilhete').value = '';
  document.getElementById('sel-resultado').value = '';
  document.getElementById('sel-jogo').value = '';
}

async function deletarBilhete(id) {
  if (!confirm('Remover este bilhete?')) return;
  const { error } = await db.from('bilhetes').delete().eq('id', id);
  if (error) alerta('Erro ao remover: ' + error.message);
}

function abrirModal(id) {
  const b = state.bilhetes.find(b => b.id === id);
  if (!b) return;
  editandoId = id;
  document.getElementById('edit-bilhete').value  = b.descricao;
  document.getElementById('edit-resultado').value = b.resultado || '';
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

  if (error) return alerta('Erro ao salvar: ' + error.message);
  fecharModal();
}

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});

// ── STATS ─────────────────────────────────────────────────────────────────
function statsParticipante(pId) {
  const bs = state.bilhetes.filter(b => b.participante_id === pId);
  return {
    total: bs.length,
    green: bs.filter(b => b.resultado === 'green').length,
    red:   bs.filter(b => b.resultado === 'red').length,
    void:  bs.filter(b => b.resultado === 'void').length,
  };
}

// ── RENDER: RANKING ───────────────────────────────────────────────────────
function renderRanking() {
  const el = document.getElementById('ranking-list');
  if (!state.participantes.length) {
    el.innerHTML = '<p class="empty-msg">Nenhum participante cadastrado ainda.</p>';
    return;
  }

  const lista = state.participantes
    .map(p => ({ ...p, ...statsParticipante(p.id) }))
    .sort((a, b) => b.green - a.green || a.red - b.red || a.nome.localeCompare(b.nome));

  el.innerHTML = lista.map((p, i) => {
    const pos   = i + 1;
    const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '#' + pos;
    return `
      <div class="rank-card pos-${Math.min(pos, 4)}">
        <div class="rank-pos">${medal}</div>
        <div class="rank-name">${esc(p.nome)}</div>
        <div class="rank-stats">
          <span class="stat-pill pill-green">✅ ${p.green} green</span>
          <span class="stat-pill pill-red">❌ ${p.red} red</span>
          <span class="stat-pill pill-total">📋 ${p.total} bilhetes</span>
        </div>
        <button class="btn btn-sm btn-danger" style="margin-left:auto" onclick="deletarParticipante('${p.id}')">🗑</button>
      </div>`;
  }).join('');
}

// ── RENDER: BILHETES ──────────────────────────────────────────────────────
function renderBilhetes() {
  const el         = document.getElementById('lista-bilhetes');
  const filtroPart = document.getElementById('filtro-participante').value;
  const filtroRes  = document.getElementById('filtro-resultado').value;

  let bs = [...state.bilhetes];
  if (filtroPart) bs = bs.filter(b => b.participante_id === filtroPart);
  if (filtroRes === 'green')   bs = bs.filter(b => b.resultado === 'green');
  else if (filtroRes === 'red')   bs = bs.filter(b => b.resultado === 'red');
  else if (filtroRes === 'void')  bs = bs.filter(b => b.resultado === 'void');
  else if (filtroRes === 'pendente') bs = bs.filter(b => !b.resultado);

  if (!bs.length) {
    el.innerHTML = '<p class="empty-msg">Nenhum bilhete encontrado.</p>';
    return;
  }

  el.innerHTML = bs.map(b => {
    const p    = state.participantes.find(x => x.id === b.participante_id);
    const jogo = b.jogo_id ? JOGOS.find(j => j.id === b.jogo_id) : null;
    const res  = b.resultado || 'pending';
    const badge = {
      green:   '<span class="bilhete-badge badge-green">✅ Green</span>',
      red:     '<span class="bilhete-badge badge-red">❌ Red</span>',
      void:    '<span class="bilhete-badge badge-void">↩️ Void</span>',
      pending: '<span class="bilhete-badge badge-pending">⏳ Aguardando</span>',
    }[res];
    const jogoStr = jogo ? `${jogo.time1} x ${jogo.time2} · ${jogo.horario}` : '';

    return `
      <div class="bilhete-item ${res}">
        ${badge}
        <div class="bilhete-info">
          <div class="bilhete-desc">${esc(b.descricao)}</div>
          <div class="bilhete-meta">
            ${p ? esc(p.nome) : '?'}
            ${jogoStr ? ' · ' + esc(jogoStr) : ''}
            · ${formatarData(b.criado_em)}
          </div>
        </div>
        <div class="bilhete-actions">
          <button class="btn btn-sm" onclick="abrirModal('${b.id}')">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarBilhete('${b.id}')">🗑</button>
        </div>
      </div>`;
  }).join('');
}

// ── RENDER: JOGOS ─────────────────────────────────────────────────────────
function renderJogos() {
  const el    = document.getElementById('lista-jogos');
  const busca = (document.getElementById('filtro-jogo').value || '').toLowerCase();
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
    html += `<div class="rodada-titulo">${nomeRodada[r] || 'Rodada ' + r}</div>`;
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

// ── RENDER: SELECTS ───────────────────────────────────────────────────────
function renderSelects() {
  const opts = state.participantes
    .map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
  document.getElementById('sel-participante').innerHTML    = '<option value="">— selecione —</option>' + opts;
  document.getElementById('filtro-participante').innerHTML = '<option value="">Todos os participantes</option>' + opts;

  const jogoOpts = JOGOS.map(j =>
    `<option value="${j.id}">${j.data.slice(5)} ${j.horario} · ${j.time1} x ${j.time2}</option>`
  ).join('');
  document.getElementById('sel-jogo').innerHTML = '<option value="">— nenhum —</option>' + jogoOpts;
}

// ── RENDER TUDO ───────────────────────────────────────────────────────────
function renderTudo() {
  renderSelects();
  renderRanking();
  renderBilhetes();
  renderJogos();
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

// ── HELPERS ───────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatarData(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
         d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDataJogo(str) {
  const [y, m, d] = str.split('-').map(Number);
  const dias  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const meses = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const dt = new Date(y, m - 1, d);
  return `${dias[dt.getDay()]}, ${d} de ${meses[m]} de ${y}`;
}

function mostrarLoading(sim) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !sim);
}

function setBtnLoading(id, sim) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled    = sim;
  btn.textContent = sim ? '⏳ Salvando...' : btn.dataset.label;
}

function alerta(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3500);
}

// ── START ─────────────────────────────────────────────────────────────────
init();
