-- Add financeiro-specific columns to corridas
ALTER TABLE public.corridas
  ADD COLUMN IF NOT EXISTS status_pagamento text NOT NULL DEFAULT 'Pendente',
  ADD COLUMN IF NOT EXISTS medicao_nota_fiscal text NOT NULL DEFAULT 'Medição';

-- Ensure RLS remains enabled
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;

-- Keep existing policy for Admin/Financeiro updates (idempotent)
DROP POLICY IF EXISTS "Admin e Financeiro podem atualizar corridas" ON public.corridas;
CREATE POLICY "Admin e Financeiro podem atualizar corridas"
ON public.corridas
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() IN ('Administrador','Financeiro'))
WITH CHECK (public.get_current_user_role() IN ('Administrador','Financeiro'));
