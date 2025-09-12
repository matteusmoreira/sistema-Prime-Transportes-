-- Verificar políticas RLS para a tabela system_logs
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'system_logs';

-- Verificar permissões da tabela
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'system_logs'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;