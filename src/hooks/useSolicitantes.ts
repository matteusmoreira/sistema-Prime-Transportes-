import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEmpresas } from '@/contexts/EmpresasContext';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';

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

  // Carregar solicitantes do Supabase
  const loadSolicitantes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solicitantes')
        .select('*, empresas(nome)')
        .order('nome');
      
      if (error) {
        console.error('Erro ao carregar solicitantes:', error);
        toast.error('Erro ao carregar solicitantes');
        return;
      }

      const solicitantesFormatted = data?.map(solicitante => ({
        id: solicitante.id,
        nome: solicitante.nome,
        empresaId: solicitante.empresa_id || 0,
        empresaNome: (solicitante.empresas as any)?.nome || '',
        email: solicitante.email,
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

  const addSolicitante = async (solicitanteData: Omit<Solicitante, 'id'>) => {
    console.log('Adicionando solicitante:', solicitanteData);
    
    // Buscar o nome da empresa atualizado
    const empresa = empresas.find(e => e.id === solicitanteData.empresaId);
    const empresaNome = empresa ? empresa.nome : solicitanteData.empresaNome;
    
    try {
      const { data, error } = await supabase
        .from('solicitantes')
        .insert([{
          nome: solicitanteData.nome,
          empresa_id: solicitanteData.empresaId,
          email: solicitanteData.email,
          telefone: solicitanteData.telefone
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar solicitante:', error);
        toast.error('Erro ao adicionar solicitante');
        return;
      }

      const newSolicitante: Solicitante = {
        id: data.id,
        nome: data.nome,
        empresaId: data.empresa_id || 0,
        empresaNome,
        email: data.email,
        telefone: data.telefone || '',
        cargo: solicitanteData.cargo
      };

      setSolicitantes(prev => [...prev, newSolicitante]);
      toast.success('Solicitante cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar solicitante:', error);
      toast.error('Erro ao adicionar solicitante');
    }
  };

  const updateSolicitante = async (id: number, updatedData: Partial<Solicitante>) => {
    console.log('Atualizando solicitante:', id, updatedData);
    
    // Se está atualizando a empresa, buscar o nome atualizado
    if (updatedData.empresaId) {
      const empresa = empresas.find(e => e.id === updatedData.empresaId);
      if (empresa) {
        updatedData.empresaNome = empresa.nome;
      }
    }
    
    try {
      const { error } = await supabase
        .from('solicitantes')
        .update({
          nome: updatedData.nome,
          empresa_id: updatedData.empresaId,
          email: updatedData.email,
          telefone: updatedData.telefone
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar solicitante:', error);
        toast.error('Erro ao atualizar solicitante');
        return;
      }

      setSolicitantes(prev => prev.map(s => 
        s.id === id ? { ...s, ...updatedData } : s
      ));
      toast.success('Solicitante atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar solicitante:', error);
      toast.error('Erro ao atualizar solicitante');
    }
  };

  const deleteSolicitante = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este solicitante?')) {
      return;
    }

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

      setSolicitantes(prev => prev.filter(s => s.id !== id));
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