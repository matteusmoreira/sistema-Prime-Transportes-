export interface SystemLog {
  id: string;
  user_email: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_type: 'empresas' | 'solicitantes' | 'motoristas' | 'corridas';
  entity_id: string;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface LogFilters {
  user_email?: string;
  action_type?: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_type?: 'empresas' | 'solicitantes' | 'motoristas' | 'corridas';
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface LogsContextType {
  logs: SystemLog[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: LogFilters;
  setFilters: (filters: LogFilters) => void;
  fetchLogs: () => Promise<void>;
  clearAllLogs: () => Promise<void>;
  clearLogsByPeriod: (days: number) => Promise<void>;
  logAction: (params: LogActionParams) => Promise<void>;
}

export interface LogActionParams {
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_type: 'empresas' | 'solicitantes' | 'motoristas' | 'corridas';
  entity_id: string;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
}

export interface LogStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byActionType: {
    CREATE: number;
    UPDATE: number;
    DELETE: number;
  };
  byEntityType: {
    empresas: number;
    solicitantes: number;
    motoristas: number;
    corridas: number;
  };
}