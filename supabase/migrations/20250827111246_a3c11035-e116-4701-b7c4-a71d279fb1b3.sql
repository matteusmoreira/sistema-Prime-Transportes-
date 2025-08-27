-- Melhorar políticas RLS para corridas - permitir edição completa para usuários autorizados
-- Remover políticas restritivas e criar políticas mais abrangentes

-- Primeiro remover as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Motoristas can create their own corridas" ON public.corridas;
DROP POLICY IF EXISTS "Motoristas can update their assigned corridas" ON public.corridas;
DROP POLICY IF EXISTS "Admins and administration can manage corridas" ON public.corridas;
DROP POLICY IF EXISTS "Admins and finance can update corridas" ON public.corridas;
DROP POLICY IF EXISTS "Authorized users can create corridas" ON public.corridas;

-- Criar novas políticas mais permissivas para Admin, Administração e Financeiro
CREATE POLICY "Admin roles can manage all corridas" 
ON public.corridas 
FOR ALL 
TO authenticated
USING (get_current_user_role() = ANY (ARRAY['Administrador'::user_role, 'Administração'::user_role, 'Financeiro'::user_role]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['Administrador'::user_role, 'Administração'::user_role, 'Financeiro'::user_role]));

-- Política específica para motoristas - podem criar e editar suas próprias corridas
CREATE POLICY "Motoristas can manage their corridas" 
ON public.corridas 
FOR ALL 
TO authenticated
USING (
  get_current_user_role() = 'Motorista'::user_role AND 
  (motorista_id = (SELECT id FROM motoristas WHERE user_id = auth.uid()) OR
   motorista = (SELECT nome FROM motoristas WHERE user_id = auth.uid()))
)
WITH CHECK (
  get_current_user_role() = 'Motorista'::user_role AND 
  (motorista_id = (SELECT id FROM motoristas WHERE user_id = auth.uid()) OR
   motorista = (SELECT nome FROM motoristas WHERE user_id = auth.uid()))
);

-- Habilitar o realtime para a tabela corridas
ALTER TABLE public.corridas REPLICA IDENTITY FULL;

-- Verificar se já está na publicação realtime, se não estiver, adicionar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'corridas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.corridas;
  END IF;
END $$;