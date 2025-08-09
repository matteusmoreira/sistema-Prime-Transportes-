
import { useCorridas } from './useCorridas';
import { useEmpresas } from '@/contexts/EmpresasContext';
import { useMotoristas } from '@/hooks/useMotoristas';
import { getCorridasByMotorista as getCorridasHelper } from '@/utils/corridaHelpers';
import { toast } from 'sonner';

export const useCorridasLogic = (userLevel: string, userEmail: string) => {
  console.log('=== useCorridasLogic INIT ===');
  console.log('UserLevel no hook:', userLevel);
  console.log('UserEmail no hook:', userEmail);
  
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

  console.log('Total de corridas no contexto:', corridas.length);
  console.log('Todas as corridas do contexto:', corridas);

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
    console.log('=== DEBUG processFormData ===');
    console.log('Dados do formulário recebidos:', formData);
    console.log('Motorista selecionado no formulário:', formData.motorista);
    console.log('UserLevel no processFormData:', userLevel);
    console.log('UserEmail no processFormData:', userEmail);
    console.log('Tipo do campo motorista:', typeof formData.motorista);
    console.log('Valor exato do motorista:', JSON.stringify(formData.motorista));
    
    // Buscar empresa para obter o ID
    const empresa = empresas.find((e: any) => e.nome === formData.empresa);
    const empresaId = empresa ? empresa.id : 1;
    
    // Se for um motorista logado, buscar o nome do motorista pelo email
    let motoristaName = formData.motorista;
    if (userLevel === 'Motorista' && userEmail) {
      const motorista = motoristas.find((m: any) => m.email === userEmail);
      if (motorista) {
        motoristaName = motorista.nome;
        console.log('Motorista automaticamente associado:', motoristaName);
      }
    }
    
    const kmInicial = parseInt(formData.kmInicial) || 0;
    const kmFinal = parseInt(formData.kmFinal) || 0;
    const kmTotal = kmFinal - kmInicial;
    
    const corridaData = {
      empresa: formData.empresa,
      empresaId: empresaId,
      solicitante: formData.solicitante,
      motorista: motoristaName, // Nome do motorista (automaticamente associado se for motorista logado)
      passageiro: formData.passageiros || '',
      telefonePassageiro: '',
      origem: formData.origem,
      destino: formData.destino,
      data: formData.dataServico || new Date().toISOString().split('T')[0],
      horaSaida: formData.horaInicio || '00:00',
      horaChegada: '00:00', // Campo não mais usado
      observacoes: formData.observacoes || '',
      // Campos adicionais
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
      passageiros: formData.passageiros,
      projeto: formData.projeto,
      motivo: formData.motivo,
      documentos: documentos
    };
    
    console.log('Dados processados para salvar:', corridaData);
    console.log('=== FIM DEBUG processFormData ===');
    
    return corridaData;
  };

  // Determinar corridas filtradas baseado no nível do usuário
  let corridasFiltradas;
  
  if (userLevel === 'Motorista') {
    console.log('=== FILTRANDO CORRIDAS PARA MOTORISTA ===');
    console.log('Chamando getCorridasByMotorista com email:', userEmail);
    corridasFiltradas = getCorridasHelper(corridas, userEmail, motoristas);
    console.log('Resultado da filtragem - Corridas encontradas:', corridasFiltradas);
    console.log('Quantidade de corridas do motorista:', corridasFiltradas.length);
    
    // Debug adicional para verificar cada corrida
    corridasFiltradas.forEach((corrida, index) => {
      console.log(`Corrida ${index + 1} do motorista:`, {
        id: corrida.id,
        motorista: corrida.motorista,
        empresa: corrida.empresa,
        status: corrida.status,
        origem: corrida.origem,
        destino: corrida.destino
      });
    });
  } else {
    console.log('=== USUÁRIO NÃO É MOTORISTA ===');
    console.log('Retornando todas as corridas para admin/financeiro');
    corridasFiltradas = corridas;
  }

  console.log('=== DEBUG useCorridasLogic FINAL ===');
  console.log('UserLevel:', userLevel);
  console.log('UserEmail:', userEmail);
  console.log('Total de corridas:', corridas.length);
  console.log('Corridas filtradas:', corridasFiltradas.length);
  console.log('Array de corridas filtradas que será retornado:', corridasFiltradas);
  console.log('=== FIM DEBUG useCorridasLogic ===');

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
