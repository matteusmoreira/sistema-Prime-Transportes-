
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface Alerta {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  destinatarios: 'todos' | 'motoristas' | 'especifico';
  motoristaEspecifico?: string;
  criadoPor: string;
  dataCreacao: string;
  dataExpiracao?: string;
  ativo: boolean;
  lido: boolean;
  urgente: boolean;
}

interface AlertasContextType {
  alertas: Alerta[];
  alertasParaMotorista: (motoristaEmail: string) => Alerta[];
  alertasNaoLidos: (motoristaEmail: string) => number;
  criarAlerta: (alertaData: Omit<Alerta, 'id' | 'dataCreacao' | 'lido'>) => void;
  marcarComoLido: (alertaId: number, motoristaEmail: string) => void;
  excluirAlerta: (alertaId: number) => void;
  atualizarAlerta: (alertaId: number, alertaData: Partial<Alerta>) => void;
  getLeiturasDoAlerta: (alertaId: number) => { motoristaEmail: string; dataLeitura: string }[];
}

// Array vazio - sem dados fictícios
const initialAlertas: Alerta[] = [];

const AlertasContext = createContext<AlertasContextType | undefined>(undefined);

export const AlertasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Carregar dados do localStorage ou usar array vazio
  const [alertas, setAlertas] = useState<Alerta[]>(() => {
    const saved = localStorage.getItem('alertas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar alertas do localStorage:', error);
        return initialAlertas;
      }
    }
    return initialAlertas;
  });

  const [alertasLidos, setAlertasLidos] = useState<{ [alertaId: number]: { motoristaEmail: string; dataLeitura: string }[] }>(() => {
    const saved = localStorage.getItem('alertasLidos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar alertas lidos do localStorage:', error);
        return {};
      }
    }
    return {};
  });

  // Salvar alertas no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('alertas', JSON.stringify(alertas));
    console.log('Alertas salvos no localStorage:', alertas);
  }, [alertas]);

  // Salvar alertas lidos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('alertasLidos', JSON.stringify(alertasLidos));
    console.log('Alertas lidos salvos no localStorage:', alertasLidos);
  }, [alertasLidos]);

  const alertasParaMotorista = useCallback((motoristaEmail: string) => {
    const now = new Date();
    return alertas.filter(alerta => {
      // Verificar se o alerta não expirou
      if (alerta.dataExpiracao && new Date(alerta.dataExpiracao) < now) {
        return false;
      }
      
      // Verificar se está ativo
      if (!alerta.ativo) {
        return false;
      }

      // Verificar destinatários
      if (alerta.destinatarios === 'todos' || alerta.destinatarios === 'motoristas') {
        return true;
      }
      
      if (alerta.destinatarios === 'especifico' && alerta.motoristaEspecifico === motoristaEmail) {
        return true;
      }
      
      return false;
    }).map(alerta => ({
      ...alerta,
      lido: alertasLidos[alerta.id]?.some(leitura => leitura.motoristaEmail === motoristaEmail) || false
    }));
  }, [alertas, alertasLidos]);

  const alertasNaoLidos = useCallback((motoristaEmail: string) => {
    return alertasParaMotorista(motoristaEmail).filter(a => !a.lido).length;
  }, [alertasParaMotorista]);

  const criarAlerta = useCallback((alertaData: Omit<Alerta, 'id' | 'dataCreacao' | 'lido'>) => {
    const novoAlerta: Alerta = {
      ...alertaData,
      id: alertas.length === 0 ? 1 : Math.max(...alertas.map(a => a.id)) + 1,
      dataCreacao: new Date().toISOString(),
      lido: false
    };
    
    setAlertas(prev => [...prev, novoAlerta]);
    toast.success('Alerta criado com sucesso!');
  }, [alertas]);

  const marcarComoLido = useCallback((alertaId: number, motoristaEmail: string) => {
    const agora = new Date().toISOString();
    setAlertasLidos(prev => ({
      ...prev,
      [alertaId]: [...(prev[alertaId] || []), { motoristaEmail, dataLeitura: agora }]
    }));
    toast.success('Aviso marcado como visualizado!');
  }, []);

  const excluirAlerta = useCallback((alertaId: number) => {
    setAlertas(prev => prev.filter(a => a.id !== alertaId));
    setAlertasLidos(prev => {
      const newState = { ...prev };
      delete newState[alertaId];
      return newState;
    });
    toast.success('Alerta excluído com sucesso!');
  }, []);

  const atualizarAlerta = useCallback((alertaId: number, alertaData: Partial<Alerta>) => {
    setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, ...alertaData } : a));
    toast.success('Alerta atualizado com sucesso!');
  }, []);

  const getLeiturasDoAlerta = useCallback((alertaId: number) => {
    return alertasLidos[alertaId] || [];
  }, [alertasLidos]);

  const value = {
    alertas,
    alertasParaMotorista,
    alertasNaoLidos,
    criarAlerta,
    marcarComoLido,
    excluirAlerta,
    atualizarAlerta,
    getLeiturasDoAlerta
  };

  return (
    <AlertasContext.Provider value={value}>
      {children}
    </AlertasContext.Provider>
  );
};

export const useAlertas = () => {
  const context = useContext(AlertasContext);
  if (context === undefined) {
    throw new Error('useAlertas must be used within an AlertasProvider');
  }
  return context;
};
