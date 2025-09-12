-- Migration: Ajustar RLS para permitir INSERT por authenticated e garantir entity_id como TEXT
-- Safe/idempotente para múltiplas execuções

-- 1) Garantir que a coluna entity_id é TEXT (caso ainda não tenha sido alterada)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'system_logs' AND column_name = 'entity_id' AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.system_logs ALTER COLUMN entity_id TYPE TEXT;
  END IF;
END $$;

-- 2) Recriar a função log_system_action garantindo p_entity_id TEXT
CREATE OR REPLACE FUNCTION public.log_system_action(
    p_user_email VARCHAR(255),
    p_action_type VARCHAR(20),
    p_entity_type VARCHAR(50),
    p_entity_id TEXT,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.system_logs (
        user_email, action_type, entity_type, entity_id,
        old_data, new_data, ip_address, user_agent
    ) VALUES (
        p_user_email, p_action_type, p_entity_type, p_entity_id,
        p_old_data, p_new_data, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.system_logs.entity_id IS 'ID da entidade que foi afetada (suporta diferentes tipos: integer, UUID, etc.)';

-- 3) Garantir RLS habilitado (não falha se já estiver habilitado)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 4) Política: permitir INSERT para authenticated (mantendo leitura/remoção restrita a admins pela política existente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_logs' AND policyname = 'Authenticated can insert logs'
  ) THEN
    CREATE POLICY "Authenticated can insert logs" ON public.system_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- 5) Regrants úteis (idempotentes)
GRANT EXECUTE ON FUNCTION public.log_system_action(VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, JSONB, INET, TEXT) TO authenticated;
-- Manter privilégios na tabela (RLS continuará controlando acesso)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_logs TO authenticated;