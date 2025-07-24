import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  loading: boolean;
  alertasParaMotorista: (motoristaEmail: string) => Alerta[];
  alertasNaoLidos: (motoristaEmail: string) => number;
  criarAlerta: (alertaData: Omit<Alerta, 'id' | 'dataCreacao' | 'lido'>) => Promise<void>;
  marcarComoLido: (alertaId: number, motoristaEmail: string) => Promise<void>;
  excluirAlerta: (alertaId: number) => Promise<void>;
  atualizarAlerta: (alertaId: number, alertaData: Partial<Alerta>) => Promise<void>;
  getLeiturasDoAlerta: (alertaId: number) => { motoristaEmail: string; dataLeitura: string }[];
}

const AlertasContext = createContext<AlertasContextType | undefined>(undefined);

export const AlertasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertasLidos, setAlertasLidos] = useState<{ [alertaId: number]: { motoristaEmail: string; dataLeitura: string }[] }>({});

  // Carregar alertas do Supabase
  const loadAlertas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alertas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar alertas:', error);
        toast.error('Erro ao carregar alertas');
        return;
      }

      const alertasFormatted = data?.map(alerta => ({
        id: alerta.id,
        titulo: alerta.titulo,
        mensagem: alerta.mensagem,
        tipo: alerta.tipo as 'info' | 'warning' | 'error' | 'success',
        destinatarios: alerta.destinatarios as 'todos' | 'motoristas' | 'especifico',
        motoristaEspecifico: alerta.motorista_especifico || undefined,
        criadoPor: alerta.criado_por,
        dataCreacao: alerta.created_at,
        dataExpiracao: alerta.data_expiracao || undefined,
        ativo: alerta.ativo || true,
        lido: false,
        urgente: alerta.urgente || false
      })) || [];

      setAlertas(alertasFormatted);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar leituras de alertas do Supabase
  const loadAlertasLidos = async () => {
    try {
      const { data, error } = await supabase
        .from('alerta_leituras')
        .select('*');
      
      if (error) {
        console.error('Erro ao carregar leituras de alertas:', error);
        return;
      }

      const leiturasPorAlerta: { [alertaId: number]: { motoristaEmail: string; dataLeitura: string }[] } = {};
      
      data?.forEach(leitura => {
        if (!leiturasPorAlerta[leitura.alerta_id]) {
          leiturasPorAlerta[leitura.alerta_id] = [];
        }
        leiturasPorAlerta[leitura.alerta_id].push({
          motoristaEmail: leitura.motorista_email,
          dataLeitura: leitura.data_leitura
        });
      });

      setAlertasLidos(leiturasPorAlerta);
    } catch (error) {
      console.error('Erro ao carregar leituras de alertas:', error);
    }
  };

  useEffect(() => {
    loadAlertas();
    loadAlertasLidos();
  }, []);

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

  const criarAlerta = useCallback(async (alertaData: Omit<Alerta, 'id' | 'dataCreacao' | 'lido'>) => {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .insert([{
          titulo: alertaData.titulo,
          mensagem: alertaData.mensagem,
          tipo: alertaData.tipo,
          destinatarios: alertaData.destinatarios,
          motorista_especifico: alertaData.motoristaEspecifico,
          criado_por: alertaData.criadoPor,
          data_expiracao: alertaData.dataExpiracao,
          ativo: alertaData.ativo,
          urgente: alertaData.urgente
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar alerta:', error);
        toast.error('Erro ao criar alerta');
        return;
      }

      const novoAlerta: Alerta = {
        id: data.id,
        titulo: data.titulo,
        mensagem: data.mensagem,
        tipo: data.tipo as 'info' | 'warning' | 'error' | 'success',
        destinatarios: data.destinatarios as 'todos' | 'motoristas' | 'especifico',
        motoristaEspecifico: data.motorista_especifico || undefined,
        criadoPor: data.criado_por,
        dataCreacao: data.created_at,
        dataExpiracao: data.data_expiracao || undefined,
        ativo: data.ativo || true,
        lido: false,
        urgente: data.urgente || false
      };

      setAlertas(prev => [novoAlerta, ...prev]);
      toast.success('Alerta criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      toast.error('Erro ao criar alerta');
    }
  }, []);

  const marcarComoLido = useCallback(async (alertaId: number, motoristaEmail: string) => {
    try {
      const { error } = await supabase
        .from('alerta_leituras')
        .insert([{
          alerta_id: alertaId,
          motorista_email: motoristaEmail
        }]);

      if (error) {
        console.error('Erro ao marcar alerta como lido:', error);
        toast.error('Erro ao marcar alerta como lido');
        return;
      }

      const agora = new Date().toISOString();
      setAlertasLidos(prev => ({
        ...prev,
        [alertaId]: [...(prev[alertaId] || []), { motoristaEmail, dataLeitura: agora }]
      }));
      
      toast.success('Aviso marcado como visualizado!');
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      toast.error('Erro ao marcar alerta como lido');
    }
  }, []);

  const excluirAlerta = useCallback(async (alertaId: number) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .delete()
        .eq('id', alertaId);

      if (error) {
        console.error('Erro ao excluir alerta:', error);
        toast.error('Erro ao excluir alerta');
        return;
      }

      setAlertas(prev => prev.filter(a => a.id !== alertaId));
      setAlertasLidos(prev => {
        const newState = { ...prev };
        delete newState[alertaId];
        return newState;
      });
      
      toast.success('Alerta excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir alerta:', error);
      toast.error('Erro ao excluir alerta');
    }
  }, []);

  const atualizarAlerta = useCallback(async (alertaId: number, alertaData: Partial<Alerta>) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({
          titulo: alertaData.titulo,
          mensagem: alertaData.mensagem,
          tipo: alertaData.tipo,
          destinatarios: alertaData.destinatarios,
          motorista_especifico: alertaData.motoristaEspecifico,
          data_expiracao: alertaData.dataExpiracao,
          ativo: alertaData.ativo,
          urgente: alertaData.urgente
        })
        .eq('id', alertaId);

      if (error) {
        console.error('Erro ao atualizar alerta:', error);
        toast.error('Erro ao atualizar alerta');
        return;
      }

      setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, ...alertaData } : a));
      toast.success('Alerta atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error);
      toast.error('Erro ao atualizar alerta');
    }
  }, []);

  const getLeiturasDoAlerta = useCallback((alertaId: number) => {
    return alertasLidos[alertaId] || [];
  }, [alertasLidos]);

  const value = {
    alertas,
    loading,
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