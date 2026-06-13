-- ============================================================
-- SCHEMA: Secretaria Monetária (schema "sm" — simples e seguro)
-- Execute todo este SQL no SQL Editor do Supabase Dashboard
-- ============================================================

DROP SCHEMA IF EXISTS "Secretaria-financeira" CASCADE;

CREATE SCHEMA IF NOT EXISTS sm;

-- 1. Categorias
CREATE TABLE sm.sm_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Transacoes
CREATE TABLE sm.sm_transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES sm.sm_categorias(id) ON DELETE RESTRICT,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  data DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índices
CREATE INDEX idx_sm_transacoes_user_data ON sm.sm_transacoes(user_id, data DESC);
CREATE INDEX idx_sm_transacoes_categoria ON sm.sm_transacoes(categoria_id);
CREATE INDEX idx_sm_categorias_user ON sm.sm_categorias(user_id);

-- 4. RLS
ALTER TABLE sm.sm_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm.sm_transacoes ENABLE ROW LEVEL SECURITY;

-- 5. Políticas
CREATE POLICY select_own_cat ON sm.sm_categorias FOR SELECT USING (user_id = auth.uid());
CREATE POLICY insert_own_cat ON sm.sm_categorias FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY update_own_cat ON sm.sm_categorias FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY delete_own_cat ON sm.sm_categorias FOR DELETE USING (user_id = auth.uid());

CREATE POLICY select_own_trans ON sm.sm_transacoes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY insert_own_trans ON sm.sm_transacoes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY update_own_trans ON sm.sm_transacoes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY delete_own_trans ON sm.sm_transacoes FOR DELETE USING (user_id = auth.uid());

-- 6. Status column para transações (confirmada = realizada, pendente = prevista)
ALTER TABLE sm.sm_transacoes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'pendente'));
CREATE INDEX IF NOT EXISTS idx_sm_transacoes_status ON sm.sm_transacoes(user_id, status);

-- 7. Tabela de contas recorrentes
CREATE TABLE IF NOT EXISTS sm.sm_recorrentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES sm.sm_categorias(id) ON DELETE RESTRICT,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sm_recorrentes_user ON sm.sm_recorrentes(user_id);

ALTER TABLE sm.sm_recorrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_rec ON sm.sm_recorrentes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY insert_own_rec ON sm.sm_recorrentes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY update_own_rec ON sm.sm_recorrentes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY delete_own_rec ON sm.sm_recorrentes FOR DELETE USING (user_id = auth.uid());

-- 8. Auditoria (histórico de alterações e exclusões)
CREATE TABLE IF NOT EXISTS sm.sm_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transacao_id UUID REFERENCES sm.sm_transacoes(id) ON DELETE SET NULL,
  acao TEXT NOT NULL CHECK (acao IN ('alteracao', 'exclusao')),
  justificativa TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sm_auditoria_user ON sm.sm_auditoria(user_id, created_at DESC);

ALTER TABLE sm.sm_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_aud ON sm.sm_auditoria FOR SELECT USING (user_id = auth.uid());
CREATE POLICY insert_own_aud ON sm.sm_auditoria FOR INSERT WITH CHECK (user_id = auth.uid());
