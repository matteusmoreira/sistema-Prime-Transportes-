-- Secure self-cadastro de Motoristas e uploads em Storage
-- Habilitar RLS e criar políticas para motoristas, motorista_documentos, motorista_fotos e buckets de storage

-- 1) Tabela motoristas
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motoristas' AND policyname='Motorista can insert own record'
  ) THEN
    CREATE POLICY "Motorista can insert own record"
    ON public.motoristas
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motoristas' AND policyname='Motorista can view own record'
  ) THEN
    CREATE POLICY "Motorista can view own record"
    ON public.motoristas
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motoristas' AND policyname='Admins can manage motoristas'
  ) THEN
    CREATE POLICY "Admins can manage motoristas"
    ON public.motoristas
    FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'Administrador')
    WITH CHECK (public.get_current_user_role() = 'Administrador');
  END IF;
END $$;

-- 2) Tabela motorista_documentos
ALTER TABLE public.motorista_documentos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motorista_documentos' AND policyname='Owner can insert motorista_documentos'
  ) THEN
    CREATE POLICY "Owner can insert motorista_documentos"
    ON public.motorista_documentos
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.get_current_user_role() = 'Administrador' OR
      EXISTS (
        SELECT 1 FROM public.motoristas m
        WHERE m.id = motorista_id AND m.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motorista_documentos' AND policyname='Owner can select motorista_documentos'
  ) THEN
    CREATE POLICY "Owner can select motorista_documentos"
    ON public.motorista_documentos
    FOR SELECT
    TO authenticated
    USING (
      public.get_current_user_role() = 'Administrador' OR
      EXISTS (
        SELECT 1 FROM public.motoristas m
        WHERE m.id = motorista_id AND m.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motorista_documentos' AND policyname='Admins can manage motorista_documentos'
  ) THEN
    CREATE POLICY "Admins can manage motorista_documentos"
    ON public.motorista_documentos
    FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'Administrador')
    WITH CHECK (public.get_current_user_role() = 'Administrador');
  END IF;
END $$;

-- 3) Tabela motorista_fotos
ALTER TABLE public.motorista_fotos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motorista_fotos' AND policyname='Owner can insert motorista_fotos'
  ) THEN
    CREATE POLICY "Owner can insert motorista_fotos"
    ON public.motorista_fotos
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.get_current_user_role() = 'Administrador' OR
      EXISTS (
        SELECT 1 FROM public.motoristas m
        WHERE m.id = motorista_id AND m.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motorista_fotos' AND policyname='Owner can select motorista_fotos'
  ) THEN
    CREATE POLICY "Owner can select motorista_fotos"
    ON public.motorista_fotos
    FOR SELECT
    TO authenticated
    USING (
      public.get_current_user_role() = 'Administrador' OR
      EXISTS (
        SELECT 1 FROM public.motoristas m
        WHERE m.id = motorista_id AND m.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='motorista_fotos' AND policyname='Admins can manage motorista_fotos'
  ) THEN
    CREATE POLICY "Admins can manage motorista_fotos"
    ON public.motorista_fotos
    FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'Administrador')
    WITH CHECK (public.get_current_user_role() = 'Administrador');
  END IF;
END $$;

-- 4) Storage policies for buckets motorista-documentos and motorista-fotos
-- Note: policies live on storage.objects

DO $$ BEGIN
  -- motorista-documentos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Docs: select own or admin'
  ) THEN
    CREATE POLICY "Docs: select own or admin"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'motorista-documentos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Docs: insert to own folder or admin'
  ) THEN
    CREATE POLICY "Docs: insert to own folder or admin"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'motorista-documentos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Docs: update own or admin'
  ) THEN
    CREATE POLICY "Docs: update own or admin"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'motorista-documentos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    )
    WITH CHECK (
      bucket_id = 'motorista-documentos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Docs: delete own or admin'
  ) THEN
    CREATE POLICY "Docs: delete own or admin"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'motorista-documentos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  -- motorista-fotos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Fotos: select own or admin'
  ) THEN
    CREATE POLICY "Fotos: select own or admin"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'motorista-fotos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Fotos: insert to own folder or admin'
  ) THEN
    CREATE POLICY "Fotos: insert to own folder or admin"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'motorista-fotos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Fotos: update own or admin'
  ) THEN
    CREATE POLICY "Fotos: update own or admin"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'motorista-fotos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    )
    WITH CHECK (
      bucket_id = 'motorista-fotos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Fotos: delete own or admin'
  ) THEN
    CREATE POLICY "Fotos: delete own or admin"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'motorista-fotos' AND (
        public.get_current_user_role() = 'Administrador' OR
        auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;
END $$;