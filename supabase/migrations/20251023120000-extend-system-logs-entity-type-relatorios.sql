-- Migration: Expandir entity_type para incluir 'relatorios' em system_logs
-- Idempotente: remove a constraint antiga sobre entity_type e recria com o novo conjunto

DO $$
DECLARE
  r RECORD;
BEGIN
  -- Remover qualquer CHECK constraint que se aplique a entity_type
  FOR r IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.system_logs'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) ILIKE '%entity_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.system_logs DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Recriar a CHECK constraint permitindo o novo valor 'relatorios'
ALTER TABLE public.system_logs
  ADD CONSTRAINT system_logs_entity_type_check
  CHECK (entity_type IN ('empresas', 'solicitantes', 'motoristas', 'corridas', 'relatorios'));

-- Atualizar comentário para documentar novo tipo
COMMENT ON COLUMN public.system_logs.entity_type IS 'Tipo da entidade afetada: empresas, solicitantes, motoristas, corridas, relatorios';