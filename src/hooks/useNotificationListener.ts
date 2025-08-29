
import { useEffect } from 'react';
import { useNotificacoes } from '@/contexts/NotificacoesContext';

export const useNotificationListener = () => {
  const { adicionarNotificacao } = useNotificacoes();

  useEffect(() => {
    const handleNovaNotificacao = (event: CustomEvent) => {
      // Removido log de debug de notificação recebida
      adicionarNotificacao(event.detail);
    };

    window.addEventListener('nova-notificacao', handleNovaNotificacao as EventListener);

    return () => {
      window.removeEventListener('nova-notificacao', handleNovaNotificacao as EventListener);
    };
  }, [adicionarNotificacao]);
};
