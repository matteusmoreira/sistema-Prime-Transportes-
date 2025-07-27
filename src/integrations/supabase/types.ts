export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      alerta_leituras: {
        Row: {
          alerta_id: number | null
          data_leitura: string
          id: number
          motorista_email: string
        }
        Insert: {
          alerta_id?: number | null
          data_leitura?: string
          id?: number
          motorista_email: string
        }
        Update: {
          alerta_id?: number | null
          data_leitura?: string
          id?: number
          motorista_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerta_leituras_alerta_id_fkey"
            columns: ["alerta_id"]
            isOneToOne: false
            referencedRelation: "alertas"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas: {
        Row: {
          ativo: boolean | null
          created_at: string
          criado_por: string
          data_criacao: string
          data_expiracao: string | null
          destinatarios:
            | Database["public"]["Enums"]["alerta_destinatarios"]
            | null
          id: number
          mensagem: string
          motorista_especifico: string | null
          tipo: Database["public"]["Enums"]["alerta_tipo"] | null
          titulo: string
          updated_at: string
          urgente: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          criado_por: string
          data_criacao?: string
          data_expiracao?: string | null
          destinatarios?:
            | Database["public"]["Enums"]["alerta_destinatarios"]
            | null
          id?: number
          mensagem: string
          motorista_especifico?: string | null
          tipo?: Database["public"]["Enums"]["alerta_tipo"] | null
          titulo: string
          updated_at?: string
          urgente?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          criado_por?: string
          data_criacao?: string
          data_expiracao?: string | null
          destinatarios?:
            | Database["public"]["Enums"]["alerta_destinatarios"]
            | null
          id?: number
          mensagem?: string
          motorista_especifico?: string | null
          tipo?: Database["public"]["Enums"]["alerta_tipo"] | null
          titulo?: string
          updated_at?: string
          urgente?: boolean | null
        }
        Relationships: []
      }
      corrida_documentos: {
        Row: {
          corrida_id: number | null
          created_at: string
          descricao: string | null
          id: number
          nome: string
          url: string
        }
        Insert: {
          corrida_id?: number | null
          created_at?: string
          descricao?: string | null
          id?: number
          nome: string
          url: string
        }
        Update: {
          corrida_id?: number | null
          created_at?: string
          descricao?: string | null
          id?: number
          nome?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrida_documentos_corrida_id_fkey"
            columns: ["corrida_id"]
            isOneToOne: false
            referencedRelation: "corridas"
            referencedColumns: ["id"]
          },
        ]
      }
      corridas: {
        Row: {
          centro_custo: string
          combustivel_final: number | null
          combustivel_inicial: number | null
          created_at: string
          data: string
          data_servico: string | null
          destino: string
          destino_extra: string | null
          distancia_percorrida: number | null
          empresa: string
          empresa_id: number | null
          estacionamento: number | null
          hora_chegada: string | null
          hora_inicio: string | null
          hora_saida: string | null
          hospedagem: number | null
          id: number
          km_final: number | null
          km_inicial: number | null
          km_total: number | null
          local_abastecimento: string | null
          motivo: string | null
          motivo_rejeicao: string | null
          motorista: string | null
          motorista_id: number | null
          numero_os: string | null
          observacoes: string | null
          observacoes_os: string | null
          origem: string
          outros: number | null
          passageiro: string
          passageiros: string | null
          pedagio: number | null
          preenchido_por_motorista: boolean | null
          projeto: string | null
          reembolsos: number | null
          solicitante: string
          status: Database["public"]["Enums"]["corrida_status"] | null
          telefone_passageiro: string | null
          tempo_viagem: string | null
          tipo_abrangencia: string | null
          total: number | null
          updated_at: string
          valor: number | null
          valor_combustivel: number | null
          valor_motorista: number | null
          veiculo: string | null
        }
        Insert: {
          centro_custo?: string
          combustivel_final?: number | null
          combustivel_inicial?: number | null
          created_at?: string
          data: string
          data_servico?: string | null
          destino: string
          destino_extra?: string | null
          distancia_percorrida?: number | null
          empresa: string
          empresa_id?: number | null
          estacionamento?: number | null
          hora_chegada?: string | null
          hora_inicio?: string | null
          hora_saida?: string | null
          hospedagem?: number | null
          id?: number
          km_final?: number | null
          km_inicial?: number | null
          km_total?: number | null
          local_abastecimento?: string | null
          motivo?: string | null
          motivo_rejeicao?: string | null
          motorista?: string | null
          motorista_id?: number | null
          numero_os?: string | null
          observacoes?: string | null
          observacoes_os?: string | null
          origem: string
          outros?: number | null
          passageiro: string
          passageiros?: string | null
          pedagio?: number | null
          preenchido_por_motorista?: boolean | null
          projeto?: string | null
          reembolsos?: number | null
          solicitante: string
          status?: Database["public"]["Enums"]["corrida_status"] | null
          telefone_passageiro?: string | null
          tempo_viagem?: string | null
          tipo_abrangencia?: string | null
          total?: number | null
          updated_at?: string
          valor?: number | null
          valor_combustivel?: number | null
          valor_motorista?: number | null
          veiculo?: string | null
        }
        Update: {
          centro_custo?: string
          combustivel_final?: number | null
          combustivel_inicial?: number | null
          created_at?: string
          data?: string
          data_servico?: string | null
          destino?: string
          destino_extra?: string | null
          distancia_percorrida?: number | null
          empresa?: string
          empresa_id?: number | null
          estacionamento?: number | null
          hora_chegada?: string | null
          hora_inicio?: string | null
          hora_saida?: string | null
          hospedagem?: number | null
          id?: number
          km_final?: number | null
          km_inicial?: number | null
          km_total?: number | null
          local_abastecimento?: string | null
          motivo?: string | null
          motivo_rejeicao?: string | null
          motorista?: string | null
          motorista_id?: number | null
          numero_os?: string | null
          observacoes?: string | null
          observacoes_os?: string | null
          origem?: string
          outros?: number | null
          passageiro?: string
          passageiros?: string | null
          pedagio?: number | null
          preenchido_por_motorista?: boolean | null
          projeto?: string | null
          reembolsos?: number | null
          solicitante?: string
          status?: Database["public"]["Enums"]["corrida_status"] | null
          telefone_passageiro?: string | null
          tempo_viagem?: string | null
          tipo_abrangencia?: string | null
          total?: number | null
          updated_at?: string
          valor?: number | null
          valor_combustivel?: number | null
          valor_motorista?: number | null
          veiculo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corridas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corridas_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          contato: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: number
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: number
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: number
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      motorista_documentos: {
        Row: {
          created_at: string
          id: number
          motorista_id: number | null
          nome: string
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: number
          motorista_id?: number | null
          nome: string
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          id?: number
          motorista_id?: number | null
          nome?: string
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "motorista_documentos_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      motorista_fotos: {
        Row: {
          created_at: string
          id: number
          motorista_id: number
          nome: string
          nome_original: string
          tamanho: number | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: number
          motorista_id: number
          nome: string
          nome_original: string
          tamanho?: number | null
          url: string
        }
        Update: {
          created_at?: string
          id?: number
          motorista_id?: number
          nome?: string
          nome_original?: string
          tamanho?: number | null
          url?: string
        }
        Relationships: []
      }
      motoristas: {
        Row: {
          ativo: boolean | null
          categoria_cnh: string | null
          cnh: string | null
          cpf: string | null
          created_at: string
          email: string
          endereco: string | null
          foto_url: string | null
          id: number
          nome: string
          rg: string | null
          status: Database["public"]["Enums"]["motorista_status"]
          telefone: string | null
          updated_at: string
          user_id: string | null
          validade_cnh: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_cnh?: string | null
          cnh?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          endereco?: string | null
          foto_url?: string | null
          id?: number
          nome: string
          rg?: string | null
          status?: Database["public"]["Enums"]["motorista_status"]
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          validade_cnh?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_cnh?: string | null
          cnh?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          endereco?: string | null
          foto_url?: string | null
          id?: number
          nome?: string
          rg?: string | null
          status?: Database["public"]["Enums"]["motorista_status"]
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          validade_cnh?: string | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          corrida_id: number | null
          created_at: string
          data_hora: string
          descricao: string
          destinatarios: string[]
          id: string
          lida: boolean | null
          motorista_email: string | null
          motorista_name: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          corrida_id?: number | null
          created_at?: string
          data_hora?: string
          descricao: string
          destinatarios?: string[]
          id?: string
          lida?: boolean | null
          motorista_email?: string | null
          motorista_name?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          corrida_id?: number | null
          created_at?: string
          data_hora?: string
          descricao?: string
          destinatarios?: string[]
          id?: string
          lida?: boolean | null
          motorista_email?: string | null
          motorista_name?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_corrida_id_fkey"
            columns: ["corrida_id"]
            isOneToOne: false
            referencedRelation: "corridas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome: string
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      solicitantes: {
        Row: {
          created_at: string
          email: string
          empresa_id: number | null
          id: number
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          empresa_id?: number | null
          id?: number
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          empresa_id?: number | null
          id?: number
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitantes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      alerta_destinatarios: "todos" | "motoristas" | "especifico"
      alerta_tipo: "info" | "warning" | "error" | "success"
      corrida_status:
        | "Pendente"
        | "Confirmada"
        | "Em Andamento"
        | "Concluída"
        | "Cancelada"
        | "Aguardando OS"
        | "OS Preenchida"
        | "Aprovada"
        | "Rejeitada"
        | "Aguardando Conferência"
        | "Em Análise"
        | "No Show"
        | "Revisar"
        | "Selecionar Motorista"
      motorista_status: "Pendente" | "Aprovado" | "Reprovado"
      user_role: "Administrador" | "Administração" | "Financeiro" | "Motorista"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alerta_destinatarios: ["todos", "motoristas", "especifico"],
      alerta_tipo: ["info", "warning", "error", "success"],
      corrida_status: [
        "Pendente",
        "Confirmada",
        "Em Andamento",
        "Concluída",
        "Cancelada",
        "Aguardando OS",
        "OS Preenchida",
        "Aprovada",
        "Rejeitada",
        "Aguardando Conferência",
        "Em Análise",
        "No Show",
        "Revisar",
        "Selecionar Motorista",
      ],
      motorista_status: ["Pendente", "Aprovado", "Reprovado"],
      user_role: ["Administrador", "Administração", "Financeiro", "Motorista"],
    },
  },
} as const
