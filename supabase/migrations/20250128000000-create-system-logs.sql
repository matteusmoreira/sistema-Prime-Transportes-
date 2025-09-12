-- Criar tabela system_logs para auditoria do sistema
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('empresas', 'solicitantes', 'motoristas', 'corridas')),
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_system_logs_user_email ON system_logs(user_email);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_action_type ON system_logs(action_type);
CREATE INDEX idx_system_logs_entity_type ON system_logs(entity_type);
CREATE INDEX idx_system_logs_entity_id ON system_logs(entity_id);
CREATE INDEX idx_system_logs_composite ON system_logs(entity_type, action_type, created_at DESC);

-- Habilitar RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS: apenas administradores específicos podem acessar
CREATE POLICY "Apenas administradores podem ver logs" ON system_logs
    FOR ALL USING (
        auth.jwt() ->> 'email' IN ('matteusmoreira@gmail.com', 'prime.inteligente@gmail.com')
    );

-- Função para inserir logs automaticamente
CREATE OR REPLACE FUNCTION log_system_action(
    p_user_email VARCHAR(255),
    p_action_type VARCHAR(20),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
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

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para excluir todos os logs (uso manual)
CREATE OR REPLACE FUNCTION delete_all_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Verificar se o usuário é administrador
    IF auth.jwt() ->> 'email' NOT IN ('matteusmoreira@gmail.com', 'prime.inteligente@gmail.com') THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir logs';
    END IF;
    
    DELETE FROM system_logs;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para excluir logs por período
CREATE OR REPLACE FUNCTION delete_logs_by_date(
    p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Verificar se o usuário é administrador
    IF auth.jwt() ->> 'email' NOT IN ('matteusmoreira@gmail.com', 'prime.inteligente@gmail.com') THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir logs';
    END IF;
    
    DELETE FROM system_logs 
    WHERE 
        (p_date_from IS NULL OR created_at >= p_date_from) AND
        (p_date_to IS NULL OR created_at <= p_date_to);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões
GRANT ALL PRIVILEGES ON system_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_action TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_logs TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_logs TO authenticated;
GRANT EXECUTE ON FUNCTION delete_logs_by_date TO authenticated;

-- Log inicial será criado automaticamente quando o sistema for usado

-- Comentários para documentação
COMMENT ON TABLE system_logs IS 'Tabela de auditoria para rastrear todas as ações do sistema';
COMMENT ON COLUMN system_logs.user_email IS 'Email do usuário que executou a ação';
COMMENT ON COLUMN system_logs.action_type IS 'Tipo da ação: CREATE, UPDATE ou DELETE';
COMMENT ON COLUMN system_logs.entity_type IS 'Tipo da entidade afetada: empresas, solicitantes, motoristas, corridas';
COMMENT ON COLUMN system_logs.entity_id IS 'ID da entidade que foi afetada';
COMMENT ON COLUMN system_logs.old_data IS 'Dados antes da alteração (NULL para CREATE)';
COMMENT ON COLUMN system_logs.new_data IS 'Dados após a alteração (NULL para DELETE)';
COMMENT ON COLUMN system_logs.ip_address IS 'Endereço IP do usuário';
COMMENT ON COLUMN system_logs.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN system_logs.created_at IS 'Timestamp da ação';