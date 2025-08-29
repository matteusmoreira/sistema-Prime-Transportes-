import { Corrida } from '@/types/corridas';

export const getCorridasByMotorista = (corridas: Corrida[], motoristaEmail: string, motoristas: any[]): Corrida[] => {
  // Logs de debug removidos para produção
  const motorista = motoristas.find((m: any) => m.email === motoristaEmail);
  if (!motorista) {
    return [];
  }
  // Filtrar corridas pelo nome do motorista
  const corridasDoMotorista = corridas.filter((corrida) => corrida.motorista === motorista.nome);
  return corridasDoMotorista;
};