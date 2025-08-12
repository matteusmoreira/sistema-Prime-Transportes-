-- Ensure RLS is enabled
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;

-- Allow Administrador and Financeiro to update any corridas rows
DROP POLICY IF EXISTS "Admin e Financeiro podem atualizar corridas" ON public.corridas;
CREATE POLICY "Admin e Financeiro podem atualizar corridas"
ON public.corridas
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() IN ('Administrador','Financeiro'))
WITH CHECK (public.get_current_user_role() IN ('Administrador','Financeiro'));
