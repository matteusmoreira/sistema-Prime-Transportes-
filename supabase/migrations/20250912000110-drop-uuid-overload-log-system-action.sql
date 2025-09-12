-- Migration: Remover overload antigo da função log_system_action com p_entity_id UUID
-- Corrige erro PGRST203 (ambiguidade entre funções com TEXT e UUID)

-- 1) Remover a função antiga (UUID) se existir
DROP FUNCTION IF EXISTS public.log_system_action(
  VARCHAR,  -- p_user_email
  VARCHAR,  -- p_action_type
  VARCHAR,  -- p_entity_type
  UUID,     -- p_entity_id (antigo)
  JSONB,    -- p_old_data
  JSONB,    -- p_new_data
  INET,     -- p_ip_address
  TEXT      -- p_user_agent
);

-- 2) Garantir permissão de execução na versão correta (TEXT)
GRANT EXECUTE ON FUNCTION public.log_system_action(VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, JSONB, INET, TEXT) TO authenticated;