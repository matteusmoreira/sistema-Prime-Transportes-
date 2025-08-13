import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCorridas } from '../contexts/CorridasContext';
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
  
  console.log('Corridas originais no financeiro:', corridasOriginais);
  
  // Filtrar apenas corridas que foram preenchidas pelo motorista (status, flag ou número de OS gerado)
  const corridasParaFinanceiro = corridasOriginais.filter(corrida => 
    corrida.status === 'Aguardando Conferência' || corrida.preenchidoPorMotorista === true || (!!corrida.numeroOS && String(corrida.numeroOS).trim() !== '')
  );
  
  console.log('Corridas filtradas para financeiro:', corridasParaFinanceiro);
  
  // Converter corridas do formato original para o formato do financeiro com TODOS os dados
  const baseCorridas: CorridaFinanceiro[] = useMemo(() => {
    return corridasParaFinanceiro.map(corrida => {
      const statusMapeado = mapStatusToFinanceiro(corrida.status);
      console.log(`Mapeando corrida ${corrida.id}: status original "${corrida.status}" -> status financeiro "${statusMapeado}"`);
      
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

  const [corridas, setCorridas] = useState<CorridaFinanceiro[]>(baseCorridas);
  
  useEffect(() => {
    setCorridas(baseCorridas);
  }, [baseCorridas]);

  console.log('Corridas mapeadas para CorridaFinanceiro:', baseCorridas);

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
    console.log('=== FINANCEIRO UPDATE STATUS ===');
    console.log('Atualizando status da corrida:', corridaId, 'para:', status);
    console.log('Corridas antes da atualização:', corridasOriginais);
    
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
    
    console.log('Status mapeado para contexto:', corridaStatus);
    updateCorridaStatus(corridaId, corridaStatus);
    setCorridas(prev => prev.map(c => c.id === corridaId ? { ...c, status } : c));
    console.log('=== FIM FINANCEIRO UPDATE STATUS ===');
    toast.success(`Status alterado para ${status}!`);
  };

  const updatePaymentStatus = (corridaId: number, statusPagamento: CorridaFinanceiro['statusPagamento']) => {
    console.log('=== FINANCEIRO UPDATE PAYMENT STATUS ===');
    console.log('Atualizando status de pagamento da corrida:', corridaId, 'para:', statusPagamento);

    // Atualiza UI imediatamente
    setCorridas(prev => prev.map(c => c.id === corridaId ? { ...c, statusPagamento } : c));
    // Persiste no banco
    updateCorridaOriginal(corridaId, { statusPagamento });

    console.log('=== FIM FINANCEIRO UPDATE PAYMENT STATUS ===');
    toast.success(`Status de pagamento alterado para ${statusPagamento}!`);
  };

  const updateMedicaoNotaFiscalStatus = (corridaId: number, medicaoNotaFiscal: CorridaFinanceiro['medicaoNotaFiscal']) => {
    console.log('=== FINANCEIRO UPDATE MEDIÇÃO/NOTA FISCAL STATUS ===');
    console.log('Atualizando status de medição/nota fiscal da corrida:', corridaId, 'para:', medicaoNotaFiscal);
    
    // Atualiza UI imediatamente
    setCorridas(prev => prev.map(c => c.id === corridaId ? { ...c, medicaoNotaFiscal } : c));
    // Persiste no banco
    updateCorridaOriginal(corridaId, { medicaoNotaFiscal });
    
    console.log('=== FIM FINANCEIRO UPDATE MEDIÇÃO/NOTA FISCAL STATUS ===');
    toast.success(`Status de medição/nota fiscal alterado para ${medicaoNotaFiscal}!`);
  };

  const updateCorrida = (corridaId: number, formData: any) => {
    console.log('=== FINANCEIRO UPDATE CORRIDA ===');
    console.log('ID da corrida:', corridaId);
    console.log('Dados recebidos do formulário:', formData);
    console.log('Tipo dos dados:', typeof formData);
    console.log('Keys dos dados:', Object.keys(formData));
    
    updateCorridaOriginal(corridaId, formData);
    
    // Atualizar também o estado local do financeiro
    setCorridas(prev => prev.map(c => 
      c.id === corridaId 
        ? { ...c, ...formData }
        : c
    ));
    
    console.log('=== FIM FINANCEIRO UPDATE CORRIDA ===');
    toast.success('Corrida atualizada com sucesso!');
  };

  const approveCorrida = (corrida: CorridaFinanceiro) => {
    console.log('Aprovando corrida:', corrida.id);
    updateStatus(corrida.id, 'Aprovada');
  };

  const rejectCorrida = (corrida: CorridaFinanceiro, motivoReprovacao: string) => {
    console.log('Rejeitando corrida:', corrida.id, 'motivo:', motivoReprovacao);
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
