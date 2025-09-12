import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog, LogFilters, LogsContextType, LogActionParams } from '@/types/logs';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const LogsContext = createContext<LogsContextType | undefined>(undefined);

interface LogsProviderProps {
  children: ReactNode;
}

export const LogsProvider: React.FC<LogsProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<LogFilters>({
    limit: 50,
    offset: 0
  });
  
  const { user } = useAuth();

  // Verificar se o usuário é administrador
  const isAdmin = useCallback(() => {
    return user?.email === 'matteusmoreira@gmail.com' || user?.email === 'prime.inteligente@gmail.com';
  }, [user?.email]);

  // Buscar logs com filtros
  const fetchLogs = useCallback(async () => {
    if (!isAdmin()) {
      setError('Acesso negado: apenas administradores podem visualizar logs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.user_email) {
        query = query.ilike('user_email', `%${filters.user_email}%`);
      }
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Erro ao buscar logs:', err);
      setError(err.message || 'Erro ao buscar logs');
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin]);

  // Registrar uma ação no log
  const logAction = useCallback(async (params: LogActionParams) => {
    try {
      console.log('🔍 DEBUG: logAction chamado com parâmetros:', params);
      console.log('🔍 DEBUG: Usuário atual:', user?.email);
      
      // Obter informações do cliente
      const fetchedIp: string | null = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip as string)
        .catch(() => null);

      // Normalizar IP para o tipo INET (enviar null se não for IPv4/IPv6 válido)
      const normalizeIp = (ip: string | null): string | null => {
        if (!ip) return null;
        const ipv4 = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
        // Validação simplificada para IPv6: caracteres hex e ':'
        const ipv6 = /^[0-9a-fA-F:]+$/;
        return ipv4.test(ip) || ipv6.test(ip) ? ip : null;
      };

      const ipAddress = normalizeIp(fetchedIp);
      const userAgent = navigator.userAgent;
      
      console.log('🔍 DEBUG: Chamando RPC log_system_action...');
      const { error } = await supabase.rpc('log_system_action', {
        p_user_email: user?.email || 'anonymous',
        p_action_type: params.action_type,
        p_entity_type: params.entity_type,
        p_entity_id: params.entity_id,
        p_old_data: params.old_data || null,
        p_new_data: params.new_data || null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

      if (error) {
        console.error('🔍 DEBUG: Erro na RPC log_system_action:', {
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
        });
      } else {
        console.log('🔍 DEBUG: Log registrado com sucesso!');
      }
    } catch (err) {
      console.error('🔍 DEBUG: Erro geral ao registrar ação no log:', err);
    }
  }, [user?.email]);

  // Função para excluir todos os logs (apenas administradores)
  const clearAllLogs = async (): Promise<void> => {
    // Verificar se o usuário é administrador
    if (!user?.email || (user.email !== 'matteusmoreira@gmail.com' && user.email !== 'prime.inteligente@gmail.com')) {
      toast.error('Acesso negado. Apenas administradores podem excluir logs.');
      throw new Error('Acesso negado. Apenas administradores podem excluir logs.');
    }

    const { error } = await supabase
      .from('system_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Condição que sempre será verdadeira

    if (error) {
      throw new Error(`Erro ao excluir logs: ${error.message}`);
    }

    toast.success('Todos os logs foram excluídos com sucesso.');
  };

  // Função para excluir logs anteriores a N dias (apenas administradores)
  const clearLogsByPeriod = async (days: number): Promise<void> => {
    // Verificar se o usuário é administrador
    if (!user?.email || (user.email !== 'matteusmoreira@gmail.com' && user.email !== 'prime.inteligente@gmail.com')) {
      toast.error('Acesso negado. Apenas administradores podem excluir logs.');
      throw new Error('Acesso negado. Apenas administradores podem excluir logs.');
    }

    if (!days || days <= 0) {
      throw new Error('Parâmetro de dias inválido.');
    }

    const now = new Date();
    const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('system_logs')
      .delete()
      .lte('created_at', threshold.toISOString());

    if (error) {
      throw new Error(`Erro ao excluir logs por período: ${error.message}`);
    }

    const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
    toast.success(`Logs anteriores a ${days} dias (até ${formatDate(threshold)}) foram excluídos com sucesso.`);
  };

  const value: LogsContextType = {
    logs,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    fetchLogs,
    clearAllLogs,
    clearLogsByPeriod,
    logAction
  };

  return (
    <LogsContext.Provider value={value}>
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = (): LogsContextType => {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error('useLogs deve ser usado dentro de um LogsProvider');
  }
  return context;
};