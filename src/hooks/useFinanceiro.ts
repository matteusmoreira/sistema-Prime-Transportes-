
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
}

export const useFinanceiro = () => {
  const { corridas: corridasOriginais, updateStatus: updateCorridaStatus, updateCorrida: updateCorridaOriginal } = useCorridas();
  
  console.log('Corridas originais no financeiro:', corridasOriginais);
  
  // Filtrar apenas corridas que foram preenchidas pelo motorista
  const corridasParaFinanceiro = corridasOriginais.filter(corrida => 
    corrida.preenchidoPorMotorista === true
  );
  
  console.log('Corridas filtradas para financeiro:', corridasParaFinanceiro);
  
  // Converter corridas do formato original para o formato do financeiro com TODOS os dados
  const corridas: CorridaFinanceiro[] = corridasParaFinanceiro.map(corrida => {
    const statusMapeado = mapStatusToFinanceiro(corrida.status);
    console.log(`Mapeando corrida ${corrida.id}: status original "${corrida.status}" -> status financeiro "${statusMapeado}"`);
    
    return {
      id: corrida.id,
      empresa: corrida.empresa,
      motorista: corrida.motorista || '',
      dataServico: corrida.dataServico || corrida.data,
      origem: corrida.origem,
      destino: corrida.destino,
      kmTotal: corrida.kmTotal || 0,
      valor: corrida.valor || 0,
      valorMotorista: corrida.valorMotorista || 0,
      status: statusMapeado,
      statusPagamento: 'Pendente', // Valor padrão
      medicaoNotaFiscal: 'Medição', // Valor padrão
      observacoes: corrida.observacoes,
      centroCusto: corrida.centroCusto || '',
      pedagio: corrida.pedagio || 0,
      estacionamento: corrida.estacionamento || 0,
      hospedagem: corrida.hospedagem || 0,
      passageiros: corrida.passageiros || corrida.passageiro,
      destinoExtra: corrida.destinoExtra || '',
      numeroOS: corrida.numeroOS || '',
      projeto: corrida.projeto,
      motivo: corrida.motivo,
      horaInicio: corrida.horaInicio || corrida.horaSaida,
      tipoAbrangencia: corrida.tipoAbrangencia,
      kmInicial: corrida.kmInicial,
      kmFinal: corrida.kmFinal,
      solicitante: corrida.solicitante
    };
  });

  console.log('Corridas mapeadas para CorridaFinanceiro:', corridas);

  // Função para mapear status entre os tipos
  function mapStatusToFinanceiro(status: Corrida['status']): CorridaFinanceiro['status'] {
    switch (status) {
      case 'OS Preenchida':
      case 'Pendente':
      case 'Aguardando Conferência':
        return 'Aguardando Conferência';
      case 'Aprovada':
        return 'Aprovada';
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
    console.log('=== FIM FINANCEIRO UPDATE STATUS ===');
    toast.success(`Status alterado para ${status}!`);
  };

  const updatePaymentStatus = (corridaId: number, statusPagamento: CorridaFinanceiro['statusPagamento']) => {
    console.log('=== FINANCEIRO UPDATE PAYMENT STATUS ===');
    console.log('Atualizando status de pagamento da corrida:', corridaId, 'para:', statusPagamento);
    
    // Por enquanto, apenas mostrar o toast - a persistência seria implementada posteriormente
    toast.success(`Status de pagamento alterado para ${statusPagamento}!`);
    
    console.log('=== FIM FINANCEIRO UPDATE PAYMENT STATUS ===');
  };

  const updateMedicaoNotaFiscalStatus = (corridaId: number, medicaoNotaFiscal: CorridaFinanceiro['medicaoNotaFiscal']) => {
    console.log('=== FINANCEIRO UPDATE MEDIÇÃO/NOTA FISCAL STATUS ===');
    console.log('Atualizando status de medição/nota fiscal da corrida:', corridaId, 'para:', medicaoNotaFiscal);
    
    // Por enquanto, apenas mostrar o toast - a persistência seria implementada posteriormente
    toast.success(`Status de medição/nota fiscal alterado para ${medicaoNotaFiscal}!`);
    
    console.log('=== FIM FINANCEIRO UPDATE MEDIÇÃO/NOTA FISCAL STATUS ===');
  };

  const updateCorrida = (corridaId: number, formData: any) => {
    console.log('Atualizando corrida no financeiro:', corridaId, 'com dados:', formData);
    updateCorridaOriginal(corridaId, formData);
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
    const approvedCount = corridas.filter(c => c.status === 'Aprovada').length;
    const rejectedCount = corridas.filter(c => c.status === 'Revisar').length;
    const totalValue = corridas.filter(c => c.status === 'Aprovada').reduce((sum, c) => sum + c.valor, 0);

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
