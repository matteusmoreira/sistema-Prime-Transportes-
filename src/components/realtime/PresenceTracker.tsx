import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';

export const PresenceTracker = () => {
  const { user, profile } = useAuth();

  // Apenas para ouvir estado e manter lista em outros componentes
  useOnlineUsers({ trackSelf: false });

  useEffect(() => {
    let active = true;

    const join = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const id = data.user?.id;
        if (!id) return;

        const channel = supabase.channel('online-users', {
          config: {
            presence: { key: id },
          },
        });

        await new Promise<void>((resolve) => {
          channel.subscribe(async (status) => {
            if (!active) return;
            if (status === 'SUBSCRIBED') {
              try {
                await channel.track({
                  email: user?.email || profile?.email || null,
                  role: profile?.role || null,
                  timestamp: Date.now(),
                });
              } catch (e) {
                console.debug('[PresenceTracker] Falha ao enviar presença', e);
              }
              resolve();
            }
          });
        });

        const onVisibility = () => {
          if (document.visibilityState === 'visible') {
            channel.track({
              email: user?.email || profile?.email || null,
              role: profile?.role || null,
              timestamp: Date.now(),
            }).catch(() => {});
          }
        };

        document.addEventListener('visibilitychange', onVisibility);

        return () => {
          document.removeEventListener('visibilitychange', onVisibility);
          try { supabase.removeChannel(channel); } catch {}
        };
      } catch (e) {
        console.debug('[PresenceTracker] erro ao entrar no canal', e);
      }
    };

    const cleanupPromise = join();

    return () => {
      active = false;
      cleanupPromise?.then((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, [user?.id, user?.email, profile?.email, profile?.role]);

  return null;
};