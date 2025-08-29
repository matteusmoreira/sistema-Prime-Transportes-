
import { useState } from 'react';
import { Corrida } from '@/types/corridas';

export const useFormData = (editingCorrida: Corrida | null) => {
  const [formData, setFormData] = useState({
    empresa: editingCorrida?.empresa || '',
    solicitante: editingCorrida?.solicitante || '',
    motorista: editingCorrida?.motorista || '',
    dataServico: editingCorrida?.dataServico || editingCorrida?.data || '',
    horaInicio: editingCorrida?.horaInicio || editingCorrida?.horaSaida || '',
    tipoAbrangencia: editingCorrida?.tipoAbrangencia || '',
    kmInicial: editingCorrida?.kmInicial?.toString() || '',
    kmFinal: editingCorrida?.kmFinal?.toString() || '',
    valor: editingCorrida?.valor?.toString() || '',
    valorMotorista: editingCorrida?.valorMotorista?.toString() || '',
    origem: editingCorrida?.origem || '',
    destino: editingCorrida?.destino || '',
    observacoes: editingCorrida?.observacoes || '',
    centroCusto: editingCorrida?.centroCusto || '',
    destinoExtra: editingCorrida?.destinoExtra || '',
    pedagio: editingCorrida?.pedagio?.toString() || '',
    estacionamento: editingCorrida?.estacionamento?.toString() || '',
    hospedagem: editingCorrida?.hospedagem?.toString() || '',
    numeroOS: editingCorrida?.numeroOS || '',
    passageiros: editingCorrida?.passageiros || '',
    projeto: editingCorrida?.projeto || '',
    motivo: editingCorrida?.motivo || '',
    veiculo: editingCorrida?.veiculo || ''
  });

  const updateFormData = (field: string, value: string) => {
    // Removido log de debug de atualização de campo
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return { formData, updateFormData };
};
