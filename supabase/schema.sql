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
