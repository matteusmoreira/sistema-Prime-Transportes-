-- Corrigir políticas RLS para permitir que motoristas façam upload de documentos na OS

-- Adicionar política para permitir motoristas inserir documentos nas corridas
CREATE POLICY "Motoristas podem inserir documentos nas suas corridas" ON public.corrida_documentos
  FOR INSERT WITH CHECK (
    -- Verificar se o motorista está associado à corrida
    corrida_id IN (
      SELECT c.id 
      FROM public.corridas c 
      JOIN public.motoristas m ON c.motorista = m.nome 
      WHERE m.user_id = auth.uid()
    )
  );

-- Adicionar política de storage para permitir motoristas fazer upload
CREATE POLICY "Motoristas podem fazer upload de documentos das suas corridas" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'corrida-documentos' AND
    auth.role() = 'authenticated' AND
    -- Verificar se o usuário é um motorista
    EXISTS (
      SELECT 1 FROM public.motoristas 
      WHERE user_id = auth.uid()
    )
  );

-- Permitir motoristas atualizarem documentos das suas corridas (caso necessário)
CREATE POLICY "Motoristas podem atualizar documentos das suas corridas" ON public.corrida_documentos
  FOR UPDATE USING (
    corrida_id IN (
      SELECT c.id 
      FROM public.corridas c 
      JOIN public.motoristas m ON c.motorista = m.nome 
      WHERE m.user_id = auth.uid()
    )
  );

-- Permitir motoristas deletarem documentos das suas corridas (caso necessário)
CREATE POLICY "Motoristas podem deletar documentos das suas corridas" ON public.corrida_documentos
  FOR DELETE USING (
    corrida_id IN (
      SELECT c.id 
      FROM public.corridas c 
      JOIN public.motoristas m ON c.motorista = m.nome 
      WHERE m.user_id = auth.uid()
    )
  );

-- Permitir motoristas deletarem arquivos do storage das suas corridas
CREATE POLICY "Motoristas podem deletar arquivos das suas corridas" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'corrida-documentos' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.motoristas 
      WHERE user_id = auth.uid()
    )
  );