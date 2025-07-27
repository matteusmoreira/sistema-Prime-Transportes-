import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';

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
  status: 'Pendente' | 'Aprovado' | 'Reprovado';
  documentos: DocumentoMotorista[];
  fotosVeiculo: FotoVeiculo[];
  user_id?: string;
}

export const useMotoristas = () => {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const { shouldLoadData, isAuthLoading } = useAuthDependentData();

  // Carregar motoristas do Supabase
  const loadMotoristas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .order('nome');
      
      if (error) {
        console.error('Erro ao carregar motoristas:', error);
        toast.error('Erro ao carregar motoristas');
        return;
      }

      if (!data) {
        setMotoristas([]);
        return;
      }

      // Carregar documentos e fotos para cada motorista
      const motoristasWithDocs = await Promise.all(
        data.map(async (motorista) => {
          // Carregar documentos
          const { data: documentos } = await supabase
            .from('motorista_documentos')
            .select('*')
            .eq('motorista_id', motorista.id);

          // Carregar fotos
          const { data: fotos } = await supabase
            .from('motorista_fotos')
            .select('*')
            .eq('motorista_id', motorista.id);

          const documentosFormatted: DocumentoMotorista[] = (documentos || []).map(doc => ({
            id: doc.id.toString(),
            nome: doc.nome,
            descricao: doc.tipo || '',
            arquivo: doc.url,
            dataUpload: new Date(doc.created_at).toLocaleDateString('pt-BR')
          }));

          const fotosFormatted: FotoVeiculo[] = (fotos || []).map(foto => ({
            id: foto.id.toString(),
            nome: foto.nome,
            arquivo: foto.url,
            tamanho: foto.tamanho || 0,
            dataUpload: new Date(foto.created_at).toLocaleDateString('pt-BR')
          }));

          return {
            id: motorista.id,
            nome: motorista.nome,
            cpf: motorista.cpf || '',
            telefone: motorista.telefone || '',
            email: motorista.email,
            cnh: motorista.cnh || '',
            cnhDataValidade: motorista.validade_cnh || '',
            status: motorista.status || 'Pendente',
            documentos: documentosFormatted,
            fotosVeiculo: fotosFormatted,
            user_id: motorista.user_id || undefined
          };
        })
      );

      setMotoristas(motoristasWithDocs);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      toast.error('Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoadData) {
      loadMotoristas();
    } else if (!isAuthLoading) {
      setLoading(false);
    }
  }, [shouldLoadData, isAuthLoading]);

  // Função para sanitizar nomes de arquivo
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize('NFD') // Decomposição de caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por underscore
      .replace(/_{2,}/g, '_') // Remove underscores múltiplos
      .replace(/^_|_$/g, '') // Remove underscores do início e fim
      .toLowerCase(); // Converte para minúsculas
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    console.log('Tentando upload:', { bucket, path, fileName: file.name });
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw error;
    }

    console.log('Upload realizado com sucesso:', data);
    return data;
  };

  const addMotorista = async (formData: Omit<Motorista, 'id'> | (Omit<Motorista, 'id' | 'status'> & { status?: 'Pendente' | 'Aprovado' | 'Reprovado' })) => {
    console.log('=== INICIANDO CADASTRO DE MOTORISTA ===');
    console.log('Form data recebido:', formData);
    console.log('Documentos:', formData.documentos);
    console.log('Fotos:', formData.fotosVeiculo);
    
    try {
      // Verificar se é um admin criando o motorista
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      let data, motoristaId;

      if (profile?.role === 'Administrador') {
        // Criar conta via edge function
        console.log('Admin criando conta via edge function...');
        const { data: response, error } = await supabase.functions.invoke('create-motorista-account', {
          body: {
            email: formData.email,
            nome: formData.nome,
            cpf: formData.cpf,
            telefone: formData.telefone,
            cnh: formData.cnh,
            validadeCnh: formData.cnhDataValidade
          }
        });

        if (error) throw error;
        if (!response.success) throw new Error(response.error);
        
        data = response.motorista;
        motoristaId = data.id;
        
        toast.success(response.message);
      } else {
        // Criar apenas o registro do motorista (para motoristas se auto-cadastrando)
        console.log('Criando motorista no banco...');
        const { data: motoristaData, error } = await supabase
          .from('motoristas')
          .insert([{
            nome: formData.nome,
            cpf: formData.cpf || null,
            telefone: formData.telefone || null,
            email: formData.email,
            cnh: formData.cnh || null,
            validade_cnh: formData.cnhDataValidade || null,
            status: (formData as any).status || 'Pendente'
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro detalhado ao adicionar motorista:', error);
          
          // Tratamento específico para erro de CPF duplicado
          if (error.code === '23505' && error.message.includes('motoristas_cpf_key')) {
            toast.error('Este CPF já está cadastrado no sistema');
          } else {
            toast.error(`Erro ao adicionar motorista: ${error.message}`);
          }
          return;
        }

        data = motoristaData;
        motoristaId = data.id;
      }

      const documentosUploadados: DocumentoMotorista[] = [];
      const fotosUploadadas: FotoVeiculo[] = [];

      // Upload dos documentos
      for (const doc of formData.documentos) {
        if (doc.arquivo) {
          try {
            // Buscar o arquivo original do input file
            const arquivo = (doc as any).arquivoFile; // Arquivo File real
            if (arquivo instanceof File) {
              const sanitizedName = sanitizeFileName(arquivo.name);
              const fileName = `${motoristaId}-${Date.now()}-${sanitizedName}`;
              console.log('Upload de documento:', { original: arquivo.name, sanitized: sanitizedName, final: fileName });
              await uploadFile(arquivo, 'motorista-documentos', fileName);
              
              // Salvar referência no banco
              const { error: docError } = await supabase
                .from('motorista_documentos')
                .insert({
                  motorista_id: motoristaId,
                  nome: doc.nome,
                  tipo: doc.descricao,
                  url: fileName
                });

              if (!docError) {
                documentosUploadados.push({
                  id: doc.id,
                  nome: doc.nome,
                  descricao: doc.descricao,
                  arquivo: fileName,
                  dataUpload: new Date().toISOString().split('T')[0]
                });
              }
            }
          } catch (uploadError) {
            console.error('Erro no upload do documento:', uploadError);
            toast.error(`Erro no upload do documento: ${doc.nome}`);
          }
        }
      }

      // Upload das fotos
      for (const foto of formData.fotosVeiculo) {
        if (foto.arquivo) {
          try {
            const arquivo = (foto as any).arquivoFile; // Arquivo File real
            if (arquivo instanceof File) {
              const sanitizedName = sanitizeFileName(arquivo.name);
              const fileName = `${motoristaId}-${Date.now()}-${sanitizedName}`;
              console.log('Upload de foto:', { original: arquivo.name, sanitized: sanitizedName, final: fileName });
              await uploadFile(arquivo, 'motorista-fotos', fileName);
              
              // Salvar referência no banco
              const { error: fotoError } = await supabase
                .from('motorista_fotos')
                .insert({
                  motorista_id: motoristaId,
                  nome: foto.nome,
                  nome_original: arquivo.name,
                  url: fileName,
                  tamanho: foto.tamanho
                });

              if (!fotoError) {
                fotosUploadadas.push({
                  id: foto.id,
                  nome: foto.nome,
                  arquivo: fileName,
                  tamanho: foto.tamanho,
                  dataUpload: new Date().toISOString().split('T')[0]
                });
              }
            }
          } catch (uploadError) {
            console.error('Erro no upload da foto:', uploadError);
            toast.error(`Erro no upload da foto: ${foto.nome}`);
          }
        }
      }

      const newMotorista: Motorista = {
        id: data.id,
        nome: data.nome,
        cpf: data.cpf || '',
        telefone: data.telefone || '',
        email: data.email,
        cnh: data.cnh || '',
        cnhDataValidade: data.validade_cnh || '',
        status: (formData as any).status || 'Pendente',
        documentos: documentosUploadados,
        fotosVeiculo: fotosUploadadas
      };

      setMotoristas(prev => [...prev, newMotorista]);
      
      if (profile?.role !== 'Administrador') {
        toast.success('Motorista cadastrado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar motorista:', error);
      toast.error('Erro ao adicionar motorista');
    }
  };

  const updateMotorista = async (id: number, updatedData: Partial<Motorista>) => {
    console.log('Atualizando motorista:', id, updatedData);
    
    try {
      // Atualizar dados básicos do motorista
      const { error } = await supabase
        .from('motoristas')
        .update({
          nome: updatedData.nome,
          cpf: updatedData.cpf,
          telefone: updatedData.telefone,
          email: updatedData.email,
          cnh: updatedData.cnh,
          validade_cnh: updatedData.cnhDataValidade,
          status: updatedData.status
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar motorista:', error);
        toast.error('Erro ao atualizar motorista');
        return;
      }

      // Processar novos documentos se existirem
      if (updatedData.documentos) {
        for (const doc of updatedData.documentos) {
          const arquivo = (doc as any).arquivoFile;
          if (arquivo instanceof File) {
            try {
              const sanitizedName = sanitizeFileName(arquivo.name);
              const fileName = `${id}-${Date.now()}-${sanitizedName}`;
              await uploadFile(arquivo, 'motorista-documentos', fileName);
              
              // Salvar referência no banco
              await supabase
                .from('motorista_documentos')
                .insert({
                  motorista_id: id,
                  nome: doc.nome,
                  tipo: doc.descricao,
                  url: fileName
                });
            } catch (uploadError) {
              console.error('Erro no upload do documento:', uploadError);
              toast.error(`Erro no upload do documento: ${doc.nome}`);
            }
          }
        }
      }

      // Processar novas fotos se existirem
      if (updatedData.fotosVeiculo) {
        for (const foto of updatedData.fotosVeiculo) {
          const arquivo = (foto as any).arquivoFile;
          if (arquivo instanceof File) {
            try {
              const sanitizedName = sanitizeFileName(arquivo.name);
              const fileName = `${id}-${Date.now()}-${sanitizedName}`;
              await uploadFile(arquivo, 'motorista-fotos', fileName);
              
              // Salvar referência no banco
              await supabase
                .from('motorista_fotos')
                .insert({
                  motorista_id: id,
                  nome: foto.nome,
                  nome_original: arquivo.name,
                  url: fileName,
                  tamanho: foto.tamanho
                });
            } catch (uploadError) {
              console.error('Erro no upload da foto:', uploadError);
              toast.error(`Erro no upload da foto: ${foto.nome}`);
            }
          }
        }
      }

      // Recarregar dados atualizados
      await loadMotoristas();
      toast.success('Motorista atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      toast.error('Erro ao atualizar motorista');
    }
  };

  const deleteMotorista = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este motorista? Esta ação removerá TODOS os dados relacionados incluindo documentos, fotos e conta de usuário.')) {
      return;
    }

    try {
      console.log('=== INICIANDO EXCLUSÃO COMPLETA DO MOTORISTA ===', id);
      
      // 1. Buscar dados do motorista primeiro
      const { data: motorista } = await supabase
        .from('motoristas')
        .select('*, user_id, email')
        .eq('id', id)
        .single();

      if (!motorista) {
        toast.error('Motorista não encontrado');
        return;
      }

      console.log('Motorista encontrado:', motorista);

      // 2. Verificar se existem corridas associadas
      const { data: corridas } = await supabase
        .from('corridas')
        .select('id')
        .eq('motorista_id', id);

      if (corridas && corridas.length > 0) {
        toast.error('Não é possível excluir motorista com corridas associadas');
        return;
      }

      // 3. Buscar documentos para excluir arquivos do storage
      const { data: documentos } = await supabase
        .from('motorista_documentos')
        .select('*')
        .eq('motorista_id', id);

      console.log('Documentos encontrados:', documentos?.length || 0);

      // 4. Buscar fotos para excluir arquivos do storage
      const { data: fotos } = await supabase
        .from('motorista_fotos')
        .select('*')
        .eq('motorista_id', id);

      console.log('Fotos encontradas:', fotos?.length || 0);

      // 5. Excluir arquivos de documentos do storage
      if (documentos && documentos.length > 0) {
        for (const doc of documentos) {
          try {
            const filePath = doc.url.split('/').pop();
            if (filePath) {
              await supabase.storage
                .from('motorista-documentos')
                .remove([`${id}/${filePath}`]);
              console.log('Documento removido do storage:', filePath);
            }
          } catch (storageError) {
            console.warn('Erro ao remover documento do storage:', storageError);
          }
        }
      }

      // 6. Excluir arquivos de fotos do storage
      if (fotos && fotos.length > 0) {
        for (const foto of fotos) {
          try {
            const filePath = foto.url.split('/').pop();
            if (filePath) {
              await supabase.storage
                .from('motorista-fotos')
                .remove([`${id}/${filePath}`]);
              console.log('Foto removida do storage:', filePath);
            }
          } catch (storageError) {
            console.warn('Erro ao remover foto do storage:', storageError);
          }
        }
      }

      // 7. Excluir registros de documentos da tabela
      if (documentos && documentos.length > 0) {
        const { error: docError } = await supabase
          .from('motorista_documentos')
          .delete()
          .eq('motorista_id', id);

        if (docError) {
          console.error('Erro ao excluir documentos:', docError);
        } else {
          console.log('Documentos excluídos da tabela');
        }
      }

      // 8. Excluir registros de fotos da tabela
      if (fotos && fotos.length > 0) {
        const { error: fotosError } = await supabase
          .from('motorista_fotos')
          .delete()
          .eq('motorista_id', id);

        if (fotosError) {
          console.error('Erro ao excluir fotos:', fotosError);
        } else {
          console.log('Fotos excluídas da tabela');
        }
      }

      // 9. Excluir motorista da tabela
      const { error: motoristaError } = await supabase
        .from('motoristas')
        .delete()
        .eq('id', id);

      if (motoristaError) {
        console.error('Erro ao excluir motorista:', motoristaError);
        toast.error('Erro ao excluir motorista');
        return;
      }

      console.log('Motorista excluído da tabela');

      // 10. Excluir perfil do usuário (se existir)
      if (motorista.user_id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', motorista.user_id);

        if (profileError) {
          console.warn('Erro ao excluir perfil:', profileError);
        } else {
          console.log('Perfil excluído');
        }

        // 11. Tentar excluir usuário de autenticação (usando service role)
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(motorista.user_id);
          if (authError) {
            console.warn('Erro ao excluir usuário de autenticação:', authError);
          } else {
            console.log('Usuário de autenticação excluído');
          }
        } catch (authDeleteError) {
          console.warn('Não foi possível excluir usuário de autenticação:', authDeleteError);
        }
      }

      // 12. Atualizar estado local
      setMotoristas(prev => prev.filter(m => m.id !== id));
      console.log('=== EXCLUSÃO COMPLETA FINALIZADA ===');
      toast.success('Motorista e todos os dados relacionados excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      toast.error('Erro ao excluir motorista');
    }
  };

  const approveMotorista = async (id: number) => {
    await updateMotorista(id, { status: 'Aprovado' });
  };

  const rejectMotorista = async (id: number) => {
    await updateMotorista(id, { status: 'Reprovado' });
  };

  const getMotoristaByEmail = (email: string) => {
    return motoristas.find(m => m.email === email);
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
    loadMotoristas
  };
};