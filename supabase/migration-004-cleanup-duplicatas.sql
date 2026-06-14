-- migration-004-cleanup-duplicatas.sql
-- Remove transações duplicadas criadas pelo autoCriarRecorrentes
-- Mantém apenas a mais antiga de cada conjunto duplicado
-- (mesmo user_id + descricao + tipo + categoria_id + mês)

BEGIN;

WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, descricao, tipo, categoria_id, TO_CHAR(data, 'YYYY-MM')
           ORDER BY created_at
         ) AS rn
  FROM sm_transacoes
)
DELETE FROM sm_transacoes
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

COMMIT;
