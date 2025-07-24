
export interface Notificacao {
  id: string;
  tipo: 'os_preenchida' | 'corrida_criada' | 'documento_vencendo';
  titulo: string;
  descricao: string;
  corridaId?: number;
  motoristaEmail?: string;
  motoristaName?: string;
  dataHora: string;
  lida: boolean;
  destinatarios: string[]; // emails dos usuários que devem receber
}

export interface NotificacoesContextType {
  notificacoes: Notificacao[];
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'dataHora' | 'lida'>) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  obterNaoLidas: (userEmail?: string) => Notificacao[];
  obterQuantidadeNaoLidas: (userEmail?: string) => number;
}
