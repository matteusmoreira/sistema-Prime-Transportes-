
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notificacao, NotificacoesContextType } from '@/types/notifications';

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined);

export const NotificacoesProvider = ({ children }: { children: ReactNode }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(() => {
    const saved = localStorage.getItem('notificacoes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar notificações do localStorage:', error);
        return [];
      }
    }
    return [];
  });

  // Salvar no localStorage sempre que as notificações mudarem
  useEffect(() => {
    localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
  }, [notificacoes]);

  const adicionarNotificacao = (notificacaoData: Omit<Notificacao, 'id' | 'dataHora' | 'lida'>) => {
    const novaNotificacao: Notificacao = {
      ...notificacaoData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataHora: new Date().toISOString(),
      lida: false
    };

    setNotificacoes(prev => [novaNotificacao, ...prev]);
    console.log('Nova notificação adicionada:', novaNotificacao);
  };

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, lida: true } : notif
      )
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => 
      prev.map(notif => ({ ...notif, lida: true }))
    );
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
