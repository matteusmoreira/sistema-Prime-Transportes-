import { useCallback } from 'react';
import { useLogs } from '@/contexts/LogsContext';
import { LogActionParams } from '@/types/logs';

/**
 * Hook interceptador para automatizar o registro de logs em operações CRUD
 * Envolve funções existentes para adicionar logging automático
 */
export const useLogInterceptor = () => {
  const { logAction } = useLogs();

  /**
   * Intercepta uma função de criação para adicionar logging automático
   */
  const interceptCreate = useCallback(<T extends any[], R>(
    originalFunction: (...args: T) => Promise<R>,
    entityType: 'empresas' | 'solicitantes' | 'motoristas' | 'corridas',
    getEntityData: (args: T, result?: R) => { entityId: string; newData: Record<string, any> }
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        console.log('🔍 DEBUG: interceptCreate executado para:', entityType);
        const result = await originalFunction(...args);
        console.log('🔍 DEBUG: Resultado da operação:', result);
        
        // Registrar log após sucesso
        try {
          console.log('🔍 DEBUG: Chamando logAction...');
          const { entityId, newData } = getEntityData(args, result);
          await logAction({
            action_type: 'CREATE',
            entity_type: entityType,
            entity_id: entityId,
            new_data: newData
          });
          console.log('🔍 DEBUG: logAction concluído');
        } catch (logError) {
          console.error('Erro ao registrar log de criação:', logError);
        }
        
        return result;
      } catch (error) {
        // Re-throw o erro original sem registrar log
        throw error;
      }
    };
  }, [logAction]);

  /**
   * Intercepta uma função de atualização para adicionar logging automático
   */
  const interceptUpdate = useCallback(<T extends any[], R>(
    originalFunction: (...args: T) => Promise<R>,
    entityType: 'empresas' | 'solicitantes' | 'motoristas' | 'corridas',
    getEntityData: (args: T, result?: R) => { entityId: string; oldData: Record<string, any>; newData: Record<string, any> }
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        const result = await originalFunction(...args);
        
        // Registrar log após sucesso
        try {
          const { entityId, oldData, newData } = getEntityData(args, result);
          await logAction({
            action_type: 'UPDATE',
            entity_type: entityType,
            entity_id: entityId,
            old_data: oldData,
            new_data: newData
          });
        } catch (logError) {
          console.error('Erro ao registrar log de atualização:', logError);
        }
        
        return result;
      } catch (error) {
        // Re-throw o erro original sem registrar log
        throw error;
      }
    };
  }, [logAction]);

  /**
   * Intercepta uma função de exclusão para adicionar logging automático
   */
  const interceptDelete = useCallback(<T extends any[], R>(
    originalFunction: (...args: T) => Promise<R>,
    entityType: 'empresas' | 'solicitantes' | 'motoristas' | 'corridas',
    getEntityData: (args: T, result?: R) => { entityId: string; oldData: Record<string, any> }
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        const result = await originalFunction(...args);
        
        // Registrar log após sucesso
        try {
          const { entityId, oldData } = getEntityData(args, result);
          await logAction({
            action_type: 'DELETE',
            entity_type: entityType,
            entity_id: entityId,
            old_data: oldData
          });
        } catch (logError) {
          console.error('Erro ao registrar log de exclusão:', logError);
        }
        
        return result;
      } catch (error) {
        // Re-throw o erro original sem registrar log
        throw error;
      }
    };
  }, [logAction]);

  /**
   * Função genérica para interceptar qualquer operação CRUD
   */
  const interceptOperation = useCallback(<T extends any[], R>(
    originalFunction: (...args: T) => Promise<R>,
    logParams: LogActionParams | ((args: T, result?: R) => LogActionParams)
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        const result = await originalFunction(...args);
        
        // Registrar log após sucesso
        try {
          const params = typeof logParams === 'function' ? logParams(args, result) : logParams;
          await logAction(params);
        } catch (logError) {
          console.error('Erro ao registrar log da operação:', logError);
        }
        
        return result;
      } catch (error) {
        // Re-throw o erro original sem registrar log
        throw error;
      }
    };
  }, [logAction]);

  return {
    interceptCreate,
    interceptUpdate,
    interceptDelete,
    interceptOperation
  };
};

/**
 * Utilitários para extrair dados das entidades para logging
 */
export const LogDataExtractors = {
  // Extrator para empresas
  empresa: {
    create: (args: any[], result?: any) => ({
      entityId: result?.id?.toString() || 'unknown',
      newData: {
        nome: args[0]?.nome,
        cnpj: args[0]?.cnpj,
        email: args[0]?.email,
        telefone: args[0]?.telefone
      }
    }),
    update: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {}, // Seria necessário buscar dados antigos antes da atualização
      newData: args[1] || {}
    }),
    delete: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {} // Seria necessário buscar dados antes da exclusão
    })
  },
  
  // Extrator para solicitantes
  solicitante: {
    create: (args: any[], result?: any) => ({
      entityId: result?.id?.toString() || 'unknown',
      newData: {
        nome: args[0]?.nome,
        email: args[0]?.email,
        telefone: args[0]?.telefone,
        empresaId: args[0]?.empresaId
      }
    }),
    update: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {},
      newData: args[1] || {}
    }),
    delete: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {}
    })
  },
  
  // Extrator para motoristas
  motorista: {
    create: (args: any[], result?: any) => ({
      entityId: result?.id?.toString() || 'unknown',
      newData: {
        nome: args[0]?.nome,
        email: args[0]?.email,
        cpf: args[0]?.cpf,
        telefone: args[0]?.telefone,
        cnh: args[0]?.cnh
      }
    }),
    update: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {},
      newData: args[1] || {}
    }),
    delete: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {}
    })
  },
  
  // Extrator para corridas
  corrida: {
    create: (args: any[], result?: any) => ({
      entityId: result?.id?.toString() || 'unknown',
      newData: {
        empresa: args[0]?.empresa,
        origem: args[0]?.origem,
        destino: args[0]?.destino,
        data: args[0]?.data,
        motorista: args[0]?.motorista,
        status: args[0]?.status
      }
    }),
    update: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {},
      newData: args[1] || {}
    }),
    delete: (args: any[], result?: any) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: {}
    })
  }
};