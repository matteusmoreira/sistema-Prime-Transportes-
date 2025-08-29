import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DocumentoUpload {
  id?: string | number;
  nome: string;
  descricao: string;
  arquivo?: File;
  url?: string;
  created_at?: string;
  tipo?: string;
}

export const useCorridaDocuments = (corridaId: number | null) => {
  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const forceReload = useCallback(() => {
    // Removido log de recarregamento forçado
    setReloadTrigger(prev => prev + 1);
  }, []);

  const loadDocumentos = useCallback(async () => {
    if (!corridaId) {
      // Removido log quando não há corridaId
      setDocumentos([]);
      return;
    }

    setLoading(true);
    // Removido log de carregamento

    try {
      const { data, error } = await supabase
        .from('corrida_documentos')
        .select('*')
        .eq('corrida_id', corridaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useCorridaDocuments: Erro ao carregar documentos:', error);
        toast.error('Erro ao carregar documentos');
        return;
      }

      // Removido log de quantidade de documentos carregados
      setDocumentos(data || []);
    } catch (error) {
      console.error('❌ useCorridaDocuments: Erro no catch:', error);
      toast.error('Erro inesperado ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, [corridaId, reloadTrigger]);

  useEffect(() => {
    loadDocumentos();
  }, [loadDocumentos]);

  const uploadDocumento = async (corridaId: number, documento: DocumentoUpload): Promise<boolean> => {
    if (!documento.arquivo) {
      console.error('❌ useCorridaDocuments: Tentando fazer upload sem arquivo');
      return false;
    }

    try {
      // Removido log de início de upload
      
      // 1. Upload do arquivo para o storage
      const fileExtension = documento.arquivo.name.split('.').pop();
      const fileName = `${corridaId}/${documento.nome.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('corrida-documentos')
        .upload(fileName, documento.arquivo);

      if (uploadError) {
        console.error('❌ useCorridaDocuments: Erro no upload do arquivo:', uploadError);
        throw uploadError;
      }

      // Removido log de sucesso de upload

      // 2. Salvar metadata no banco
      const { error: dbError } = await supabase
        .from('corrida_documentos')
        .insert({
          corrida_id: corridaId,
          nome: documento.nome,
          descricao: documento.descricao,
          url: uploadData.path
        });

      if (dbError) {
        console.error('❌ useCorridaDocuments: Erro ao salvar no banco:', dbError);
        // Tentar limpar o arquivo do storage em caso de erro
        await supabase.storage.from('corrida-documentos').remove([uploadData.path]);
        throw dbError;
      }

      // Removido log de sucesso no banco
      forceReload();
      return true;

    } catch (error) {
      console.error('❌ useCorridaDocuments: Erro no upload do documento:', error);
      return false;
    }
  };

  const downloadDocumento = async (documento: DocumentoUpload) => {
    try {
      if (!documento.url) {
        toast.error('URL do documento não encontrada');
        return;
      }

      // Se a URL já é pública (http/https), abrir diretamente
      if (documento.url.startsWith('http')) {
        window.open(documento.url, '_blank');
        return;
      }

      // Caso contrário, baixar do storage
      const { data, error } = await supabase.storage
        .from('corrida-documentos')
        .download(documento.url);

      if (error) {
        console.error('❌ useCorridaDocuments: Erro no download:', error);
        toast.error('Não foi possível baixar o documento');
        return;
      }

      // Criar link de download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documento.nome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${documento.nome} foi baixado com sucesso`);
    } catch (error) {
      console.error('❌ useCorridaDocuments: Erro no download:', error);
      toast.error('Erro inesperado no download');
    }
  };

  return {
    documentos,
    loading,
    forceReload,
    uploadDocumento,
    downloadDocumento
  };
};