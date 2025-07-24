import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Notificacao, NotificacoesContextType } from '@/types/notifications';

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined);

export const NotificacoesProvider = ({ children }: { children: ReactNode }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar notificações do Supabase
  const loadNotificacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar notificações:', error);
        toast.error('Erro ao carregar notificações');
        return;
      }

      const notificacoesFormatted = data?.map(notif => ({
        id: notif.id,
        tipo: notif.tipo as 'os_preenchida' | 'corrida_criada' | 'documento_vencendo',
        titulo: notif.titulo,
        descricao: notif.descricao,
        destinatarios: notif.destinatarios,
        dataHora: notif.data_hora,
        lida: notif.lida || false,
        corridaId: notif.corrida_id,
        motoristaEmail: notif.motorista_email || '',
        motoristaName: notif.motorista_name || ''
      })) || [];

      setNotificacoes(notificacoesFormatted);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificacoes();
  }, []);

  const adicionarNotificacao = async (notificacaoData: Omit<Notificacao, 'id' | 'dataHora' | 'lida'>) => {
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .insert([{
          tipo: notificacaoData.tipo,
          titulo: notificacaoData.titulo,
          descricao: notificacaoData.descricao,
          destinatarios: notificacaoData.destinatarios,
          corrida_id: notificacaoData.corridaId,
          motorista_email: notificacaoData.motoristaEmail,
          motorista_name: notificacaoData.motoristaName,
          lida: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar notificação:', error);
        toast.error('Erro ao adicionar notificação');
        return;
      }

      const novaNotificacao: Notificacao = {
        id: data.id,
        tipo: data.tipo as 'os_preenchida' | 'corrida_criada' | 'documento_vencendo',
        titulo: data.titulo,
        descricao: data.descricao,
        destinatarios: data.destinatarios,
        dataHora: data.data_hora,
        lida: false,
        corridaId: data.corrida_id,
        motoristaEmail: data.motorista_email || '',
        motoristaName: data.motorista_name || ''
      };

      setNotificacoes(prev => [novaNotificacao, ...prev]);
      console.log('Nova notificação adicionada:', novaNotificacao);
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error);
      toast.error('Erro ao adicionar notificação');
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        toast.error('Erro ao marcar notificação como lida');
        return;
      }

      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, lida: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('lida', false);

      if (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        toast.error('Erro ao marcar todas as notificações como lidas');
        return;
      }

      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, lida: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  };

  const obterNaoLidas = (userEmail?: string) => {
    return notificacoes.filter(notif => 
      !notif.lida && 
      (!userEmail || notif.destinatarios.includes(userEmail))
    );
  };

  const obterQuantidadeNaoLidas = (userEmail?: string) => {
    return obterNaoLidas(userEmail).length;
  };

  return (
    <NotificacoesContext.Provider value={{
      notificacoes,
      adicionarNotificacao,
      marcarComoLida,
      marcarTodasComoLidas,
      obterNaoLidas,
      obterQuantidadeNaoLidas
    }}>
      {children}
    </NotificacoesContext.Provider>
  );
};

export const useNotificacoes = () => {
  const context = useContext(NotificacoesContext);
  if (context === undefined) {
    throw new Error('useNotificacoes must be used within a NotificacoesProvider');
  }
  return context;
};