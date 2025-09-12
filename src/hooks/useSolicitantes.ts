import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEmpresas } from '@/contexts/EmpresasContext';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';
import { useLogInterceptor, LogDataExtractors } from './useLogInterceptor';

export interface Solicitante {
  id: number;
  nome: string;
  empresaId: number;
  empresaNome: string;
  email: string;
  telefone: string;
  cargo: string;
}

export const useSolicitantes = () => {
  const { empresas } = useEmpresas();
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
  const [loading, setLoading] = useState(true);
  const { shouldLoadData, isAuthLoading } = useAuthDependentData();
  const { interceptCreate, interceptUpdate, interceptDelete } = useLogInterceptor();

  // Carregar solicitantes do Supabase
  const loadSolicitantes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solicitantes')
        .select(`
          *,
          empresas (
            nome
          )
        `)
        .order('nome');
      
      if (error) {
        console.error('Erro ao carregar solicitantes:', error);
        toast.error('Erro ao carregar solicitantes');
        return;
      }

      const solicitantesFormatted = data?.map(solicitante => ({
        id: solicitante.id,
        nome: solicitante.nome || '',
        empresaId: solicitante.empresa_id || 0,
        empresaNome: (solicitante.empresas as any)?.nome || '',
        email: solicitante.email || '',
        telefone: solicitante.telefone || '',
        cargo: ''
      })) || [];

      setSolicitantes(solicitantesFormatted);
    } catch (error) {
      console.error('Erro ao carregar solicitantes:', error);
      toast.error('Erro ao carregar solicitantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoadData) {
      loadSolicitantes();
    } else if (!isAuthLoading) {
      setLoading(false);
    }
  }, [shouldLoadData, isAuthLoading]);

  const originalAddSolicitante = async (solicitanteData: Omit<Solicitante, 'id'>) => {
    // Buscar o nome da empresa atualizado
    const empresa = empresas.find(e => e.id === solicitanteData.empresaId);
    const empresaNome = empresa ? empresa.nome : solicitanteData.empresaNome;
    
    const { data, error } = await supabase
      .from('solicitantes')
      .insert([{
        nome: solicitanteData.nome,
        empresa_id: solicitanteData.empresaId,
        email: solicitanteData.email,
        telefone: solicitanteData.telefone,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar solicitante:', error);
      toast.error('Erro ao adicionar solicitante');
      return;
    }

    const novoSolicitante: Solicitante = {
      id: data.id,
      nome: data.nome || '',
      empresaId: data.empresa_id,
      empresaNome: empresaNome,
      email: data.email || '',
      telefone: data.telefone || '',
      cargo: ''
    };

    setSolicitantes(prev => [...prev, novoSolicitante]);
    toast.success('Solicitante adicionado com sucesso!');
    return novoSolicitante;
  };

  const addSolicitante = interceptCreate(
    originalAddSolicitante,
    'solicitantes',
    LogDataExtractors.solicitante.create
  );

  const originalUpdateSolicitante = async (id: number, updatedData: Partial<Solicitante>) => {
    const { data, error } = await supabase
      .from('solicitantes')
      .update({
        nome: updatedData.nome,
        empresa_id: updatedData.empresaId,
        email: updatedData.email,
        telefone: updatedData.telefone,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar solicitante:', error);
      toast.error('Erro ao atualizar solicitante');
      return;
    }

    // Buscar o nome da empresa atualizado
    const empresa = empresas.find(e => e.id === data.empresa_id);
    const empresaNome = empresa ? empresa.nome : '';

    const solicitanteAtualizado: Solicitante = {
      id: data.id,
      nome: data.nome || '',
      empresaId: data.empresa_id,
      empresaNome: empresaNome,
      email: data.email || '',
      telefone: data.telefone || '',
      cargo: ''
    };

    setSolicitantes(prev => 
      prev.map(solicitante => 
        solicitante.id === id ? solicitanteAtualizado : solicitante
      )
    );
    
    toast.success('Solicitante atualizado com sucesso!');
    return solicitanteAtualizado;
  };

  const updateSolicitante = interceptUpdate(
    originalUpdateSolicitante,
    'solicitantes',
    (args) => ({
      entityId: args[0]?.toString() || 'unknown',
      oldData: solicitantes.find(s => s.id === args[0]) || {},
      newData: args[1] || {}
    })
  );

  const deleteSolicitante = async (id: number) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este solicitante?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('solicitantes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir solicitante:', error);
        toast.error('Erro ao excluir solicitante');
        return;
      }

      setSolicitantes(prev => prev.filter(solicitante => solicitante.id !== id));
      toast.success('Solicitante excluído com sucesso!');
      
    } catch (error) {
      console.error('Erro ao excluir solicitante:', error);
      toast.error('Erro ao excluir solicitante');
    }
  };

  return {
    solicitantes,
    loading,
    addSolicitante,
    updateSolicitante,
    deleteSolicitante
  };
};