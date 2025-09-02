
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';

export interface Empresa {
  id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  centroCusto?: string;
}

interface EmpresasContextType {
  empresas: Empresa[];
  loading: boolean;
  addEmpresa: (empresaData: Omit<Empresa, 'id'>) => Promise<void>;
  updateEmpresa: (id: number, updatedData: Partial<Empresa>) => Promise<void>;
  deleteEmpresa: (id: number) => Promise<void>;
}

const EmpresasContext = createContext<EmpresasContextType | undefined>(undefined);

export const EmpresasProvider = ({ children }: { children: ReactNode }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { shouldLoadData, isAuthLoading } = useAuthDependentData();

  // Carregar empresas do Supabase
  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, cnpj, telefone, email, endereco, contato, centro_custo')
        .order('nome');
      
      if (error) {
        console.error('Erro ao carregar empresas:', error);
        toast.error('Erro ao carregar empresas');
        return;
      }

      const empresasFormatted = data?.map(empresa => ({
        id: empresa.id,
        nome: empresa.nome,
        cnpj: empresa.cnpj || '',
        telefone: empresa.telefone || '',
        email: empresa.email || '',
        endereco: empresa.endereco || '',
        observacoes: empresa.contato || '',
        centroCusto: empresa.centro_custo || ''
      })) || [];

      setEmpresas(empresasFormatted);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoadData) {
      loadEmpresas();
    } else if (!isAuthLoading) {
      // Se não está carregando auth mas não deve carregar dados, 
      // significa que não está logado
      setLoading(false);
    }
  }, [shouldLoadData, isAuthLoading]);

  const addEmpresa = async (empresaData: Omit<Empresa, 'id'>) => {
    // console.log('Context: Tentando cadastrar empresa:', empresaData);
    
    // Validação básica
    if (!empresaData.nome || !empresaData.cnpj || !empresaData.telefone || !empresaData.email) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([{
          nome: empresaData.nome,
          endereco: empresaData.endereco || '',
          telefone: empresaData.telefone || '',
          cnpj: empresaData.cnpj || '',
          email: empresaData.email || '',
          contato: empresaData.observacoes || '',
          centro_custo: empresaData.centroCusto || ''
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar empresa:', error);
        toast.error('Erro ao adicionar empresa');
        return;
      }

      const novaEmpresa: Empresa = {
        id: data.id,
        nome: data.nome,
        cnpj: data.cnpj || '',
        telefone: data.telefone || '',
        email: data.email || '',
        endereco: data.endereco || '',
        observacoes: data.contato || '',
        centroCusto: empresaData.centroCusto || ''
      };

      setEmpresas(prev => [...prev, novaEmpresa]);
      toast.success('Empresa cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      toast.error('Erro ao adicionar empresa');
    }
  };

  const updateEmpresa = async (id: number, updatedData: Partial<Empresa>) => {
    // console.log('Context: Atualizando empresa:', id, updatedData);
    
    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          nome: updatedData.nome,
          endereco: updatedData.endereco,
          telefone: updatedData.telefone,
          cnpj: updatedData.cnpj,
          email: updatedData.email,
          contato: updatedData.observacoes,
          centro_custo: updatedData.centroCusto
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar empresa:', error);
        toast.error('Erro ao atualizar empresa');
        return;
      }

      setEmpresas(prev => prev.map(e => 
        e.id === id ? { ...e, ...updatedData } : e
      ));
      toast.success('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
    }
  };

  const deleteEmpresa = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir empresa:', error);
        toast.error('Erro ao excluir empresa');
        return;
      }

      setEmpresas(prev => prev.filter(e => e.id !== id));
      toast.success('Empresa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  return (
    <EmpresasContext.Provider value={{
      empresas,
      loading,
      addEmpresa,
      updateEmpresa,
      deleteEmpresa
    }}>
      {children}
    </EmpresasContext.Provider>
  );
};

export const useEmpresas = () => {
  const context = useContext(EmpresasContext);
  if (context === undefined) {
    throw new Error('useEmpresas must be used within an EmpresasProvider');
  }
  return context;
};
