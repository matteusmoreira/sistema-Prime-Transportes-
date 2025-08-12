-- Fix security: restrict access to motoristas personal data
-- 1) Remove overly-permissive SELECT policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motoristas' AND policyname='All authenticated users can view motoristas'
  ) THEN
    EXECUTE 'DROP POLICY "All authenticated users can view motoristas" ON public.motoristas';
  END IF;
END $$;

-- 2) Ensure restrictive SELECT policies are present
-- Motoristas can only view their own row
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motoristas' AND policyname='Motoristas can view their own data'
  ) THEN
    CREATE POLICY "Motoristas can view their own data"
    ON public.motoristas
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Admins/Administração can manage (includes SELECT) all rows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motoristas' AND policyname='Admins and administration can manage motoristas'
  ) THEN
    CREATE POLICY "Admins and administration can manage motoristas"
    ON public.motoristas
    FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = ANY (ARRAY['Administrador'::user_role, 'Administração'::user_role]))
    WITH CHECK (public.get_current_user_role() = ANY (ARRAY['Administrador'::user_role, 'Administração'::user_role]));
  END IF;
END $$;
