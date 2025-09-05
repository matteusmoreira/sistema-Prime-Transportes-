import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['user_role'] | null;

async function fetchUserRole(): Promise<UserRole> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.warn('useUserRole: erro ao obter usuário autenticado:', authError);
  }
  const user = authData?.user;
  if (!user) return null;

  // 1) Tentativa via RPC (se existir no banco)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_role');
    if (!rpcError && rpcData) {
      return rpcData as UserRole;
    }
  } catch (e) {
    console.debug('useUserRole: RPC get_current_user_role não disponível, usando fallback.');
  }

  // 2) Fallback: consulta direta à tabela profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.warn('useUserRole: erro ao buscar role em profiles:', error);
    return null;
  }

  return (profile?.role as UserRole) ?? null;
}

export function useUserRole() {
  const query = useQuery<UserRole>({
    queryKey: ['user-role'],
    queryFn: fetchUserRole,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos de cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const role = query.data ?? null;
  const isMotorista = role === 'Motorista';

  return {
    role,
    isMotorista,
    isLoading: query.isLoading || query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}