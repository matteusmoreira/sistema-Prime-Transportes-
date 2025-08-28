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

  const [corridas, setCorridas] = useState<CorridaFinanceiro[]>(baseCorridas);
  
  useEffect(() => {
    setCorridas(baseCorridas);
  }, [baseCorridas]);

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
    setCorridas(prev => prev.map(c => c.id === corridaId ? { ...c, status } : c));
    toast.success(`Status alterado para ${status}!`);
  };

  const updatePaymentStatus = (corridaId: number, statusPagamento: CorridaFinanceiro['statusPagamento']) => {
    // Atualiza UI imediatamente
    setCorridas(prev => prev.map(c => c.id === corridaId ? { ...c, statusPagamento } : c));
    // Persiste no banco
    updateCorridaOriginal(corridaId, { statusPagamento });

    toast.success(`Status de pagamento alterado para ${statusPagamento}!`);
  };

  const updateMedicaoNotaFiscalStatus = (corridaId: number, medicaoNotaFiscal: CorridaFinanceiro['medicaoNotaFiscal']) => {
    // Atualiza UI imediatamente
    setCorridas(prev => prev.map(c => c.id === corridaId ? { ...c, medicaoNotaFiscal } : c));
    // Persiste no banco
    updateCorridaOriginal(corridaId, { medicaoNotaFiscal });
    
    toast.success(`Status de medição/nota fiscal alterado para ${medicaoNotaFiscal}!`);
  };

  const updateCorrida = async (corridaId: number, formData: any) => {
    try {
      // Adicionar campos de controle de edição financeira
      const updatedFormData = {
        ...formData,
        preenchidoPorFinanceiro: true,
        dataEdicaoFinanceiro: new Date().toISOString(),
        usuarioEdicaoFinanceiro: 'Financeiro',
        // Adicionar observação automática se não houver
        observacoes: formData.observacoes ? 
          `${formData.observacoes}\n\n[Editado pelo Financeiro em ${new Date().toLocaleString('pt-BR')}]` :
          `[Editado pelo Financeiro em ${new Date().toLocaleString('pt-BR')}]`
      };
      
      await updateCorridaOriginal(corridaId, updatedFormData);
      
      // Atualizar também o estado local do financeiro
      setCorridas(prev => prev.map(c => 
        c.id === corridaId 
          ? { ...c, ...updatedFormData }
          : c
      ));
      
      toast.success('Corrida atualizada com sucesso pelo Financeiro!');
    } catch (error) {
      // Mostrar erro mais específico baseado no tipo
      let errorMessage = 'Erro desconhecido ao atualizar corrida';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as any;
        if (err.message?.includes('row-level security')) {
          errorMessage = 'Erro de permissão: Você não tem autorização para editar esta corrida';
        } else if (err.message?.includes('permission denied')) {
          errorMessage = 'Permissão negada para editar corrida';
        } else {
          errorMessage = err.message;
        }
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw para não fechar o dialog
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
