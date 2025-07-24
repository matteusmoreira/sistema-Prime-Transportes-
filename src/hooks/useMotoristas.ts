import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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

// Array vazio - sem dados fictícios
const initialMotoristas: Motorista[] = [];

export const useMotoristas = () => {
  // Carregar dados do localStorage ou usar array vazio
  const [motoristas, setMotoristas] = useState<Motorista[]>(() => {
    const saved = localStorage.getItem('motoristas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar motoristas do localStorage:', error);
        return initialMotoristas;
      }
    }
    return initialMotoristas;
  });

  // Salvar no localStorage sempre que a lista de motoristas mudar
  useEffect(() => {
    localStorage.setItem('motoristas', JSON.stringify(motoristas));
    console.log('Motoristas salvos no localStorage:', motoristas);
  }, [motoristas]);

  const addMotorista = (formData: Omit<Motorista, 'id' | 'status'>) => {
    console.log('Adicionando motorista:', formData);
    
    const newId = motoristas.length > 0 ? Math.max(...motoristas.map(m => m.id)) + 1 : 1;
    const newMotorista: Motorista = {
      ...formData,
      id: newId,
      status: 'Aguardando Aprovação'
    };
    
    console.log('Novo motorista criado:', newMotorista);
    setMotoristas(prev => {
      const updated = [...prev, newMotorista];
      console.log('Lista de motoristas atualizada:', updated);
      return updated;
    });
    toast.success('Motorista cadastrado com sucesso!');
  };

  const updateMotorista = (id: number, updatedData: Partial<Motorista>) => {
    console.log('Atualizando motorista:', id, updatedData);
    setMotoristas(prev => prev.map(m => 
      m.id === id ? { ...m, ...updatedData } : m
    ));
    toast.success('Motorista atualizado com sucesso!');
  };

  const deleteMotorista = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      setMotoristas(prev => prev.filter(m => m.id !== id));
      toast.success('Motorista excluído com sucesso!');
    }
  };

  const approveMotorista = (id: number) => {
    setMotoristas(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'Aprovado' as const } : m
    ));
    toast.success('Motorista aprovado com sucesso!');
  };

  const rejectMotorista = (id: number) => {
    setMotoristas(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'Reprovado' as const } : m
    ));
    toast.error('Motorista reprovado!');
  };

  const getMotoristaByEmail = (email: string) => {
    return motoristas.find(m => m.email === email);
  };

  return {
    motoristas,
    addMotorista,
    updateMotorista,
    deleteMotorista,
    approveMotorista,
    rejectMotorista,
    getMotoristaByEmail
  };
};
