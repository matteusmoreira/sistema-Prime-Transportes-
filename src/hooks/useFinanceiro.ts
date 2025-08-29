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
    console.log('🚀 === INÍCIO updateCorrida ===');
    console.log('corridaId:', corridaId);
    console.log('updatedData recebido:', updatedData);
    console.log('documentos:', documentos);
    
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

      console.log('✅ Usuário autenticado:', profile.nome);

      // Preparar dados completos para atualização com TODOS os campos
      const updatePayload: any = {
        // Dados básicos
        empresa: updatedData.empresa,
        solicitante: updatedData.solicitante,
        passageiro: updatedData.passageiros || updatedData.passageiro,
        telefone_passageiro: updatedData.telefonePassageiro,
        origem: updatedData.origem,
        destino: updatedData.destino,
        destino_extra: updatedData.destinoExtra,
        
        // Datas e horários
        data: updatedData.data,
        data_servico: updatedData.dataServico,
        hora_saida: updatedData.horaSaida,
        hora_chegada: updatedData.horaChegada,
        hora_inicio: updatedData.horaInicio,
        
        // Motorista e veículo
        motorista: updatedData.motorista,
        veiculo: updatedData.veiculo,
        
        // Quilometragem
        km_inicial: parseFloat(updatedData.kmInicial) || 0,
        km_final: parseFloat(updatedData.kmFinal) || 0,
        km_total: parseFloat(updatedData.kmTotal) || 0,
        
        // Valores financeiros
        valor: parseFloat(updatedData.valor) || 0,
        valor_motorista: parseFloat(updatedData.valorMotorista) || 0,
        pedagio: parseFloat(updatedData.pedagio) || 0,
        estacionamento: parseFloat(updatedData.estacionamento) || 0,
        hospedagem: parseFloat(updatedData.hospedagem) || 0,
        outros: parseFloat(updatedData.outros) || 0,
        reembolsos: parseFloat(updatedData.reembolsos) || 0,
        valor_combustivel: parseFloat(updatedData.valorCombustivel) || 0,
        
        // Informações adicionais
        centro_custo: updatedData.centroCusto,
        numero_os: updatedData.numeroOS,
        projeto: updatedData.projeto,
        motivo: updatedData.motivo,
        tipo_abrangencia: updatedData.tipoAbrangencia,
        local_abastecimento: updatedData.localAbastecimento,
        tempo_viagem: updatedData.tempoViagem,
        
        // Combustível
        combustivel_inicial: parseFloat(updatedData.combustivelInicial) || 0,
        combustivel_final: parseFloat(updatedData.combustivelFinal) || 0,
        
        // Status e auditoria
        preenchido_por_financeiro: true,
        data_edicao_financeiro: new Date().toISOString(),
        usuario_edicao_financeiro: profile.nome,
        
        // Observações com auditoria
        observacoes: updatedData.observacoes ? 
          `${updatedData.observacoes}\n\n[Editado pelo Financeiro em ${new Date().toLocaleString('pt-BR')} por ${profile.nome}]` :
          `[Editado pelo Financeiro em ${new Date().toLocaleString('pt-BR')} por ${profile.nome}]`,
        
        // Timestamp de atualização
        updated_at: new Date().toISOString()
      };

      console.log('📝 Payload preparado para atualização:', updatePayload);

      // Executar atualização ÚNICA no banco de dados
      const { data: updatedCorrida, error } = await supabase
        .from('corridas')
        .update(updatePayload)
        .eq('id', corridaId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro no update do Supabase:', error);
        throw error;
      }

      console.log('✅ Corrida atualizada no banco:', updatedCorrida);

      // Upload de documentos se houver
      if (documentos && documentos.length > 0) {
        console.log('📎 Processando documentos...');
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
              console.log('✅ Documento salvo:', documento.nome);
            }
          }
        }
      }

      // NÃO atualizar o contexto manualmente - deixar o realtime funcionar
      // O realtime do CorridasContext vai atualizar automaticamente
      
      console.log('🎉 Corrida atualizada com sucesso!');
      toast.success('Corrida atualizada com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao atualizar corrida:', error);
      toast.error('Erro ao atualizar corrida: ' + (error as Error).message);
      throw error;
    }
    
    console.log('🏁 === FIM updateCorrida ===');
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
