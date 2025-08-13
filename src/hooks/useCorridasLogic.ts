
import { useCorridas } from './useCorridas';
import { useEmpresas } from '@/contexts/EmpresasContext';
import { useMotoristas } from '@/hooks/useMotoristas';
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
    getCorridasByMotorista
  } = useCorridas();

  const { empresas } = useEmpresas();
  const { motoristas } = useMotoristas();

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

  const processFormData = (formData: any, documentos: any, empresas: any[], motoristas: any[]) => {
    // Buscar empresa para obter o ID
    const empresa = empresas.find((e: any) => e.nome === formData.empresa);
    const empresaId = empresa ? empresa.id : 1;
    
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
    
    const corridaData = {
      empresa: formData.empresa,
      empresaId: empresaId,
      solicitante: formData.solicitante,
      motorista: motoristaName,
      passageiros: formData.passageiros || '',
      origem: formData.origem,
      destino: formData.destino,
      data: formData.dataServico || new Date().toISOString().split('T')[0],
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
    return processFormData(formData, documentos, empresas, motoristas);
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
    selectMotorista
  };
};
