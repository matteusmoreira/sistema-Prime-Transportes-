-- Criar políticas RLS para a tabela system_logs

-- Política para permitir que usuários autenticados insiram logs
CREATE POLICY "Authenticated users can insert logs" ON system_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para permitir que usuários autenticados leiam seus próprios logs
CREATE POLICY "Users can read their own logs" ON system_logs
    FOR SELECT
    TO authenticated
    USING (user_email = auth.email());

-- Política para permitir que usuários anônimos leiam logs (se necessário)
CREATE POLICY "Anonymous users can read logs" ON system_logs
    FOR SELECT
    TO anon
    USING (true);

-- Garantir permissões básicas para as roles
GRANT SELECT, INSERT ON system_logs TO authenticated;
GRANT SELECT ON system_logs TO anon;