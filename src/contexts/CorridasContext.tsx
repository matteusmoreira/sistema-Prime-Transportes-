
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Corrida, CorridasContextType } from '@/types/corridas';
import { getCorridasByMotorista } from '@/utils/corridaHelpers';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';

const CorridasContext = createContext<CorridasContextType | undefined>(undefined);

export const CorridasProvider = ({ children }: { children: ReactNode }) => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [loading, setLoading] = useState(true);
  const { shouldLoadData, isAuthLoading } = useAuthDependentData();

  // Carregar corridas do Supabase com documentos
  const loadCorridas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('corridas')
        .select(`
          *,
          corrida_documentos (
            id,
            nome,
            descricao,
            url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar corridas:', error);
        toast.error('Erro ao carregar corridas');
        return;
      }

      const corridasFormatted = data?.map(corrida => {
        // Determinar status baseado na presença do motorista
        let status = corrida.status as Corrida['status'];
        if (status === 'Pendente' || status === 'Aguardando Conferência') {
          status = corrida.motorista ? 'Aguardando OS' : 'Selecionar Motorista';
        }

        return {
          id: corrida.id,
          empresa: corrida.empresa || '',
          empresaId: corrida.empresa_id || 0,
          centroCusto: corrida.centro_custo || '',
          solicitante: corrida.solicitante || '',
          passageiro: corrida.passageiro || '',
          telefonePassageiro: corrida.telefone_passageiro || '',
          origem: corrida.origem || '',
          destino: corrida.destino || '',
          data: corrida.data || '',
          horaSaida: corrida.hora_saida || '',
          horaChegada: corrida.hora_chegada || '',
          observacoes: corrida.observacoes || '',
          status,
          motorista: corrida.motorista || '',
          kmInicial: corrida.km_inicial || 0,
          kmFinal: corrida.km_final || 0,
          kmTotal: corrida.km_total || 0,
          combustivelInicial: corrida.combustivel_inicial || 0,
          combustivelFinal: corrida.combustivel_final || 0,
          valorCombustivel: corrida.valor_combustivel || 0,
          pedagio: corrida.pedagio || 0,
          estacionamento: corrida.estacionamento || 0,
          hospedagem: corrida.hospedagem || 0,
          outros: corrida.outros || 0,
          valor: corrida.valor || 0,
          valorMotorista: corrida.valor_motorista || 0,
          horaInicio: corrida.hora_inicio || '',
          dataServico: corrida.data_servico || '',
          distanciaPercorrida: corrida.distancia_percorrida || 0,
          reembolsos: corrida.reembolsos || 0,
          veiculo: corrida.veiculo || '',
          projeto: corrida.projeto || '',
          motivo: corrida.motivo || '',
          motivoRejeicao: corrida.motivo_rejeicao || '',
          tipoAbrangencia: corrida.tipo_abrangencia || '',
          tempoViagem: corrida.tempo_viagem || '',
          observacoesOS: corrida.observacoes_os || '',
          preenchidoPorMotorista: corrida.preenchido_por_motorista || false,
          numeroOS: corrida.numero_os || '',
          total: corrida.total || 0,
          localAbastecimento: corrida.local_abastecimento || '',
          destinoExtra: corrida.destino_extra || '',
          passageiros: corrida.passageiros || '',
          documentos: Array.isArray(corrida.corrida_documentos) ? corrida.corrida_documentos : []
        };
      }) || [];

      setCorridas(corridasFormatted);
      console.log('Corridas carregadas do Supabase:', corridasFormatted.length);
    } catch (error) {
      console.error('Erro ao carregar corridas:', error);
      toast.error('Erro ao carregar corridas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoadData) {
      loadCorridas();
    } else if (!isAuthLoading) {
      setLoading(false);
    }
  }, [shouldLoadData, isAuthLoading]);

  const addCorrida = async (corridaData: Omit<Corrida, 'id' | 'status'>) => {
    console.log('Adicionando corrida:', corridaData);
    
    try {
      const status = corridaData.motorista ? 'Aguardando OS' : 'Selecionar Motorista';
      
      const { data, error } = await supabase
        .from('corridas')
        .insert({
          empresa: corridaData.empresa,
          empresa_id: corridaData.empresaId,
          centro_custo: corridaData.centroCusto,
          solicitante: corridaData.solicitante,
          passageiro: corridaData.passageiro,
          telefone_passageiro: corridaData.telefonePassageiro,
          origem: corridaData.origem,
          destino: corridaData.destino,
          data: corridaData.data,
          hora_saida: corridaData.horaSaida,
          hora_chegada: corridaData.horaChegada,
          observacoes: corridaData.observacoes,
          status: status as any,
          motorista: corridaData.motorista,
          veiculo: corridaData.veiculo,
          projeto: corridaData.projeto,
          motivo: corridaData.motivo,
          valor: corridaData.valor,
          valor_motorista: corridaData.valorMotorista,
          total: corridaData.total,
          tipo_abrangencia: corridaData.tipoAbrangencia,
          destino_extra: corridaData.destinoExtra
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar corrida:', error);
        toast.error('Erro ao adicionar corrida');
        return;
      }

      // Salvar documentos se existirem
      if (corridaData.documentos && corridaData.documentos.length > 0) {
        for (const documento of corridaData.documentos) {
          if (documento.arquivo) {
            try {
              // Upload do arquivo para o storage
              const fileName = `${data.id}_${Date.now()}_${documento.nome}`;
              const { error: uploadError } = await supabase.storage
                .from('corrida-documentos')
                .upload(fileName, documento.arquivo);

              if (uploadError) {
                console.error('Erro ao fazer upload do documento:', uploadError);
                continue;
              }

              // Salvar registro do documento na tabela com a URL do arquivo no storage
              const { error: docInsertError } = await supabase
                .from('corrida_documentos')
                .insert({
                  corrida_id: data.id,
                  nome: documento.nome,
                  descricao: documento.descricao,
                  url: fileName // Store the file path instead of public URL
                });

              if (docInsertError) {
                console.error('Erro ao inserir documento na tabela:', docInsertError);
              } else {
                console.log('Documento salvo com sucesso:', documento.nome);
              }
            } catch (docError) {
              console.error('Erro ao salvar documento:', docError);
            }
          }
        }
      }

      const newCorrida: Corrida = {
        ...corridaData,
        id: data.id,
        status: status as Corrida['status']
      };

      setCorridas(prev => [...prev, newCorrida]);
      toast.success('Corrida cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar corrida:', error);
      toast.error('Erro ao adicionar corrida');
    }
  };

  const updateCorrida = async (id: number, updatedData: Partial<Corrida>) => {
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, ...updatedData } : c
    ));
    toast.success('Corrida atualizada com sucesso!');
  };

  const fillOS = async (id: number, osData: Partial<Corrida>) => {
    try {
      console.log('Preenchendo OS - ID:', id, 'Dados:', osData);
      
      // Atualizar no Supabase com mapeamento correto de colunas
      const updatePayload: any = {
        hora_saida: (osData as any).horaSaida ?? (osData as any).horaInicio ?? null,
        hora_chegada: (osData as any).horaChegada ?? null,
        data: (osData as any).data ?? (osData as any).dataServico ?? null,
        hora_inicio: (osData as any).horaInicio ?? null,
        data_servico: (osData as any).dataServico ?? null,
        km_inicial: (osData as any).kmInicial ?? null,
        km_final: (osData as any).kmFinal ?? null,
        km_total: (osData as any).kmTotal ?? null,
        pedagio: (osData as any).pedagio ?? 0,
        estacionamento: (osData as any).estacionamento ?? 0,
        hospedagem: (osData as any).hospedagem ?? 0,
        destino_extra: (osData as any).destinoExtra ?? null,
        numero_os: (osData as any).numeroOS ?? null,
        passageiros: (osData as any).passageiros ?? null,
        observacoes_os: (osData as any).observacoes ?? null,
        status: 'OS Preenchida',
        preenchido_por_motorista: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('corridas')
        .update(updatePayload)
        .eq('id', id);

      if (error) {
        console.error('Erro ao preencher OS:', error);
        toast.error('Erro ao preencher ordem de serviço');
        return;
      }

      // Atualizar estado local apenas após sucesso no banco
      setCorridas(prev => prev.map(c => 
        c.id === id ? { 
          ...c, 
          ...osData, 
          status: 'OS Preenchida' as const, 
          preenchidoPorMotorista: true 
        } : c
      ));
      
      toast.success('Ordem de Serviço preenchida com sucesso!');
      console.log('OS preenchida com sucesso para corrida:', id);
    } catch (error) {
      console.error('Erro ao preencher OS:', error);
      toast.error('Erro ao preencher ordem de serviço');
    }
  };

  const deleteCorrida = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta corrida?')) {
      try {
        console.log('Excluindo corrida:', id);
        
        // Primeiro, excluir documentos relacionados
        const { error: docsError } = await supabase
          .from('corrida_documentos')
          .delete()
          .eq('corrida_id', id);
        
        if (docsError) {
          console.error('Erro ao excluir documentos da corrida:', docsError);
          // Continua mesmo com erro nos documentos
        }
        
        // Depois, excluir a corrida
        const { error } = await supabase
          .from('corridas')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao excluir corrida:', error);
          toast.error('Erro ao excluir corrida');
          return;
        }
        
        // Atualizar estado local apenas após sucesso na exclusão do banco
        setCorridas(prev => prev.filter(c => c.id !== id));
        toast.success('Corrida excluída com sucesso!');
        console.log('Corrida excluída com sucesso:', id);
      } catch (error) {
        console.error('Erro ao excluir corrida:', error);
        toast.error('Erro ao excluir corrida');
      }
    }
  };

  const approveCorrida = async (id: number) => {
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'Aprovada' as const } : c
    ));
    toast.success('Corrida aprovada com sucesso!');
  };

  const rejectCorrida = async (id: number, motivo: string) => {
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'Rejeitada' as const, motivoRejeicao: motivo } : c
    ));
    toast.error('Corrida rejeitada!');
  };

  const updateStatus = async (id: number, status: Corrida['status']) => {
    setCorridas(prev => prev.map(c => 
      c.id === id ? { ...c, status } : c
    ));
    toast.success('Status atualizado com sucesso!');
  };

  const selectMotorista = async (corridaId: number, motoristaName: string, veiculo?: string) => {
    try {
      const { error } = await supabase
        .from('corridas')
        .update({ 
          motorista: motoristaName,
          veiculo: veiculo || null,
          status: 'Aguardando OS'
        })
        .eq('id', corridaId);

      if (error) {
        console.error('Erro ao selecionar motorista:', error);
        toast.error('Erro ao selecionar motorista');
        return;
      }

      setCorridas(prev => prev.map(c => 
        c.id === corridaId ? { 
          ...c, 
          motorista: motoristaName,
          veiculo: veiculo || c.veiculo,
          status: 'Aguardando OS' as const
        } : c
      ));
      toast.success('Motorista selecionado com sucesso!');
    } catch (error) {
      console.error('Erro ao selecionar motorista:', error);
      toast.error('Erro ao selecionar motorista');
    }
  };

  return (
    <CorridasContext.Provider value={{
      corridas,
      loading,
      addCorrida,
      updateCorrida,
      fillOS,
      deleteCorrida,
    approveCorrida,
    rejectCorrida,
    updateStatus,
    selectMotorista,
    getCorridasByMotorista: (motoristaEmail: string, motoristas: any[]) => getCorridasByMotorista(corridas, motoristaEmail, motoristas)
    }}>
      {children}
    </CorridasContext.Provider>
  );
};

export const useCorridas = () => {
  const context = useContext(CorridasContext);
  if (context === undefined) {
    throw new Error('useCorridas must be used within a CorridasProvider');
  }
  return context;
};
