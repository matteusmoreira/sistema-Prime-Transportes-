-- Enable RLS on corridas table (safe if already enabled)
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;

-- Allow motoristas (authenticated users with a matching motorista record) to update ONLY their own corridas
DROP POLICY IF EXISTS "Motoristas podem atualizar suas corridas" ON public.corridas;
CREATE POLICY "Motoristas podem atualizar suas corridas"
ON public.corridas
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.motoristas m
    WHERE m.user_id = auth.uid()
      AND m.nome = public.corridas.motorista
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.motoristas m
    WHERE m.user_id = auth.uid()
      AND m.nome = public.corridas.motorista
  )
);

-- Optional: ensure authenticated users can select corridas (keeps current visibility working for motorista/finance/Admin)
-- If a broader SELECT policy already exists, this will not interfere.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'corridas' AND policyname = 'Authenticated can select corridas'
  ) THEN
    CREATE POLICY "Authenticated can select corridas"
    ON public.corridas
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END$$;