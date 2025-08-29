import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCorridas } from '../contexts/CorridasContext';
import { supabase } from '@/integrations/supabase/client';
import { type Corrida } from '../types/corridas';

export interface CorridaFinanceiro {
  id: number;
  empresa: string;
  motorista: string;
  dataServico: string;
  origem: string;
  destino: string;
  kmTotal: number;
  valor: number;
  valorMotorista?: number;
  status: 'Aguardando Conferência' | 'Em Análise' | 'No Show' | 'Revisar' | 'Cancelada' | 'Aprovada';
  statusPagamento: 'Pendente' | 'Pago';
  medicaoNotaFiscal: 'Medição' | 'Nota Fiscal';
  observacoes?: string;
  motivoReprovacao?: string;
  dataConferencia?: string;
  conferenciadoPor?: string;
  centroCusto: string;
  pedagio: number;
  estacionamento: number;
  hospedagem: number;
  passageiros: string;
  destinoExtra: string;
  numeroOS: string;
  projeto?: string;
  motivo?: string;
  horaInicio?: string;
  horaFim?: string;
  kmInicial?: number;
  kmFinal?: number;
  solicitante?: string;
  tipoAbrangencia?: string;
}

export const useFinanceiro = () => {
  const { corridas: corridasOriginais, updateStatus: updateCorridaStatus, updateCorrida: updateCorridaOriginal } = useCorridas();
  
  // Filtrar corridas para conferência financeira: incluir recém-cadastradas e já preenchidas
  const corridasParaFinanceiro = corridasOriginais.filter(corrida => 
    // Incluir corridas já preenchidas pelo motorista
    corrida.status === 'Aguardando Conferência' || 
    corrida.preenchidoPorMotorista === true || 
    (!!corrida.numeroOS && String(corrida.numeroOS).trim() !== '') ||
    // Incluir corridas recém-cadastradas que ainda não foram preenchidas
    corrida.status === 'Aguardando OS' ||
    corrida.status === 'Selecionar Motorista' ||
    corrida.status === 'Pendente' ||
    // Incluir corridas editadas pelo financeiro
    (corrida as any).preenchidoPorFinanceiro === true
  );
  
  // Converter corridas do formato original para o formato do financeiro com TODOS os dados
  const baseCorridas: CorridaFinanceiro[] = useMemo(() => {
    return corridasParaFinanceiro.map(corrida => {
      const statusMapeado = mapStatusToFinanceiro(corrida.status);
      
      return {
        id: corrida.id,
        empresa: corrida.empresa,
        motorista: corrida.motorista || '',
        dataServico: (corrida as any).dataServico || corrida.data,
        origem: corrida.origem,
        destino: corrida.destino,
        kmTotal: corrida.kmTotal || 0,
        valor: corrida.valor || 0,
        valorMotorista: corrida.valorMotorista || 0,
        status: statusMapeado,
        statusPagamento: (corrida as any).statusPagamento || 'Pendente',
        medicaoNotaFiscal: (corrida as any).medicaoNotaFiscal || 'Medição',
        observacoes: corrida.observacoes,
        centroCusto: corrida.centroCusto || '',
        pedagio: corrida.pedagio || 0,
        estacionamento: corrida.estacionamento || 0,
        hospedagem: corrida.hospedagem || 0,
        passageiros: (corrida as any).passageiros || '',
        destinoExtra: corrida.destinoExtra || '',
        numeroOS: corrida.numeroOS || '',
        projeto: corrida.projeto,
        motivo: corrida.motivo,
        horaInicio: (corrida as any).horaInicio || (corrida as any).horaSaida,
        tipoAbrangencia: (corrida as any).tipoAbrangencia,
        kmInicial: corrida.kmInicial,
        kmFinal: corrida.kmFinal,
        solicitante: corrida.solicitante
      };
    });
  }, [corridasParaFinanceiro]);

  const corridas = baseCorridas;

  // Função para mapear status entre os tipos
  function mapStatusToFinanceiro(status: Corrida['status']): CorridaFinanceiro['status'] {
    switch (status) {
      case 'OS Preenchida':
      case 'Pendente':
      case 'Aguardando Conferência':
        return 'Aguardando Conferência';
      case 'Aprovada':
        return 'Aprovada';
      case 'No Show':
        return 'No Show';
      case 'Rejeitada':
        return 'Revisar';
      case 'Cancelada':
        return 'Cancelada';
      default:
        return 'Em Análise';
    }
  }

  const updateStatus = (corridaId: number, status: CorridaFinanceiro['status']) => {
    // Mapear status do financeiro para o contexto de corridas
    let corridaStatus: Corrida['status'];
    switch (status) {
      case 'Aguardando Conferência':
        corridaStatus = 'Aguardando Conferência';
        break;
      case 'Aprovada':
        corridaStatus = 'Aprovada';
        break;
      case 'Revisar':
        corridaStatus = 'Rejeitada';
        break;
      case 'Cancelada':
        corridaStatus = 'Cancelada';
        break;
      case 'Em Análise':
        corridaStatus = 'Em Análise';
        break;
      case 'No Show':
        corridaStatus = 'No Show';
        break;
      default:
        corridaStatus = 'Em Análise';
    }
    
    updateCorridaStatus(corridaId, corridaStatus);
    toast.success(`Status alterado para ${status}!`);
  };

  const updatePaymentStatus = (corridaId: number, statusPagamento: CorridaFinanceiro['statusPagamento']) => {
    // Persiste no banco
    updateCorridaOriginal(corridaId, { statusPagamento });
    toast.success(`Status de pagamento alterado para ${statusPagamento}!`);
  };

  const updateMedicaoNotaFiscalStatus = (corridaId: number, medicaoNotaFiscal: CorridaFinanceiro['medicaoNotaFiscal']) => {
    // Persiste no banco
    updateCorridaOriginal(corridaId, { medicaoNotaFiscal });
    toast.success(`Status de medição/nota fiscal alterado para ${medicaoNotaFiscal}!`);
  };

  const updateCorrida = async (corridaId: number, updatedData: any, documentos: any) => {
    try {
      // Buscar informações do perfil do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, email')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Perfil do usuário não encontrado');

      // Preparar dados para atualização com auditoria
      const updatePayload: any = {
        empresa: updatedData.empresa,
        solicitante: updatedData.solicitante,
        passageiro: updatedData.passageiros,
        telefone_passageiro: updatedData.telefonePassageiro,
        origem: updatedData.origem,
        destino: updatedData.destino,
        data: updatedData.data,
        data_servico: updatedData.dataServico,
        hora_saida: updatedData.horaSaida,
        hora_chegada: updatedData.horaChegada,
        motorista: updatedData.motorista,
        veiculo: updatedData.veiculo,
        km_inicial: updatedData.kmInicial,
        km_final: updatedData.kmFinal,
        km_total: updatedData.kmTotal,
        valor: updatedData.valor,
        valor_motorista: updatedData.valorMotorista,
        pedagio: updatedData.pedagio,
        estacionamento: updatedData.estacionamento,
        hospedagem: updatedData.hospedagem,
        preenchido_por_financeiro: true,
        data_edicao_financeiro: new Date().toISOString(),
        usuario_edicao_financeiro: profile.nome,
        observacoes: updatedData.observacoes ? 
          `${updatedData.observacoes}\n\n[Editado pelo Financeiro em ${new Date().toLocaleString('pt-BR')} por ${profile.nome}]` :
          `[Editado pelo Financeiro em ${new Date().toLocaleString('pt-BR')} por ${profile.nome}]`,
        updated_at: new Date().toISOString()
      };

      // Executar atualização na base de dados
      const { data: updatedCorrida, error } = await supabase
        .from('corridas')
        .update(updatePayload)
        .eq('id', corridaId)
        .select()
        .single();

      if (error) throw error;

      // Upload de documentos se houver
      if (documentos && documentos.length > 0) {
        for (const documento of documentos) {
          if (documento.arquivo) {
            const fileName = `${corridaId}_${documento.nome}_${Date.now()}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('corrida-documentos')
              .upload(fileName, documento.arquivo);

            if (!uploadError && uploadData) {
              await supabase
                .from('corrida_documentos')
                .insert({
                  corrida_id: corridaId,
                  nome: documento.nome,
                  descricao: documento.descricao,
                  url: uploadData.path
                });
            }
          }
        }
      }

      // Atualizar o contexto global
      await updateCorridaOriginal(corridaId, {
        ...updatedData,
        preenchidoPorFinanceiro: true,
        observacoes: updatePayload.observacoes
      });

      toast.success('Corrida atualizada com sucesso!');

    } catch (error) {
      console.error('Erro ao atualizar corrida:', error);
      toast.error('Erro ao atualizar corrida: ' + (error as Error).message);
      throw error;
    }
  };

  const approveCorrida = (corrida: CorridaFinanceiro) => {
    updateStatus(corrida.id, 'Aprovada');
  };

  const rejectCorrida = (corrida: CorridaFinanceiro, motivoReprovacao: string) => {
    updateStatus(corrida.id, 'Revisar');
  };

  const getStats = () => {
    const pendingCount = corridas.filter(c => c.status === 'Em Análise').length;
    const approvedCount = corridas.filter(c => c.status === 'Aprovada' || c.status === 'No Show').length;
    const rejectedCount = corridas.filter(c => c.status === 'Revisar').length;
    const totalValue = corridas
      .filter(c => c.status === 'Aprovada' || c.status === 'No Show')
      .reduce((sum, c) => sum + c.valor, 0);

    return { pendingCount, approvedCount, rejectedCount, totalValue };
  };

  return {
    corridas,
    updateStatus,
    updatePaymentStatus,
    updateMedicaoNotaFiscalStatus,
    updateCorrida,
    approveCorrida,
    rejectCorrida,
    getStats
  };
};
