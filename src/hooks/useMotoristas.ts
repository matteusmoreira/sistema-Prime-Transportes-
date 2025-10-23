import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';
import { useLogInterceptor, LogDataExtractors } from './useLogInterceptor';
import { useLogs } from '@/contexts/LogsContext';

export interface DocumentoMotorista {
  id: string;
  nome: string;
  descricao: string;
  arquivo?: string;
  dataUpload: string;
}

export interface FotoVeiculo {
  id: string;
  nome: string;
  arquivo?: string;
  tamanho: number;
  dataUpload: string;
}

export interface Motorista {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cnh: string;
  cnhDataValidade: string;
  pix?: string;
  status: 'Pendente' | 'Aprovado' | 'Reprovado';
  documentos: DocumentoMotorista[];
  fotosVeiculo: FotoVeiculo[];
  user_id?: string;
}

export const useMotoristas = () => {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuthDependentData();
  const { logAction } = useLogs();

  // Expor função para recarregar lista externamente
  const loadMotoristas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMotoristas(data as Motorista[]);
    } catch (err) {
      console.error('Erro ao carregar motoristas:', err);
      toast.error('Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar motoristas ao montar/alterar usuário
  useEffect(() => {
    loadMotoristas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Extractors para interceptor de logs
  const extractors: LogDataExtractors<Motorista> = {
    create: (args) => ({ entityId: '', newData: args[0] }),
    update: (args) => ({ entityId: args[0]?.toString() || 'unknown', newData: args[1] }),
    delete: (args) => ({ entityId: args[0]?.toString() || 'unknown', oldData: motoristas.find(m => m.id === args[0]) || {} })
  };

  const { interceptCreate, interceptUpdate, interceptDelete } = useLogInterceptor<Motorista>(extractors);

  const originalAddMotorista = async (novo: Omit<Motorista, 'id' | 'documentos' | 'fotosVeiculo' | 'status'> & { status?: Motorista['status'] }) => {
    try {
      const base = { ...novo, status: novo.status || 'Pendente' };
      const { data, error } = await supabase.from('motoristas').insert(base).select('*').single();
      if (error) throw error;
      setMotoristas(prev => [data as Motorista, ...prev]);
      toast.success('Motorista adicionado com sucesso');
      return data as Motorista;
    } catch (error) {
      console.error('Erro ao adicionar motorista:', error);
      toast.error('Erro ao adicionar motorista');
      throw error;
    }
  };

  const addMotorista = interceptCreate(
    originalAddMotorista,
    'motoristas',
    (args, created) => ({ entityId: created?.id?.toString() || 'unknown', newData: created || args[0] })
  );

  const originalUpdateMotorista = async (id: number, updates: Partial<Motorista>) => {
    try {
      const { data, error } = await supabase.from('motoristas').update(updates).eq('id', id).select('*').single();
      if (error) throw error;
      setMotoristas(prev => prev.map(m => (m.id === id ? (data as Motorista) : m)));
      toast.success('Motorista atualizado com sucesso');
      return data as Motorista;
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      toast.error('Erro ao atualizar motorista');
      throw error;
    }
  };

  const updateMotorista = interceptUpdate(
    originalUpdateMotorista,
    'motoristas',
    (args, updated) => ({ entityId: args[0]?.toString() || updated?.id?.toString() || 'unknown', newData: updated || args[1] })
  );

  const originalDeleteMotorista = async (id: number) => {
    try {
      // 1. Carregar documentos/fotos do motorista para exclusão (se necessário)
      const [{ data: docs }, { data: fotos }] = await Promise.all([
        supabase.from('motorista_documentos').select('id, url, nome').eq('motorista_id', id),
        supabase.from('motorista_fotos').select('id, url, nome').eq('motorista_id', id)
      ]);

      // 2. Remover arquivos do storage
      if (docs && docs.length > 0) {
        const paths = docs.map(d => d.url).filter(Boolean);
        if (paths.length) {
          await supabase.storage.from('motorista-documentos').remove(paths);
        }
      }
      if (fotos && fotos.length > 0) {
        const paths = fotos.map(f => f.url).filter(Boolean);
        if (paths.length) {
          await supabase.storage.from('motorista-fotos').remove(paths);
        }
      }

      // 3. Remover registros do banco
      await supabase.from('motorista_documentos').delete().eq('motorista_id', id);
      await supabase.from('motorista_fotos').delete().eq('motorista_id', id);

      // 4. Remover o motorista
      const { error: deleteError } = await supabase.from('motoristas').delete().eq('id', id);
      if (deleteError) throw deleteError;

      // 5. Excluir usuário de autenticação, se houver
      if (user?.id) {
        try {
          const { data: motoristaData } = await supabase
            .from('motoristas')
            .select('user_id')
            .eq('id', id)
            .single();

          if (motoristaData?.user_id) {
            const { error: authError } = await supabase.auth.admin.deleteUser(motoristaData.user_id);
            if (authError) {
              // console.warn('Erro ao excluir usuário de autenticação:', authError);
            } else {
              // Removido log informativo: usuário de autenticação excluído
            }
          }
        } catch (authDeleteError) {
          // console.warn('Não foi possível excluir usuário de autenticação:', authDeleteError);
        }
      }

      // 12. Atualizar estado local
      setMotoristas(prev => prev.filter(m => m.id !== id));
      // Removido log: exclusão completa finalizada
      toast.success('Motorista e todos os dados relacionados excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      toast.error('Erro ao excluir motorista');
    }
  };

  const deleteMotorista = interceptDelete(
    originalDeleteMotorista,
    'motoristas',
    (args) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: motoristas.find(m => m.id === args[0]) || {}
    })
  );

  const approveMotorista = async (id: number) => {
    await updateMotorista(id, { status: 'Aprovado' });
  };

  const rejectMotorista = async (id: number) => {
    await updateMotorista(id, { status: 'Reprovado' });
  };

  const getMotoristaByEmail = (email: string) => {
    return motoristas.find(m => m.email === email);
  };

  // Exclusão individual de documento
  const deleteDocumento = async (docId: number, url: string) => {
    let docRow: { id: number; nome: string; motorista_id: number; url: string } | null = null;
    try {
      // Buscar dados do documento para log (inclui motorista_id)
      const { data: fetchedDoc } = await supabase
        .from('motorista_documentos')
        .select('id, nome, motorista_id, url')
        .eq('id', docId)
        .single();
      if (fetchedDoc) docRow = fetchedDoc as any;

      const storagePath = url || docRow?.url;
      if (storagePath) {
        await supabase.storage.from('motorista-documentos').remove([storagePath]);
      }
      await supabase.from('motorista_documentos').delete().eq('id', docId);
      toast.success('Documento excluído com sucesso');

      // Log de auditoria para exclusão de documento de motorista
      const entityId = docRow?.motorista_id ? String(docRow.motorista_id) : 'unknown';
      const oldData = docRow
        ? { acao: 'delete_documento', documento: { id: docRow.id, nome: docRow.nome, path: docRow.url } }
        : { acao: 'delete_documento', documento: { id: docId, path: url || '' } };

      await logAction({
        action_type: 'DELETE',
        entity_type: 'motoristas',
        entity_id: entityId,
        old_data: oldData,
        new_data: null
      });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Não foi possível excluir o documento');
    }
  };

  // Exclusão individual de foto
  const deleteFoto = async (fotoId: number, url: string) => {
    let fotoRow: { id: number; nome: string; motorista_id: number; url: string } | null = null;
    try {
      const { data: fetchedFoto } = await supabase
        .from('motorista_fotos')
        .select('id, nome, motorista_id, url')
        .eq('id', fotoId)
        .single();
      if (fetchedFoto) fotoRow = fetchedFoto as any;

      const storagePath = url || fotoRow?.url;
      if (storagePath) {
        await supabase.storage.from('motorista-fotos').remove([storagePath]);
      }
      await supabase.from('motorista_fotos').delete().eq('id', fotoId);
      toast.success('Foto excluída com sucesso');

      // Log de auditoria para exclusão de foto de motorista
      const entityId = fotoRow?.motorista_id ? String(fotoRow.motorista_id) : 'unknown';
      const oldData = fotoRow
        ? { acao: 'delete_foto', foto: { id: fotoRow.id, nome: fotoRow.nome, path: fotoRow.url } }
        : { acao: 'delete_foto', foto: { id: fotoId, path: url || '' } };

      await logAction({
        action_type: 'DELETE',
        entity_type: 'motoristas',
        entity_id: entityId,
        old_data: oldData,
        new_data: null
      });
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      toast.error('Não foi possível excluir a foto');
    }
  };

  return {
    motoristas,
    loading,
    addMotorista,
    updateMotorista,
    deleteMotorista,
    approveMotorista,
    rejectMotorista,
    getMotoristaByEmail,
    loadMotoristas,
    deleteDocumento,
    deleteFoto
  };
};