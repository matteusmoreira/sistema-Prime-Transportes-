import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Realtime connection logging will be handled at channel level


export interface OnlineUser {
  id: string;
  email?: string | null;
  role?: string | null;
  lastSeen: number;
}

interface Options {
  trackSelf?: boolean;
  email?: string | null;
  role?: string | null;
}

export function useOnlineUsers(options: Options = {}) {
  const { trackSelf = false, email, role } = options;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  
    let isMounted = true;
    let currentUserId: string | null = null;
    let cleanup: (() => void) | null = null;

    const setup = async () => {
      try {
        setError(null);
        const { data, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('[OnlineUsers] Auth error:', authError);
          setError('Erro de autenticação');
          return;
        }
        
        currentUserId = data.user?.id || null;
  

        // Cleanup previous channel
        if (channelRef.current) {
          try {
            await supabase.removeChannel(channelRef.current);
          } catch (e) {
            console.warn('[OnlineUsers] Error removing previous channel:', e);
          }
          channelRef.current = null;
        }

        const channelName = `online-users-${Date.now()}`; // Unique channel name
        const channel = supabase.channel(channelName, {
          config: {
            presence: { key: currentUserId || `anon-${Math.random().toString(36).slice(2)}` },
          },
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            try {
              const state = channel.presenceState() as Record<string, { metas: any[] }>;
      
              
              const list: OnlineUser[] = Object.entries(state).map(([id, { metas }]) => {
                const latest = metas?.[metas.length - 1] || {};
                return {
                  id,
                  email: latest.email ?? null,
                  role: latest.role ?? null,
                  lastSeen: Number(latest.timestamp) || Date.now(),
                };
              });
              
              // Ordena por email e depois por lastSeen desc
              list.sort((a, b) => {
                const ae = (a.email || '').localeCompare(b.email || '');
                if (ae !== 0) return ae;
                return b.lastSeen - a.lastSeen;
              });
              
              if (isMounted) {
        
                setUsers(list);
                setIsConnected(true);
                setError(null);
              }
            } catch (e) {
              console.error('[OnlineUsers] Error in presence sync:', e);
              if (isMounted) {
                setError('Erro ao sincronizar usuários online');
              }
            }
          })
          .on('presence', { event: 'join' }, (payload) => {
    
          })
          .on('presence', { event: 'leave' }, (payload) => {
    
          })
          .subscribe(async (status) => {
            if (!isMounted) return;
      
            setIsConnected(status === 'SUBSCRIBED');

            if (status === 'SUBSCRIBED' && trackSelf && currentUserId) {
              try {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('email, role')
                  .eq('id', currentUserId)
                  .single();

                if (profileError) {
                  console.error('[OnlineUsers] Profile fetch error:', profileError);
                  setError(profileError.message);
                  return;
                }

                if (profile && isMounted) {
            
                  await channel.track({
                    email: profile.email,
                    role: profile.role,
                    timestamp: Date.now(),
                  });
                }
              } catch (e) {
                console.error('[OnlineUsers] Error tracking presence:', e);
              }
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              if (isMounted) {
                setError('Conexão com usuários online perdida');
                setIsConnected(false);
              }
            }
          });

        channelRef.current = channel;
        
        cleanup = () => {
          if (channel) {
            supabase.removeChannel(channel).catch(e => 
              console.warn('[OnlineUsers] Cleanup error:', e)
            );
          }
        };
        
      } catch (e) {
        console.error('[OnlineUsers] Setup error:', e);
        if (isMounted) {
          setError('Erro ao configurar usuários online');
        }
      }
    };

    setup();

    return () => {

      isMounted = false;
      if (cleanup) {
        cleanup();
      }
      if (channelRef.current) {
        channelRef.current = null;
      }
    };
  }, [trackSelf, email, role]);

  return { users, isConnected };
}