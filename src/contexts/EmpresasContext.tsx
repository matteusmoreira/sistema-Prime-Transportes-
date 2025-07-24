
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Empresa {
  id: number;
  nome: string;
  localidade: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  observacoes: string;
  centroCusto: string;
}

interface EmpresasContextType {
  empresas: Empresa[];
  addEmpresa: (empresaData: Omit<Empresa, 'id'>) => void;
  updateEmpresa: (id: number, updatedData: Partial<Empresa>) => void;
  deleteEmpresa: (id: number) => void;
}

// Array vazio - sem dados fictícios
const initialEmpresas: Empresa[] = [];

const EmpresasContext = createContext<EmpresasContextType | undefined>(undefined);

export const EmpresasProvider = ({ children }: { children: ReactNode }) => {
  // Carregar dados do localStorage ou usar array vazio
  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    const saved = localStorage.getItem('empresas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migração: adicionar centroCusto se não existir
        return parsed.map((empresa: any) => ({
          ...empresa,
          centroCusto: empresa.centroCusto || ''
        }));
      } catch (error) {
        console.error('Erro ao carregar empresas do localStorage:', error);
        return initialEmpresas;
      }
    }
    return initialEmpresas;
  });

  // Salvar no localStorage sempre que a lista de empresas mudar
  useEffect(() => {
    localStorage.setItem('empresas', JSON.stringify(empresas));
    console.log('Empresas salvas no localStorage:', empresas);
  }, [empresas]);

  const addEmpresa = (empresaData: Omit<Empresa, 'id'>) => {
    console.log('Context: Tentando cadastrar empresa:', empresaData);
    
    // Validação básica - centroCusto não é obrigatório
    if (!empresaData.nome || !empresaData.localidade || !empresaData.cnpj || !empresaData.telefone || !empresaData.email) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    const newId = empresas.length > 0 ? Math.max(...empresas.map(e => e.id)) + 1 : 1;
    const newEmpresa: Empresa = {
      ...empresaData,
      centroCusto: empresaData.centroCusto || '', // Garantir que não seja undefined
      id: newId
    };
    
    console.log('Context: Nova empresa criada:', newEmpresa);
    setEmpresas(prev => {
      const updated = [...prev, newEmpresa];
      console.log('Context: Lista de empresas atualizada:', updated);
      return updated;
    });
    
    toast.success('Empresa cadastrada com sucesso!');
  };

  const updateEmpresa = (id: number, updatedData: Partial<Empresa>) => {
    console.log('Context: Atualizando empresa:', id, updatedData);
    setEmpresas(prev => prev.map(e => 
      e.id === id ? { ...e, ...updatedData } : e
    ));
    toast.success('Empresa atualizada com sucesso!');
  };

  const deleteEmpresa = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      console.log('Context: Excluindo empresa:', id);
      setEmpresas(prev => prev.filter(e => e.id !== id));
      toast.success('Empresa excluída com sucesso!');
    }
  };

  return (
    <EmpresasContext.Provider value={{
      empresas,
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
