-- Limpar dados órfãos do motorista ID 8 (Théo Loubach)

-- 1. Excluir fotos órfãs da tabela motorista_fotos
DELETE FROM motorista_fotos WHERE motorista_id = 8;

-- 2. Excluir perfil órfão do usuário theo@gmail.com
DELETE FROM profiles WHERE email = 'theo@gmail.com';