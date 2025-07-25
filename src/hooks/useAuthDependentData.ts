import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook que controla quando os dados devem ser carregados
 * baseado no estado de autenticação
 */
export const useAuthDependentData = () => {
  const { user, loading } = useAuth();
  
  // Só deve carregar dados quando a autenticação terminou e o usuário está logado
  const shouldLoadData = !loading && !!user;
  
  return {
    shouldLoadData,
    isAuthLoading: loading,
    user
  };
};