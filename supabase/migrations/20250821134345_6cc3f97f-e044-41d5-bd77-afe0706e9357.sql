-- Corrigir políticas RLS para a tabela corridas
-- Remover políticas duplicadas e adicionar permissões corretas

-- 1. Remover políticas duplicadas/problemáticas
DROP POLICY IF EXISTS "All authenticated users can view corridas" ON corridas;
DROP POLICY IF EXISTS "Authenticated can select corridas" ON corridas;
DROP POLICY IF EXISTS "Motoristas can update their assigned corridas" ON corridas;

-- 2. Política de SELECT limpa e unificada
CREATE POLICY "Users can view corridas" 
ON corridas 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Política de INSERT para usuários autorizados
CREATE POLICY "Authorized users can create corridas" 
ON corridas 
FOR INSERT 
TO authenticated
WITH CHECK (
  get_current_user_role() = ANY (
    ARRAY['Administrador'::user_role, 'Administração'::user_role, 'Financeiro'::user_role]
  )
);

-- 4. Política de INSERT para motoristas (criando suas próprias corridas)
CREATE POLICY "Motoristas can create their own corridas" 
ON corridas 
FOR INSERT 
TO authenticated
WITH CHECK (
  get_current_user_role() = 'Motorista'::user_role 
  AND (
    motorista = (SELECT nome FROM motoristas WHERE user_id = auth.uid())
    OR motorista_id = (SELECT id FROM motoristas WHERE user_id = auth.uid())
  )
);

-- 5. Melhorar política de UPDATE - manter as existentes mas adicionar clareza
-- Manter a política existente "Admins and administration can manage corridas" que já cobre UPDATE para admin/administração/financeiro

-- Garantir que motoristas possam atualizar suas corridas de forma mais ampla
DROP POLICY IF EXISTS "Motoristas podem atualizar suas corridas" ON corridas;
CREATE POLICY "Motoristas can update their assigned corridas" 
ON corridas 
FOR UPDATE 
TO authenticated
USING (
  get_current_user_role() = 'Motorista'::user_role 
  AND (
    motorista = (SELECT nome FROM motoristas WHERE user_id = auth.uid())
    OR motorista_id = (SELECT id FROM motoristas WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  get_current_user_role() = 'Motorista'::user_role 
  AND (
    motorista = (SELECT nome FROM motoristas WHERE user_id = auth.uid())
    OR motorista_id = (SELECT id FROM motoristas WHERE user_id = auth.uid())
  )
);

-- 6. Garantir que a política de UPDATE para admin/financeiro está correta
DROP POLICY IF EXISTS "Admin e Financeiro podem atualizar corridas" ON corridas;
CREATE POLICY "Admins and finance can update corridas" 
ON corridas 
FOR UPDATE 
TO authenticated
USING (
  get_current_user_role() = ANY (
    ARRAY['Administrador'::user_role, 'Administração'::user_role, 'Financeiro'::user_role]
  )
)
WITH CHECK (
  get_current_user_role() = ANY (
    ARRAY['Administrador'::user_role, 'Administração'::user_role, 'Financeiro'::user_role]
  )
);