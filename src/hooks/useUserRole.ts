import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['user_role'] | null;

async function fetchUserRole(): Promise<UserRole> {
  // Usa getSession para evitar chamada desnecessária à API quando não há sessão
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {

  }
  const user = session?.user;
  if (!user) return null;

  // 1) Tentativa via RPC (se existir no banco)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_role');
    if (!rpcError && rpcData) {
      return rpcData as UserRole;
    }
  } catch (e) {

  }

  // 2) Fallback: consulta direta à tabela profiles (talvez não exista linha ainda)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('useUserRole: erro ao buscar role em profiles:', error);
    return null;
  }

  return (profile?.role as UserRole) ?? null;
}

export function useUserRole() {
  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: fetchUserRole,
    staleTime: 5 * 60 * 1000,
  });
}