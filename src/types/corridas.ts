
export interface DocumentoUpload {
  id: string | number;
  nome: string;
  descricao: string;
  arquivo?: File;
  url?: string;
}

export interface Corrida {
  id: number;
  solicitante: string;
  empresa: string;
  empresaId: number;
  origem: string;
  destino: string;
  data: string;
  horaSaida: string;
  horaChegada: string;
  observacoes: string;
  status: 'Pendente' | 'Confirmada' | 'Em Andamento' | 'Concluída' | 'Cancelada' | 'Aguardando OS' | 'OS Preenchida' | 'Aprovada' | 'Rejeitada' | 'Aguardando Conferência' | 'Em Análise' | 'No Show' | 'Revisar' | 'Selecionar Motorista';
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
  horaOS?: string;
  horaEspera?: string;
  valorHoraEspera?: number;
  cteNf?: string;
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
  passageiros: string;
  projeto?: string;
  motivo?: string;
  preenchidoPorMotorista?: boolean;
  preenchidoPorFinanceiro?: boolean;
  statusPagamento?: 'Pendente' | 'Pago';
  medicaoNotaFiscal?: 'Medição' | 'Nota Fiscal';
}

export interface CorridasContextType {
  corridas: Corrida[];
  loading: boolean;
  lastUpdated: Date | null;
  isRealtimeConnected: boolean;
  addCorrida: (corridaData: Omit<Corrida, 'id' | 'status'>) => Promise<void>;
  updateCorrida: (id: number, updatedData: Partial<Corrida>) => Promise<void>;
  fillOS: (id: number, osData: Partial<Corrida>) => Promise<void>;
  deleteCorrida: (id: number) => Promise<void>;
  approveCorrida: (id: number) => Promise<void>;
  rejectCorrida: (id: number, motivo: string) => Promise<void>;
  updateStatus: (id: number, status: Corrida['status']) => Promise<void>;
  selectMotorista: (corridaId: number, motoristaName: string, veiculo?: string) => Promise<void>;
  loadCorridas: () => Promise<void>;
  refreshCorridas: () => Promise<void>;
  getCorridasByMotorista: (motoristaEmail: string, motoristas: any[]) => Corrida[];
}
