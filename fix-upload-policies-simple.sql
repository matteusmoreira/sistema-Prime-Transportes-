-- Script SQL simplificado para corrigir políticas RLS de upload de documentos
-- Execute este script no painel do Supabase (SQL Editor)

-- IMPORTANTE: Execute cada comando separadamente para evitar erros

-- 1. Política para permitir motoristas inserir documentos nas suas corridas
CREATE POLICY "Motoristas podem inserir documentos nas suas corridas" ON public.corrida_documentos
  FOR INSERT WITH CHECK (
    corrida_id IN (
      SELECT c.id 
      FROM public.corridas c 
      JOIN public.motoristas m ON c.motorista = m.nome 
      WHERE m.user_id = auth.uid()
    )
  );

-- 2. Política de storage para permitir motoristas fazer upload
CREATE POLICY "Motoristas podem fazer upload de documentos das suas corridas" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'corrida-documentos' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.motoristas 
      WHERE user_id = auth.uid()
    )
  );

-- 3. Política para permitir motoristas atualizarem documentos das suas corridas
CREATE POLICY "Motoristas podem atualizar documentos das suas corridas" ON public.corrida_documentos
  FOR UPDATE USING (
    corrida_id IN (
      SELECT c.id 
      FROM public.corridas c 
      JOIN public.motoristas m ON c.motorista = m.nome 
      WHERE m.user_id = auth.uid()
    )
  );

-- 4. Política para permitir motoristas deletarem documentos das suas corridas
CREATE POLICY "Motoristas podem deletar documentos das suas corridas" ON public.corrida_documentos
  FOR DELETE USING (
    corrida_id IN (
      SELECT c.id 
      FROM public.corridas c 
      JOIN public.motoristas m ON c.motorista = m.nome 
      WHERE m.user_id = auth.uid()
    )
  );

-- 5. Política para permitir motoristas deletarem arquivos do storage
CREATE POLICY "Motoristas podem deletar arquivos das suas corridas" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'corrida-documentos' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.motoristas 
      WHERE user_id = auth.uid()
    )
  );

-- INSTRUÇÕES:
-- 1. Copie e cole cada comando CREATE POLICY separadamente no SQL Editor
-- 2. Execute um por vez
-- 3. Se algum comando der erro "policy already exists", ignore e continue
-- 4. Teste o upload de documentos após executar todos os comandos