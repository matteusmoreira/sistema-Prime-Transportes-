import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Bind realtime lifecycle logs once per module for easier debugging
let __realtimeBound = false;
if (!__realtimeBound) {
  try {
    supabase.realtime.onOpen(() => console.log('[Realtime] connection opened'));
    supabase.realtime.onClose(() => console.warn('[Realtime] connection closed'));
    supabase.realtime.onError((e) => console.error('[Realtime] connection error', e));
    __realtimeBound = true;
  } catch (e) {
    // no-op
  }
}

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

  useEffect(() => {
    let isMounted = true;
    let currentUserId: string | null = null;

    const setup = async () => {
      const { data } = await supabase.auth.getUser();
      currentUserId = data.user?.id || null;

      // Evita recriar desnecessariamente
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabase.channel('online-users', {
        config: {
          presence: { key: currentUserId || `anon-${Math.random().toString(36).slice(2)}` },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
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
            setIsConnected(true); // consideramos conectado ao receber o primeiro sync
          }
        })
        .on('presence', { event: 'join' }, (payload) => {
          console.debug('[useOnlineUsers] presence join', payload);
        })
        .on('presence', { event: 'leave' }, (payload) => {
          console.debug('[useOnlineUsers] presence leave', payload);
        })
        .subscribe(async (status) => {
          if (!isMounted) return;
          console.log('[useOnlineUsers] subscribe status:', status);
          setIsConnected(status === 'SUBSCRIBED');
          if (status === 'SUBSCRIBED' && trackSelf && currentUserId) {
            try {
              await channel.track({
                email: email || data.user?.email || null,
                role: role || null,
                timestamp: Date.now(),
              });
              console.debug('[useOnlineUsers] tracked self presence');
            } catch (e) {
              console.debug('Falha ao fazer track de presença:', e);
            }
          }
        });

      // Atualiza presença ao voltar foco
      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && channel && trackSelf && currentUserId) {
          channel.track({
            email: email || data.user?.email || null,
            role: role || null,
            timestamp: Date.now(),
          }).catch(() => {});
        }
      };

      document.addEventListener('visibilitychange', handleVisibility);

      channelRef.current = channel;

      return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    };

    setup();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
        channelRef.current = null;
      }
    };
  }, [trackSelf, email, role]);

  return { users, isConnected };
}