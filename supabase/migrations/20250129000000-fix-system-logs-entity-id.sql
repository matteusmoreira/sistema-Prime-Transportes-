-- Corrigir o tipo de dados da coluna entity_id para suportar diferentes tipos de ID
-- Alterar de UUID para TEXT para suportar IDs de diferentes tipos (integer, UUID, etc.)

ALTER TABLE system_logs ALTER COLUMN entity_id TYPE TEXT;

-- Recriar a função log_system_action com o parâmetro entity_id como TEXT
CREATE OR REPLACE FUNCTION log_system_action(
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
    INSERT INTO system_logs (
        user_email, action_type, entity_type, entity_id,
        old_data, new_data, ip_address, user_agent
    ) VALUES (
        p_user_email, p_action_type, p_entity_type, p_entity_id,
        p_old_data, p_new_data, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário atualizado
COMMENT ON COLUMN system_logs.entity_id IS 'ID da entidade que foi afetada (suporta diferentes tipos: integer, UUID, etc.)';