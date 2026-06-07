-- ═══════════════════════════════════════════════════════════
--  BOLÃO COPA 2026 — Schema completo com Auth
--  Cole no SQL Editor do Supabase e clique em Run
-- ═══════════════════════════════════════════════════════════

-- Perfis públicos (ligados ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS perfis (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome      TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Bilhetes (cada um pertence a um usuário)
CREATE TABLE IF NOT EXISTS bilhetes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao        TEXT NOT NULL,
  resultado        TEXT CHECK (resultado IN ('green', 'red', 'void') OR resultado IS NULL),
  jogo_id          INTEGER,
  criado_em        TIMESTAMPTZ DEFAULT now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────

ALTER TABLE perfis   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilhetes ENABLE ROW LEVEL SECURITY;

-- Perfis: todos leem, cada um só edita o próprio
CREATE POLICY "perfis_leitura_publica"
  ON perfis FOR SELECT USING (true);

CREATE POLICY "perfis_insert_proprio"
  ON perfis FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "perfis_update_proprio"
  ON perfis FOR UPDATE USING (auth.uid() = id);

-- Bilhetes: cada um só vê/edita os próprios
CREATE POLICY "bilhetes_select_proprio"
  ON bilhetes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bilhetes_insert_proprio"
  ON bilhetes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bilhetes_update_proprio"
  ON bilhetes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "bilhetes_delete_proprio"
  ON bilhetes FOR DELETE USING (auth.uid() = user_id);

-- ── VIEW PÚBLICA DO RANKING ──────────────────────────────────
-- Expõe só os stats agregados (sem detalhes dos bilhetes)
CREATE OR REPLACE VIEW ranking_publico AS
SELECT
  p.id,
  p.nome,
  COUNT(b.id)                                          AS total,
  COUNT(b.id) FILTER (WHERE b.resultado = 'green')    AS greens,
  COUNT(b.id) FILTER (WHERE b.resultado = 'red')      AS reds,
  COUNT(b.id) FILTER (WHERE b.resultado = 'void')     AS voids
FROM perfis p
LEFT JOIN bilhetes b ON b.user_id = p.id
GROUP BY p.id, p.nome
ORDER BY greens DESC, reds ASC, p.nome;

-- A view herda as policies das tabelas base — é segura por padrão.
-- Para garantir que qualquer um (inclusive anon) leia o ranking:
GRANT SELECT ON ranking_publico TO anon, authenticated;

-- ── REALTIME ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE perfis;
ALTER PUBLICATION supabase_realtime ADD TABLE bilhetes;
