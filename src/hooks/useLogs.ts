import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

/**
 * Hook para verificar se o usuário atual é administrador
 * @returns função que retorna true se o usuário for administrador
 */
export const useIsAdmin = () => {
  const { user } = useAuth();

  return useCallback(() => {
    return user?.email === 'matteusmoreira@gmail.com' || user?.email === 'prime.inteligente@gmail.com';
  }, [user?.email]);
};