
import { useEffect } from 'react';
import { useNotificacoes } from '@/contexts/NotificacoesContext';

export const useNotificationListener = () => {
  const { adicionarNotificacao } = useNotificacoes();

  useEffect(() => {
    const handleNovaNotificacao = (event: CustomEvent) => {
      console.log('Nova notificação recebida:', event.detail);
      adicionarNotificacao(event.detail);
    };

    window.addEventListener('nova-notificacao', handleNovaNotificacao as EventListener);

    return () => {
      window.removeEventListener('nova-notificacao', handleNovaNotificacao as EventListener);
    };
  }, [adicionarNotificacao]);
};
