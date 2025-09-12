import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface OnlineUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastSeen: string;
  isOnline: boolean;
}

interface OnlineUsersContextType {
  onlineUsers: OnlineUser[];
  isLoading: boolean;
  error: string | null;
}

const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(undefined);

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (context === undefined) {
    throw new Error('useOnlineUsers must be used within an OnlineUsersProvider');
  }
  return context;
};

export const OnlineUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const setupCompleteRef = useRef(false);

  useEffect(() => {
    if (!user || setupCompleteRef.current) {
      return;
    }

    const setupPresence = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Verificar se já existe um canal ativo
        if (channelRef.current) {
          await channelRef.current.unsubscribe();
          channelRef.current = null;
        }

        // Criar canal único para presença
        const channel = supabase.channel('online-users', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channelRef.current = channel;

        // Configurar eventos de presença
        channel
          .on('presence', { event: 'sync' }, () => {
            const presenceState = channel.presenceState();
            const users: OnlineUser[] = [];
            
            Object.keys(presenceState).forEach((userId) => {
              const presence = presenceState[userId];
              if (presence && presence.length > 0) {
                const userInfo = presence[0] as OnlineUser;
                users.push({
                  ...userInfo,
                  isOnline: true,
                  lastSeen: new Date().toISOString(),
                });
              }
            });
            
            setOnlineUsers(users);
            setIsLoading(false);
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('[OnlineUsers] User joined:', key, newPresences);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('[OnlineUsers] User left:', key, leftPresences);
          });

        // Subscrever ao canal
        const status = await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Rastrear presença do usuário atual
            await channel.track({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
              email: user.email || '',
              role: user.user_metadata?.role || 'user',
              lastSeen: new Date().toISOString(),
              isOnline: true,
            });
            setupCompleteRef.current = true;
          }
        });

        if (status === 'CHANNEL_ERROR') {
          throw new Error('Erro ao conectar ao canal de presença');
        }

      } catch (err) {
        console.error('[OnlineUsers] Setup error:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setIsLoading(false);
      }
    };

    setupPresence();

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setupCompleteRef.current = false;
    };
  }, [user]);

  // Cleanup quando o usuário faz logout
  useEffect(() => {
    if (!user && channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      setupCompleteRef.current = false;
      setOnlineUsers([]);
      setIsLoading(true);
      setError(null);
    }
  }, [user]);

  const value = {
    onlineUsers,
    isLoading,
    error,
  };

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  );
};