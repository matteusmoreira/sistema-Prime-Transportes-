import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConfiguracoesData {
  id?: string;
  evolution_api_url: string;
  evolution_instance_id: string;
  evolution_api_key: string;
  created_at?: string;
  updated_at?: string;
}

export const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', error);
        toast.error('Erro ao carregar configurações');
        return;
      }

      setConfiguracoes(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguracoes = async (data: Omit<ConfiguracoesData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);

      if (configuracoes?.id) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('configuracoes')
          .update(data)
          .eq('id', configuracoes.id);

        if (error) throw error;
        toast.success('Configurações atualizadas com sucesso!');
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('configuracoes')
          .insert([data]);

        if (error) throw error;
        toast.success('Configurações salvas com sucesso!');
      }

      await fetchConfiguracoes();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const testarConexao = async () => {
    if (!configuracoes) {
      toast.error('Salve as configurações primeiro');
      return false;
    }

    try {
      setLoading(true);
      
      // Testar conexão chamando uma edge function
      const { data, error } = await supabase.functions.invoke('test-evolution-connection', {
        body: {
          url: configuracoes.evolution_api_url,
          instanceId: configuracoes.evolution_instance_id,
          apiKey: configuracoes.evolution_api_key
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Conexão testada com sucesso!');
        return true;
      } else {
        toast.error('Falha na conexão: ' + (data?.message || 'Erro desconhecido'));
        return false;
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast.error('Erro ao testar conexão');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  return {
    configuracoes,
    loading,
    saveConfiguracoes,
    testarConexao,
    refetch: fetchConfiguracoes
  };
};