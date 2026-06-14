-- ============================================================
-- Migration 001: status column, sm_recorrentes, sm_auditoria
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Coluna status em sm_transacoes
ALTER TABLE sm.sm_transacoes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'pendente'));
CREATE INDEX IF NOT EXISTS idx_sm_transacoes_status ON sm.sm_transacoes(user_id, status);

-- 2. Tabela de contas recorrentes
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

-- 3. Tabela de auditoria
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
