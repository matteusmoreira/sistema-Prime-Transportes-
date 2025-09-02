
import { useCorridas } from './useCorridas';
import { useEmpresas } from '@/contexts/EmpresasContext';
import { useMotoristas } from '@/hooks/useMotoristas';
import { useSolicitantes } from '@/hooks/useSolicitantes';
import { getCorridasByMotorista as getCorridasHelper } from '@/utils/corridaHelpers';
import { toast } from 'sonner';

export const useCorridasLogic = (userLevel: string, userEmail: string) => {
  const { 
    corridas, 
    addCorrida, 
    updateCorrida,
    fillOS,
    deleteCorrida, 
    approveCorrida, 
    rejectCorrida,
    selectMotorista,
    getCorridasByMotorista,
    lastUpdated,
    refreshCorridas,
    isRealtimeConnected
  } = useCorridas();

  const { empresas } = useEmpresas();
  const { motoristas } = useMotoristas();
  const { solicitantes } = useSolicitantes();

  const handleEdit = (corrida: any) => {
    if (userLevel === 'Motorista' && corrida.status !== 'Aguardando Conferência') {
      toast.error('Você só pode editar corridas em conferência');
      return false;
    }
    return true;
  };

  const handleFillOS = (corrida: any) => {
    if (userLevel !== 'Motorista') {
      toast.error('Apenas motoristas podem preencher OS');
      return false;
    }
    return true;
  };

  const processFormData = (formData: any, documentos: any, empresas: any[], motoristas: any[], solicitantes: any[]) => {
    // Buscar empresa - usar empresaId se disponível, senão buscar por nome
    let empresa = null;
    let empresaId = null;
    
    if (formData.empresaId) {
      // Novo formato - usar ID
      empresaId = parseInt(formData.empresaId);
      empresa = empresas.find((e: any) => e.id === empresaId);
    } else if (formData.empresa) {
      // Compatibilidade - buscar por nome
      empresa = empresas.find((e: any) => e.nome === formData.empresa);
      empresaId = empresa?.id || 1;
    }

    // Buscar solicitante - usar solicitanteId se disponível
    let solicitanteId = null;
    if (formData.solicitanteId) {
      solicitanteId = parseInt(formData.solicitanteId);
    } else if (formData.solicitante) {
      // Compatibilidade - buscar por nome
      const solicitante = solicitantes.find((s: any) => s.nome === formData.solicitante);
      solicitanteId = solicitante?.id || null;
    }
    
    // Se for um motorista logado, buscar o nome do motorista pelo email
    let motoristaName = formData.motorista;
    if (userLevel === 'Motorista' && userEmail) {
      const motorista = motoristas.find((m: any) => m.email === userEmail);
      if (motorista) {
        motoristaName = motorista.nome;
      }
    }
    
    const kmInicial = parseInt(formData.kmInicial) || 0;
    const kmFinal = parseInt(formData.kmFinal) || 0;
    const kmTotal = kmFinal - kmInicial;
    
    // Data local no formato YYYY-MM-DD para evitar problemas de fuso e IIFE inline
    const todayLocal = (() => {
      const t = new Date();
      const y = t.getFullYear();
      const m = String(t.getMonth() + 1).padStart(2, '0');
      const d = String(t.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();

    const corridaData = {
      empresa: empresa?.nome || formData.empresa || '',
      empresaId: empresaId || 1,
      solicitante: formData.solicitante || '',
      solicitanteId: solicitanteId,
      motorista: motoristaName,
      passageiros: formData.passageiros || '',
      origem: formData.origem,
      destino: formData.destino,
      data: formData.dataServico || todayLocal,
      horaSaida: formData.horaInicio || '00:00',
      horaChegada: '00:00',
      observacoes: formData.observacoes || '',
      dataServico: formData.dataServico,
      horaInicio: formData.horaInicio,
      tipoAbrangencia: formData.tipoAbrangencia,
      kmInicial: kmInicial,
      kmFinal: kmFinal,
      kmTotal: kmTotal,
      valor: parseFloat(formData.valor) || 0,
      valorMotorista: parseFloat(formData.valorMotorista) || 0,
      veiculo: formData.veiculo,
      centroCusto: formData.centroCusto,
      destinoExtra: formData.destinoExtra,
      pedagio: parseFloat(formData.pedagio) || 0,
      estacionamento: parseFloat(formData.estacionamento) || 0,
      hospedagem: parseFloat(formData.hospedagem) || 0,
      numeroOS: formData.numeroOS,
      projeto: formData.projeto,
      motivo: formData.motivo,
      documentos: documentos
    };
    
    return corridaData;
  };

  // Determinar corridas filtradas baseado no nível do usuário
  let corridasFiltradas;
  
  if (userLevel === 'Motorista') {
    corridasFiltradas = getCorridasHelper(corridas, userEmail, motoristas);
  } else {
    corridasFiltradas = corridas;
  }

  const processFormDataWithContext = (formData: any, documentos: any) => {
    return processFormData(formData, documentos, empresas, motoristas, solicitantes);
  };

  return {
    corridasFiltradas,
    handleEdit,
    handleFillOS,
    processFormData: processFormDataWithContext,
    addCorrida,
    updateCorrida,
    fillOS,
    deleteCorrida,
    approveCorrida,
    rejectCorrida,
    selectMotorista,
    lastUpdated,
    refreshCorridas,
    isRealtimeConnected
  };
};
