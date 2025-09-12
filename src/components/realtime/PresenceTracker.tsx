import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useAuth } from '@/contexts/AuthContext';

/**
 * PresenceTracker - Componente simplificado que apenas inicializa o sistema de presença
 * A lógica de presença foi movida completamente para o hook useOnlineUsers
 * para evitar conflitos de canais duplicados.
 */
export const PresenceTracker = () => {
  const { user } = useAuth();

  // Usa o hook para rastrear presença apenas se o usuário estiver logado
  useOnlineUsers({ 
    trackSelf: !!user?.id 
  });

  return null;
};