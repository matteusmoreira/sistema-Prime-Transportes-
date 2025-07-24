
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useEmpresas } from '@/contexts/EmpresasContext';

export interface Solicitante {
  id: number;
  nome: string;
  empresaId: number;
  empresaNome: string;
  email: string;
  telefone: string;
  cargo: string;
}

// Array vazio - sem dados fictícios
const initialSolicitantes: Solicitante[] = [];

export const useSolicitantes = () => {
  const { empresas } = useEmpresas();
  
  // Carregar dados do localStorage ou usar array vazio
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>(() => {
    const saved = localStorage.getItem('solicitantes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar solicitantes do localStorage:', error);
        return initialSolicitantes;
      }
    }
    return initialSolicitantes;
  });

  // Salvar no localStorage sempre que a lista de solicitantes mudar
  useEffect(() => {
    localStorage.setItem('solicitantes', JSON.stringify(solicitantes));
    console.log('Solicitantes salvos no localStorage:', solicitantes);
  }, [solicitantes]);

  const addSolicitante = (solicitanteData: Omit<Solicitante, 'id'>) => {
    console.log('Adicionando solicitante:', solicitanteData);
    
    // Buscar o nome da empresa atualizado
    const empresa = empresas.find(e => e.id === solicitanteData.empresaId);
    const empresaNome = empresa ? empresa.nome : solicitanteData.empresaNome;
    
    const newId = solicitantes.length > 0 ? Math.max(...solicitantes.map(s => s.id)) + 1 : 1;
    const newSolicitante: Solicitante = {
      ...solicitanteData,
      empresaNome,
      id: newId
    };
    
    console.log('Novo solicitante criado:', newSolicitante);
    setSolicitantes(prev => {
      const updated = [...prev, newSolicitante];
      console.log('Lista de solicitantes atualizada:', updated);
      return updated;
    });
    toast.success('Solicitante cadastrado com sucesso!');
  };

  const updateSolicitante = (id: number, updatedData: Partial<Solicitante>) => {
    console.log('Atualizando solicitante:', id, updatedData);
    
    // Se está atualizando a empresa, buscar o nome atualizado
    if (updatedData.empresaId) {
      const empresa = empresas.find(e => e.id === updatedData.empresaId);
      if (empresa) {
        updatedData.empresaNome = empresa.nome;
      }
    }
    
    setSolicitantes(prev => prev.map(s => 
      s.id === id ? { ...s, ...updatedData } : s
    ));
    toast.success('Solicitante atualizado com sucesso!');
  };

  const deleteSolicitante = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este solicitante?')) {
      setSolicitantes(prev => prev.filter(s => s.id !== id));
      toast.success('Solicitante excluído com sucesso!');
    }
  };

  return {
    solicitantes,
    addSolicitante,
    updateSolicitante,
    deleteSolicitante
  };
};
