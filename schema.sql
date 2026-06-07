-- ═══════════════════════════════════════════════════════════
--  BOLÃO COPA 2026 — Schema do Banco de Dados (Supabase)
--  Cole este SQL inteiro no "SQL Editor" do seu projeto Supabase
-- ═══════════════════════════════════════════════════════════

-- Tabela de participantes
CREATE TABLE IF NOT EXISTS participantes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de bilhetes
CREATE TABLE IF NOT EXISTS bilhetes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id  UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  descricao        TEXT NOT NULL,
  resultado        TEXT CHECK (resultado IN ('green', 'red', 'void') OR resultado IS NULL),
  jogo_id          INTEGER,         -- referência ao id em jogos.js (só no front)
  criado_em        TIMESTAMPTZ DEFAULT now()
);

-- ── RLS (Row Level Security) ────────────────────────────────
-- Deixa qualquer um ler e escrever (bolão privado entre amigos).
-- Se quiser restringir por login, edite as policies abaixo.

ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilhetes      ENABLE ROW LEVEL SECURITY;

-- Política: acesso total para todos (anon + authenticated)
CREATE POLICY "acesso_total_participantes"
  ON participantes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acesso_total_bilhetes"
  ON bilhetes FOR ALL USING (true) WITH CHECK (true);

-- ── REALTIME ────────────────────────────────────────────────
-- Habilita publicação das tabelas para o canal realtime
ALTER PUBLICATION supabase_realtime ADD TABLE participantes;
ALTER PUBLICATION supabase_realtime ADD TABLE bilhetes;
