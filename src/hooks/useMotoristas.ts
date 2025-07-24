import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  status: 'Aguardando Aprovação' | 'Aprovado' | 'Reprovado';
  documentos: DocumentoMotorista[];
  fotosVeiculo: FotoVeiculo[];
}

export const useMotoristas = () => {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);

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
        status: motorista.ativo ? 'Aprovado' as const : 'Aguardando Aprovação' as const,
        documentos: [] as DocumentoMotorista[],
        fotosVeiculo: [] as FotoVeiculo[]
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
    loadMotoristas();
  }, []);

  const addMotorista = async (formData: Omit<Motorista, 'id' | 'status'>) => {
    console.log('Adicionando motorista:', formData);
    
    try {
      const { data, error } = await supabase
        .from('motoristas')
        .insert([{
          nome: formData.nome,
          cpf: formData.cpf,
          telefone: formData.telefone,
          email: formData.email,
          cnh: formData.cnh,
          validade_cnh: formData.cnhDataValidade,
          ativo: false // Aguardando aprovação
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar motorista:', error);
        toast.error('Erro ao adicionar motorista');
        return;
      }

      const newMotorista: Motorista = {
        id: data.id,
        nome: data.nome,
        cpf: data.cpf || '',
        telefone: data.telefone || '',
        email: data.email,
        cnh: data.cnh || '',
        cnhDataValidade: data.validade_cnh || '',
        status: 'Aguardando Aprovação',
        documentos: [],
        fotosVeiculo: []
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
          ativo: updatedData.status === 'Aprovado'
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