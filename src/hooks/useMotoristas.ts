import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';
import { useLogInterceptor, LogDataExtractors } from './useLogInterceptor';

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
  const [loading, setLoading] = useState(true);
  const { shouldLoadData, isAuthLoading } = useAuthDependentData();
  const { interceptCreate, interceptUpdate, interceptDelete } = useLogInterceptor();

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
            pix: motorista.pix || '',
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
     // Removido log de debug de upload
     
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

     // Removido log de sucesso de upload
     return data;
   };

   const originalAddMotorista = async (formData: Omit<Motorista, 'id'> | (Omit<Motorista, 'id' | 'status'> & { status?: 'Pendente' | 'Aprovado' | 'Reprovado' })) => {
     try {
       // Verificar se é um admin criando o motorista
       const { data: { user } } = await supabase.auth.getUser();
       const { data: profile } = await supabase
         .from('profiles')
         .select('role')
         .eq('id', user?.id)
         .single();

       let data: any, motoristaId: number;

       if (profile?.role === 'Administrador') {
         // Criar conta via edge function
         // Removido log de debug
         const { data: response, error } = await supabase.functions.invoke('create-motorista-account', {
           body: {
             email: formData.email,
             nome: formData.nome,
             cpf: formData.cpf,
             telefone: formData.telefone,
             cnh: formData.cnh,
             validadeCnh: formData.cnhDataValidade && formData.cnhDataValidade.trim() !== '' ? formData.cnhDataValidade : null,
             status: (formData as any).status || 'Pendente'
           }
         });

         if (error) throw error;
         if (!response.success) throw new Error(response.error);
         
         data = response.motorista;
         motoristaId = data.id;
         
         toast.success(response.message);
       } else {
         // Criar apenas o registro do motorista (para motoristas se auto-cadastrando)
         // Removido log de debug
         const { data: motoristaData, error } = await supabase
           .from('motoristas')
           .insert([{
             nome: formData.nome,
             cpf: formData.cpf || null,
             telefone: formData.telefone || null,
             email: formData.email,
             cnh: formData.cnh || null,
             validade_cnh: formData.cnhDataValidade && formData.cnhDataValidade.trim() !== '' ? formData.cnhDataValidade : null,
             pix: (formData as any).pix || null,
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

       // Definir prefixo do Storage: primeiro segmento deve ser o user_id do motorista para respeitar as políticas
       let targetUserId: string | undefined = undefined;
       if (profile?.role === 'Administrador') {
         targetUserId = data?.user_id || undefined;
       } else {
         targetUserId = user?.id || undefined;
       }
       const storagePrefix = targetUserId ? `${targetUserId}/${motoristaId}` : `${motoristaId}`;
       if (!targetUserId) {
         console.warn('[useMotoristas.addMotorista] user_id do motorista indisponível; uploads usarão pasta somente com motoristaId (pode afetar visualização posteriormente por RLS)');
        toast.warning('Atenção: Arquivos enviados podem não aparecer para o motorista até revisão do cadastro. Tente anexá-los novamente após o login do motorista.');
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
               const storagePath = `${storagePrefix}/${fileName}`;
               // Removido log de debug de upload de documento
               await uploadFile(arquivo, 'motorista-documentos', storagePath);
               
               // Salvar referência no banco
               const { error: docError } = await supabase
                 .from('motorista_documentos')
                 .insert({
                   motorista_id: motoristaId,
                   nome: doc.nome,
                   tipo: doc.descricao,
                   url: storagePath
                 });

               if (!docError) {
                 documentosUploadados.push({
                   id: doc.id,
                   nome: doc.nome,
                   descricao: doc.descricao,
                   arquivo: storagePath,
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
               const storagePath = `${storagePrefix}/${fileName}`;
               // Removido log de debug de upload de foto
               await uploadFile(arquivo, 'motorista-fotos', storagePath);
               
               // Salvar referência no banco
               const { error: fotoError } = await supabase
                 .from('motorista_fotos')
                 .insert({
                   motorista_id: motoristaId,
                   nome: foto.nome,
                   nome_original: arquivo.name,
                   url: storagePath,
                   tamanho: foto.tamanho
                 });

               if (!fotoError) {
                 fotosUploadadas.push({
                   id: foto.id,
                   nome: foto.nome,
                   arquivo: storagePath,
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

   const addMotorista = interceptCreate(
     originalAddMotorista,
     'motoristas',
     LogDataExtractors.motorista.create
   );

   const originalUpdateMotorista = async (id: number, updatedData: Partial<Motorista>) => {
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
          validade_cnh: updatedData.cnhDataValidade && updatedData.cnhDataValidade.trim() !== '' ? updatedData.cnhDataValidade : null,
          pix: updatedData.pix || null,
          status: updatedData.status
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar motorista:', error);
        toast.error('Erro ao atualizar motorista');
        return;
      }

      // Obter user_id do motorista para construir o prefixo correto
      const { data: motoristaRow } = await supabase
        .from('motoristas')
        .select('user_id')
        .eq('id', id)
        .single();
      const targetUserId = motoristaRow?.user_id as string | undefined;
      const storagePrefix = targetUserId ? `${targetUserId}/${id}` : `${id}`;
      if (!targetUserId) {
        console.warn('[useMotoristas.updateMotorista] user_id do motorista indisponível; uploads usarão pasta somente com motoristaId (pode afetar visualização posteriormente por RLS)');
      }

      // Processar novos documentos se existirem
      if (updatedData.documentos) {
        for (const doc of updatedData.documentos) {
          const arquivo = (doc as any).arquivoFile;
          if (arquivo instanceof File) {
            try {
              const sanitizedName = sanitizeFileName(arquivo.name);
              const fileName = `${id}-${Date.now()}-${sanitizedName}`;
              const storagePath = `${storagePrefix}/${fileName}`;
              await uploadFile(arquivo, 'motorista-documentos', storagePath);
              
              // Salvar referência no banco
              await supabase
                .from('motorista_documentos')
                .insert({
                  motorista_id: id,
                  nome: doc.nome,
                  tipo: doc.descricao,
                  url: storagePath
                });
            } catch (uploadError) {
              console.error('Erro ao fazer upload do documento:', uploadError);
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
              const storagePath = `${storagePrefix}/${fileName}`;
              await uploadFile(arquivo, 'motorista-fotos', storagePath);
              
              // Salvar referência no banco
              await supabase
                .from('motorista_fotos')
                .insert({
                  motorista_id: id,
                  nome: foto.nome,
                  nome_original: arquivo.name,
                  url: storagePath,
                  tamanho: (foto as any).tamanho ?? arquivo.size
                });
            } catch (uploadError) {
              console.error('Erro ao fazer upload da foto:', uploadError);
            }
          }
        }
      }

      // Atualizar estado local
      setMotoristas(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
      toast.success('Motorista atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      toast.error('Erro ao atualizar motorista');
    }
  };

  const updateMotorista = interceptUpdate(
    originalUpdateMotorista,
    'motoristas',
    (args) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: motoristas.find(m => m.id === args[0]) || {},
      newData: args[1] || {}
    })
  );

  const originalDeleteMotorista = async (id: number) => {
    if (!confirm('Esta ação irá excluir permanentemente o motorista e todos os dados relacionados (documentos, fotos, perfil de usuário). Tem certeza?')) {
      return;
    }
    try {
      // Removido log: início de exclusão
      
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

      // Removido log informativo: motorista encontrado
      
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

      // Removido log informativo: contagem de documentos encontrados
      
      // 4. Buscar fotos para excluir arquivos do storage
      const { data: fotos } = await supabase
        .from('motorista_fotos')
        .select('*')
        .eq('motorista_id', id);

      // Removido log informativo: contagem de fotos encontradas
      
      // 5. Excluir arquivos de documentos do storage
      if (documentos && documentos.length > 0) {
        for (const doc of documentos) {
          try {
            // Remover diretamente pelo path salvo em url, cobrindo arquivos na raiz e em subpastas
            if (doc.url) {
              await supabase.storage
                .from('motorista-documentos')
                .remove([doc.url]);
            }
           } catch (storageError) {
             // console.warn('Erro ao remover documento do storage:', storageError);
           }
        }
      }

      // 6. Excluir arquivos de fotos do storage
      if (fotos && fotos.length > 0) {
        for (const foto of fotos) {
          try {
            if (foto.url) {
              await supabase.storage
                .from('motorista-fotos')
                .remove([foto.url]);
            }
           } catch (storageError) {
             // console.warn('Erro ao remover foto do storage:', storageError);
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
          // Removido log informativo: documentos excluídos da tabela
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
          // Removido log informativo: fotos excluídas da tabela
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

      // Removido log informativo: motorista excluído da tabela

      // 10. Excluir perfil do usuário (se existir)
      if (motorista.user_id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', motorista.user_id);

        if (profileError) {
          // console.warn('Erro ao excluir perfil:', profileError);
        } else {
          // Removido log informativo: perfil excluído
         }

         // 11. Tentar excluir usuário de autenticação (usando service role)
         try {
           const { error: authError } = await supabase.auth.admin.deleteUser(motorista.user_id);
           if (authError) {
             // console.warn('Erro ao excluir usuário de autenticação:', authError);
           } else {
             // Removido log informativo: usuário de autenticação excluído
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
    try {
      if (url) {
        await supabase.storage.from('motorista-documentos').remove([url]);
      }
      await supabase.from('motorista_documentos').delete().eq('id', docId);
      toast.success('Documento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Não foi possível excluir o documento');
    }
  };

  // Exclusão individual de foto
  const deleteFoto = async (fotoId: number, url: string) => {
    try {
      if (url) {
        await supabase.storage.from('motorista-fotos').remove([url]);
      }
      await supabase.from('motorista_fotos').delete().eq('id', fotoId);
      toast.success('Foto excluída com sucesso');
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