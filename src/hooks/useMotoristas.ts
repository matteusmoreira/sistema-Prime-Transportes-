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

      const motoristasFormatted = data?.map(motorista => ({
        id: motorista.id,
        nome: motorista.nome,
        cpf: motorista.cpf || '',
        telefone: motorista.telefone || '',
        email: motorista.email,
        cnh: motorista.cnh || '',
        cnhDataValidade: motorista.validade_cnh || '',
        status: motorista.status || 'Pendente',
        documentos: [] as DocumentoMotorista[],
        fotosVeiculo: [] as FotoVeiculo[],
        user_id: motorista.user_id || undefined
      })) || [];

      setMotoristas(motoristasFormatted);
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
      // Primeiro, criar o motorista
      console.log('Criando motorista no banco...');
      const { data, error } = await supabase
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

      console.log('Resultado da inserção:', { data, error });

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

      const motoristaId = data.id;
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
      toast.success('Motorista cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar motorista:', error);
      toast.error('Erro ao adicionar motorista');
    }
  };

  const updateMotorista = async (id: number, updatedData: Partial<Motorista>) => {
    console.log('Atualizando motorista:', id, updatedData);
    
    try {
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

      setMotoristas(prev => prev.map(m => 
        m.id === id ? { ...m, ...updatedData } : m
      ));
      toast.success('Motorista atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      toast.error('Erro ao atualizar motorista');
    }
  };

  const deleteMotorista = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este motorista?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('motoristas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir motorista:', error);
        toast.error('Erro ao excluir motorista');
        return;
      }

      setMotoristas(prev => prev.filter(m => m.id !== id));
      toast.success('Motorista excluído com sucesso!');
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
    getMotoristaByEmail
  };
};