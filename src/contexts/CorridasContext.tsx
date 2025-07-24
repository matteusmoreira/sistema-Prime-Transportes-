
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Corrida, CorridasContextType } from '@/types/corridas';
import { getCorridasByMotorista } from '@/utils/corridaHelpers';

// Array vazio - sem dados fictícios
const initialCorridas: Corrida[] = [];

const CorridasContext = createContext<CorridasContextType | undefined>(undefined);

export const CorridasProvider = ({ children }: { children: ReactNode }) => {
  // Carregar dados do localStorage ou usar array vazio
  const [corridas, setCorridas] = useState<Corrida[]>(() => {
    const saved = localStorage.getItem('corridas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar corridas do localStorage:', error);
        return initialCorridas;
      }
    }
    return initialCorridas;
  });

  // Salvar no localStorage sempre que a lista de corridas mudar
  useEffect(() => {
    localStorage.setItem('corridas', JSON.stringify(corridas));
    console.log('=== SAVE CORRIDAS ===');
    console.log('Corridas salvas no localStorage:', corridas);
    console.log('Quantidade de corridas salvas:', corridas.length);
    corridas.forEach((corrida, index) => {
      console.log(`Corrida ${index + 1}:`, {
        id: corrida.id,
        motorista: corrida.motorista,
        empresa: corrida.empresa,
        centroCusto: corrida.centroCusto,
        origem: corrida.origem,
        destino: corrida.destino
      });
    });
    console.log('=== FIM SAVE CORRIDAS ===');
  }, [corridas]);

  const addCorrida = (corridaData: Omit<Corrida, 'id' | 'status'>) => {
    console.log('=== ADD CORRIDA DEBUG ===');
    console.log('Dados recebidos para adicionar corrida:', corridaData);
    console.log('Nome do motorista na corrida:', corridaData.motorista);
    console.log('Centro de custo da corrida:', corridaData.centroCusto);
    console.log('Tipo do campo motorista:', typeof corridaData.motorista);
    
    const newId = corridas.length > 0 ? Math.max(...corridas.map(c => c.id)) + 1 : 1;
    
    // Se a corrida tem motorista definido, usar status "Aguardando Conferência", senão "Pendente"
    const status = corridaData.motorista ? 'Aguardando Conferência' : 'Pendente';
    
    const newCorrida: Corrida = {
      ...corridaData,
      id: newId,
      status: status as Corrida['status'],
      // Garantir que o centro de custo seja sempre salvo
      centroCusto: corridaData.centroCusto || ''
    };
    
    console.log('Nova corrida que será adicionada:', newCorrida);
    console.log('Motorista na nova corrida:', newCorrida.motorista);
    console.log('Centro de custo na nova corrida:', newCorrida.centroCusto);
    
    setCorridas(prev => {
      const updated = [...prev, newCorrida];
      console.log('Lista de corridas após adição:', updated);
      console.log('Total de corridas após adição:', updated.length);
      return updated;
    });
    
    console.log('=== FIM ADD CORRIDA DEBUG ===');
    toast.success('Corrida cadastrada com sucesso!');
  };

  const updateCorrida = (id: number, updatedData: Partial<Corrida>) => {
    console.log('Atualizando corrida:', id, updatedData);
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, ...updatedData } : c
    ));
    toast.success('Corrida atualizada com sucesso!');
  };

  const fillOS = (id: number, osData: Partial<Corrida>) => {
    console.log('Preenchendo OS da corrida:', id, osData);
    
    // Buscar a corrida para obter o nome do motorista
    const corrida = corridas.find(c => c.id === id);
    
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, ...osData, status: 'OS Preenchida' as const, preenchidoPorMotorista: true } : c
    ));

    // Disparar notificação para administradores e financeiro
    if (corrida) {
      // Buscar emails de administradores e financeiro do localStorage
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      const destinatarios = usuarios
        .filter((user: any) => user.nivel === 'Administrador' || user.nivel === 'Financeiro')
        .map((user: any) => user.email);

      // Disparar evento customizado para adicionar notificação
      window.dispatchEvent(new CustomEvent('nova-notificacao', {
        detail: {
          tipo: 'os_preenchida',
          titulo: 'Ordem de Serviço Preenchida',
          descricao: `O motorista ${corrida.motorista} preencheu a OS da corrida #${id} (${corrida.origem} → ${corrida.destino})`,
          corridaId: id,
          motoristaEmail: '', // Será preenchido se necessário
          motoristaName: corrida.motorista,
          destinatarios
        }
      }));
    }

    toast.success('Ordem de Serviço preenchida com sucesso!');
  };

  const deleteCorrida = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta corrida?')) {
      setCorridas(prev => prev.filter(c => c.id !== id));
      toast.success('Corrida excluída com sucesso!');
    }
  };

  const approveCorrida = (id: number) => {
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'Aprovada' as const } : c
    ));
    toast.success('Corrida aprovada com sucesso!');
  };

  const rejectCorrida = (id: number, motivo: string) => {
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'Rejeitada' as const, motivoRejeicao: motivo } : c
    ));
    toast.error('Corrida rejeitada!');
  };

  const updateStatus = (id: number, status: Corrida['status']) => {
    console.log('=== CONTEXTO UPDATE STATUS ===');
    console.log('ID da corrida:', id, 'Novo status:', status);
    
    setCorridas(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, status } : c
      );
      console.log('Corridas atualizadas no contexto:', updated);
      return updated;
    });
    
    console.log('=== FIM CONTEXTO UPDATE STATUS ===');
  };

  return (
    <CorridasContext.Provider value={{
      corridas,
      addCorrida,
      updateCorrida,
      fillOS,
      deleteCorrida,
      approveCorrida,
      rejectCorrida,
      updateStatus,
      getCorridasByMotorista: (motoristaEmail: string) => getCorridasByMotorista(corridas, motoristaEmail)
    }}>
      {children}
    </CorridasContext.Provider>
  );
};

export const useCorridas = () => {
  const context = useContext(CorridasContext);
  if (context === undefined) {
    throw new Error('useCorridas must be used within a CorridasProvider');
  }
  return context;
};
