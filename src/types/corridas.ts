
export interface DocumentoUpload {
  id: string;
  nome: string;
  descricao: string;
  arquivo?: File;
}

export interface Corrida {
  id: number;
  solicitante: string;
  empresa: string;
  empresaId: number;
  passageiro: string;
  telefonePassageiro: string;
  origem: string;
  destino: string;
  data: string;
  horaSaida: string;
  horaChegada: string;
  observacoes: string;
  status: 'Pendente' | 'Confirmada' | 'Em Andamento' | 'Concluída' | 'Cancelada' | 'Aguardando OS' | 'OS Preenchida' | 'Aprovada' | 'Rejeitada' | 'Aguardando Conferência' | 'Em Análise' | 'No Show' | 'Revisar';
  motorista?: string;
  veiculo?: string;
  kmInicial?: number;
  kmFinal?: number;
  kmTotal?: number;
  combustivelInicial?: number;
  combustivelFinal?: number;
  pedagio?: number;
  estacionamento?: number;
  hospedagem?: number;
  outros?: number;
  total?: number;
  valor?: number;
  valorMotorista?: number;
  motivoRejeicao?: string;
  documentos?: DocumentoUpload[];
  horaInicio?: string;
  tipoAbrangencia?: string;
  dataServico?: string;
  distanciaPercorrida?: number;
  tempoViagem?: string;
  observacoesOS?: string;
  reembolsos?: number;
  valorCombustivel?: number;
  localAbastecimento?: string;
  centroCusto: string; // Removido o '?' para tornar obrigatório
  destinoExtra?: string;
  numeroOS?: string;
  passageiros?: string;
  projeto?: string;
  motivo?: string;
  preenchidoPorMotorista?: boolean;
}

export interface CorridasContextType {
  corridas: Corrida[];
  addCorrida: (corridaData: Omit<Corrida, 'id' | 'status'>) => void;
  updateCorrida: (id: number, updatedData: Partial<Corrida>) => void;
  fillOS: (id: number, osData: Partial<Corrida>) => void;
  deleteCorrida: (id: number) => void;
  approveCorrida: (id: number) => void;
  rejectCorrida: (id: number, motivo: string) => void;
  updateStatus: (id: number, status: Corrida['status']) => void;
  getCorridasByMotorista: (motoristaEmail: string) => Corrida[];
}
