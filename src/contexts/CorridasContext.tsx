
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Corrida, CorridasContextType } from '@/types/corridas';
import { getCorridasByMotorista } from '@/utils/corridaHelpers';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';
// import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

const CorridasContext = createContext<CorridasContextType | undefined>(undefined);

export const CorridasProvider = ({ children }: { children: ReactNode }) => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [previousCorridasCount, setPreviousCorridasCount] = useState<number>(0);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const { shouldLoadData, isAuthLoading } = useAuthDependentData();
  // const { user } = useAuth();
  const { isMotorista } = useUserRole();

  // Carregar corridas do Supabase com documentos
  const loadCorridas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('corridas')
        .select(`
          *,
          corrida_documentos (
            id,
            nome,
            descricao,
            url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar corridas:', error);
        toast.error('Erro ao carregar corridas');
        return;
      }

      const corridasFormatted = data?.map(corrida => {
        // Determinar status baseado na presença do motorista
        let status = corrida.status as Corrida['status'];
        if (status === 'Pendente') {
          status = corrida.motorista ? 'Aguardando OS' : 'Selecionar Motorista';
        }

        return {
          id: corrida.id,
          empresa: corrida.empresa || '',
          empresaId: corrida.empresa_id || 0,
          centroCusto: corrida.centro_custo || '',
          solicitante: corrida.solicitante || '',
          origem: corrida.origem || '',
          destino: corrida.destino || '',
          data: corrida.data || '',
          horaSaida: corrida.hora_saida || '',
          horaChegada: corrida.hora_chegada || '',
          observacoes: corrida.observacoes || '',
          status,
          motorista: corrida.motorista || '',
          kmInicial: corrida.km_inicial || 0,
          kmFinal: corrida.km_final || 0,
          kmTotal: corrida.km_total || 0,
          combustivelInicial: corrida.combustivel_inicial || 0,
          combustivelFinal: corrida.combustivel_final || 0,
          valorCombustivel: corrida.valor_combustivel || 0,
          pedagio: corrida.pedagio || 0,
          estacionamento: corrida.estacionamento || 0,
          hospedagem: corrida.hospedagem || 0,
          outros: corrida.outros || 0,
          valor: corrida.valor || 0,
          valorMotorista: corrida.valor_motorista || 0,
          horaInicio: corrida.hora_inicio || '',
          horaOS: corrida.hora_os || '',
          horaEspera: corrida.hora_espera || '',
          valorHoraEspera: corrida.valor_hora_espera || 0,
          cteNf: corrida.cte_nf || '',
          dataServico: corrida.data_servico || '',
          distanciaPercorrida: corrida.distancia_percorrida || 0,
          reembolsos: corrida.reembolsos || 0,
          veiculo: corrida.veiculo || '',
          projeto: corrida.projeto || '',
          motivo: corrida.motivo || '',
          motivoRejeicao: corrida.motivo_rejeicao || '',
          tipoAbrangencia: corrida.tipo_abrangencia || '',
          tempoViagem: corrida.tempo_viagem || '',
          observacoesOS: corrida.observacoes_os || '',
          statusPagamento: (corrida.status_pagamento as Corrida['statusPagamento']) || 'Pendente',
          medicaoNotaFiscal: (corrida.medicao_nota_fiscal as Corrida['medicaoNotaFiscal']) || 'Medição',
          preenchidoPorMotorista: (corrida.preenchido_por_motorista === true || corrida.preenchido_por_motorista === 'true' || corrida.preenchido_por_motorista === 't' || corrida.preenchido_por_motorista === 1 || corrida.preenchido_por_motorista === '1'),
          preenchidoPorFinanceiro: ((corrida as any).preenchido_por_financeiro === true || (corrida as any).preenchido_por_financeiro === 'true' || (corrida as any).preenchido_por_financeiro === 't' || (corrida as any).preenchido_por_financeiro === 1 || (corrida as any).preenchido_por_financeiro === '1'),
          numeroOS: corrida.numero_os || '',
          total: corrida.total || 0,
          localAbastecimento: corrida.local_abastecimento || '',
          destinoExtra: corrida.destino_extra || '',
          passageiros: corrida.passageiros || corrida.passageiro || '',
          documentos: Array.isArray(corrida.corrida_documentos) ? corrida.corrida_documentos : []
        };
      }) || [];

      // Detectar novas corridas para motoristas
      if (isMotorista && previousCorridasCount > 0) {
        const corridasDisponiveis = corridasFormatted.filter(corrida => 
          corrida.status === 'Pendente' && !corrida.motorista
        );
        const corridasDisponiveisAntes = corridas.filter(corrida => 
          corrida.status === 'Pendente' && !corrida.motorista
        );
        
        const novasCorridasDisponiveis = corridasDisponiveis.length - corridasDisponiveisAntes.length;
        
        if (novasCorridasDisponiveis > 0) {
          toast.success(
            `${novasCorridasDisponiveis} nova${novasCorridasDisponiveis > 1 ? 's' : ''} corrida${novasCorridasDisponiveis > 1 ? 's' : ''} disponível${novasCorridasDisponiveis > 1 ? 'eis' : ''}!`,
            {
              description: 'Verifique as corridas pendentes para aceitar.',
              duration: 5000,
            }
          );
        }
      }

      setCorridas(corridasFormatted);
      setPreviousCorridasCount(corridasFormatted.length);
      setLastUpdated(new Date());
      // console.log('Corridas carregadas:', corridasFormatted.length);
    } catch (error) {
      console.error('Erro ao carregar corridas:', error);
      toast.error('Erro ao carregar corridas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoadData) {
      loadCorridas();
    } else if (!isAuthLoading) {
      setLoading(false);
    }
  }, [shouldLoadData, isAuthLoading]);

  // Realtime: Atualiza corridas quando houver mudanças no banco
  // Sistema de realtime melhorado com reconexão automática
  const setupRealtimeConnection = () => {
    if (!shouldLoadData) return;

    // Limpar conexão anterior se existir
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    const channel = supabase
      .channel('corridas-changes', {
        config: {
          presence: {
            key: 'corridas-listener'
          }
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'corridas' },
        (payload) => {
          if (import.meta.env?.DEV) console.debug('Realtime event received:', payload);
          loadCorridas();
        }
      )
      .subscribe((status) => {
        if (import.meta.env?.DEV) console.debug('Realtime connection status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
          setConnectionRetries(0);
          if (import.meta.env?.DEV) console.debug('Realtime connected successfully');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsRealtimeConnected(false);
          if (import.meta.env?.DEV) console.debug('Realtime connection failed, attempting reconnection...');
          
          // Tentar reconectar após um delay
          setTimeout(() => {
            if (connectionRetries < 5) {
              setConnectionRetries(prev => prev + 1);
              setupRealtimeConnection();
            } else {
              if (import.meta.env?.DEV) console.debug('Max reconnection attempts reached');
              toast.error('Conexão em tempo real perdida. Usando atualização automática.');
            }
          }, Math.min(1000 * Math.pow(2, connectionRetries), 30000)); // Backoff exponencial
        } else if (status === 'CLOSED') {
          setIsRealtimeConnected(false);
          if (import.meta.env?.DEV) console.debug('Realtime connection closed');
         }
       });

    setRealtimeChannel(channel);
  };

  useEffect(() => {
    setupRealtimeConnection();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [shouldLoadData]);

  // Monitorar status da conexão e tentar reconectar se necessário
  useEffect(() => {
    if (!shouldLoadData) return;

    const connectionCheckInterval = setInterval(() => {
      if (!isRealtimeConnected && connectionRetries < 5) {
        if (import.meta.env?.DEV) console.debug('Checking realtime connection...');
        setupRealtimeConnection();
      }
    }, 60000); // Verificar a cada minuto

    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, [shouldLoadData, isRealtimeConnected, connectionRetries]);

  // Polling automático para motoristas (atualiza a cada 30 segundos)
  useEffect(() => {
    if (!shouldLoadData || !isMotorista) return;
    
    const pollingInterval = setInterval(() => {
      // Só faz polling se a aba estiver visível
      if (!document.hidden) {
        loadCorridas();
      }
    }, 30000); // 30 segundos

    return () => {
      clearInterval(pollingInterval);
    };
  }, [shouldLoadData, isMotorista]);

  // Recarregar dados quando a aba volta ao foco (para motoristas)
  useEffect(() => {
    if (!shouldLoadData || !isMotorista) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCorridas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldLoadData, isMotorista]);

  const addCorrida = async (corridaData: Omit<Corrida, 'id' | 'status'>) => {
    
    try {
      const status = corridaData.motorista ? 'Aguardando OS' : 'Selecionar Motorista';
      
      // Helpers para normalização de formatos (evitar enviar string vazia para colunas TIME/DATE)
      const normalizeDate = (value: any) => {
        if (!value) return null;
        if (value instanceof Date) {
          const y = value.getFullYear();
          const m = String(value.getMonth() + 1).padStart(2, '0');
          const d = String(value.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (!trimmed) return null;
          const ddmmyyyy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
          return trimmed.split('T')[0];
        }
        return null;
      };
      const normalizeTime = (value: any) => {
        if (!value) return null;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (!trimmed) return null;
          const hhmm = trimmed.match(/^(\d{2}):(\d{2})/);
          if (hhmm) return `${hhmm[1]}:${hhmm[2]}`;
        }
        return null;
      };
      
      const insertPayload = {
        empresa: corridaData.empresa,
        empresa_id: corridaData.empresaId,
        centro_custo: corridaData.centroCusto,
        solicitante: corridaData.solicitante,
        origem: corridaData.origem,
        destino: corridaData.destino,
        data: normalizeDate(corridaData.dataServico || (corridaData as any).data), // Priorizar dataServico
        data_servico: normalizeDate(corridaData.dataServico || (corridaData as any).data), // Salvar no campo correto
        hora_saida: normalizeTime(corridaData.horaSaida),
        hora_inicio: normalizeTime(corridaData.horaInicio), // Adicionar hora_inicio
        hora_chegada: normalizeTime((corridaData as any).horaChegada),
        tipo_abrangencia: corridaData.tipoAbrangencia, // Adicionar tipo_abrangencia
        observacoes: corridaData.observacoes,
        status: status as any,
        motorista: corridaData.motorista,
        veiculo: corridaData.veiculo,
        projeto: corridaData.projeto,
        motivo: corridaData.motivo,
        valor: corridaData.valor,
        valor_motorista: corridaData.valorMotorista,
        total: corridaData.total,
        passageiro: corridaData.passageiros || '',
        passageiros: corridaData.passageiros || '',
        numero_os: corridaData.numeroOS || '', // Adicionar numeroOS
        destino_extra: corridaData.destinoExtra || '', // Adicionar destinoExtra
        preenchido_por_financeiro: false, // Inicializar como false
      };

      // console.log('=== PAYLOAD PARA INSERT ===');
      // console.log('Payload completo:', insertPayload);
      // console.log('Campo veiculo no payload:', insertPayload.veiculo);
      // console.log('=== FIM PAYLOAD ===');
      
      const { data, error } = await supabase
        .from('corridas')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar corrida:', error);
        toast.error('Erro ao adicionar corrida');
        return;
      }

      // Salvar documentos se existirem
      if (corridaData.documentos && corridaData.documentos.length > 0) {
        for (const documento of corridaData.documentos) {
          if (documento.arquivo) {
            try {
              // Upload do arquivo para o storage
              const fileName = `${data.id}_${Date.now()}_${documento.nome}`;
              const { error: uploadError } = await supabase.storage
                .from('corrida-documentos')
                .upload(fileName, documento.arquivo);

              if (uploadError) {
                console.error('Erro ao fazer upload do documento:', uploadError);
                continue;
              }

              // Salvar registro do documento na tabela com a URL do arquivo no storage
              const { error: docInsertError } = await supabase
                .from('corrida_documentos')
                .insert({
                  corrida_id: data.id,
                  nome: documento.nome,
                  descricao: documento.descricao,
                  url: fileName // Store the file path instead of public URL
                });

              if (docInsertError) {
                console.error('Erro ao inserir documento na tabela:', docInsertError);
              } else {
                // console.log('Documento salvo com sucesso:', documento.nome);
                // console.log('Documento salvo com sucesso:', documento.nome);
              }
            } catch (docError) {
              console.error('Erro ao salvar documento:', docError);
            }
          }
        }
      }

      // Após inserir, recarregar lista para evitar duplicações por estado local + realtime
      await loadCorridas();
      toast.success('Corrida cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar corrida:', error);
      toast.error('Erro ao adicionar corrida');
    }
  };

  const updateCorrida = async (id: number, updatedData: Partial<Corrida>) => {
    try {
      // Helpers para normalização de formatos
      const normalizeDate = (value: any) => {
        if (!value) return null;
        if (value instanceof Date) {
          const y = value.getFullYear();
          const m = String(value.getMonth() + 1).padStart(2, '0');
          const d = String(value.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        if (typeof value === 'string') {
          const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
          return value.split('T')[0];
        }
        return null;
      };
      const normalizeTime = (value: any) => {
        if (!value) return null;
        if (typeof value === 'string') {
          const hhmm = value.match(/^(\d{2}):(\d{2})/);
          if (hhmm) return `${hhmm[1]}:${hhmm[2]}`;
        }
        return null;
      };

      // Mapear campos do app -> colunas do banco
      const map: Record<string, string> = {
        empresaId: 'empresa_id',
        centroCusto: 'centro_custo',
        horaSaida: 'hora_saida',
        horaChegada: 'hora_chegada',
        valorMotorista: 'valor_motorista',
        dataServico: 'data_servico',
        horaInicio: 'hora_inicio',
        horaOS: 'hora_os',
        horaEspera: 'hora_espera',
        distanciaPercorrida: 'distancia_percorrida',
        motivoRejeicao: 'motivo_rejeicao',
        // Corrige chave usada no financeiro
        motivoReprovacao: 'motivo_rejeicao',
        // Campo de UI mapeado para a coluna existente
        horaFim: 'hora_chegada',
        tipoAbrangencia: 'tipo_abrangencia',
        tempoViagem: 'tempo_viagem',
        observacoesOS: 'observacoes_os',
        preenchidoPorMotorista: 'preenchido_por_motorista',
        numeroOS: 'numero_os',
        kmInicial: 'km_inicial',
        kmFinal: 'km_final',
        kmTotal: 'km_total',
        combustivelInicial: 'combustivel_inicial',
        combustivelFinal: 'combustivel_final',
        valorCombustivel: 'valor_combustivel',
        localAbastecimento: 'local_abastecimento',
        destinoExtra: 'destino_extra',
        statusPagamento: 'status_pagamento',
        medicaoNotaFiscal: 'medicao_nota_fiscal',
        preenchidoPorFinanceiro: 'preenchido_por_financeiro',
        dataEdicaoFinanceiro: 'data_edicao_financeiro',
        usuarioEdicaoFinanceiro: 'usuario_edicao_financeiro',
        valorHoraEspera: 'valor_hora_espera',
        cteNf: 'cte_nf',
      };

      // Campos que não devem ser enviados para o banco
      const excludedFields = ['documentos', 'solicitanteId', 'dataConferencia', 'conferenciadoPor'];

      const payload: Record<string, any> = { updated_at: new Date().toISOString() };
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value === undefined || excludedFields.includes(key)) return;
        const dbKey = map[key] ?? key;
        payload[dbKey] = value as any;
      });

      // Handle passageiros field - map to both passageiro (required) and passageiros (optional)
      if (updatedData.passageiros !== undefined) {
        payload.passageiro = updatedData.passageiros || '';
        payload.passageiros = updatedData.passageiros || '';
      }

      // Normalizar datas/horas (converter '' para null também)
      if ('data' in payload) payload.data = normalizeDate(payload.data);
      if ('data_servico' in payload) payload.data_servico = normalizeDate(payload.data_servico);
      if ('hora_saida' in payload) payload.hora_saida = normalizeTime(payload.hora_saida);
      if ('hora_chegada' in payload) payload.hora_chegada = normalizeTime(payload.hora_chegada);
      if ('hora_inicio' in payload) payload.hora_inicio = normalizeTime(payload.hora_inicio);
      if ('hora_os' in payload) payload.hora_os = normalizeTime(payload.hora_os);
      if ('hora_espera' in payload) payload.hora_espera = normalizeTime(payload.hora_espera);

      // Validar e converter tipos de dados numéricos
      const numericFields = [
        'km_inicial', 'km_final', 'km_total', 'combustivel_inicial', 'combustivel_final',
        'pedagio', 'estacionamento', 'hospedagem', 'outros', 'total', 'valor', 'valor_motorista',
        'distancia_percorrida', 'reembolsos', 'valor_combustivel', 'valor_hora_espera'
      ];

      numericFields.forEach(field => {
        if (field in payload) {
          const value = payload[field];
          if (value === '' || value === null || value === undefined) {
            payload[field] = null;
          } else if (typeof value === 'string') {
            const numValue = parseFloat(value.replace(',', '.'));
            payload[field] = isNaN(numValue) ? null : numValue;
          } else if (typeof value === 'number') {
            payload[field] = isNaN(value) ? null : value;
          }
        }
      });

      // Validar campos de texto (garantir que não sejam undefined)
      const textFields = [
        'solicitante', 'empresa', 'passageiro', 'origem', 'destino', 'observacoes',
        'motorista', 'veiculo', 'motivo_rejeicao', 'tipo_abrangencia', 'tempo_viagem',
        'observacoes_os', 'local_abastecimento', 'centro_custo', 'destino_extra',
        'numero_os', 'passageiros', 'projeto', 'motivo', 'telefone_passageiro',
        'status_pagamento', 'medicao_nota_fiscal', 'usuario_edicao_financeiro', 'cte_nf'
      ];

      textFields.forEach(field => {
        if (field in payload) {
          const value = payload[field];
          if (value === undefined) {
            payload[field] = null;
          } else if (typeof value === 'string') {
            payload[field] = value.trim() || null;
          }
        }
      });
      
      // Remover campos duplicados que já foram mapeados
      delete payload.valorHoraEspera;
      delete payload.cteNf;

      // Garantir que não haja chave inválida
      delete (payload as any).solicitanteId;

      // Regras de transição automática de status ao alterar motorista
      // Caso comum reportado: corrida criada sem motorista e, ao adicionar motorista via edição,
      // o status deve mudar de "Selecionar Motorista" para "Aguardando OS" automaticamente.
      const corridaAtual = corridas.find(c => c.id === id);
      let statusAjustado: Corrida['status'] | undefined;
      const motoristaAlterado = Object.prototype.hasOwnProperty.call(updatedData, 'motorista');

      if (motoristaAlterado && corridaAtual) {
        const novoMotorista = (updatedData.motorista ?? '').toString().trim();
        const tinhaMotoristaAntes = !!(corridaAtual.motorista && corridaAtual.motorista.trim());

        // Apenas ajustar automaticamente em estados iniciais do fluxo
        const podeAjustarStatus = ['Selecionar Motorista', 'Pendente', 'Aguardando OS'].includes(corridaAtual.status);

        if (podeAjustarStatus) {
          if (!tinhaMotoristaAntes && novoMotorista) {
            // Foi atribuído um motorista: avançar para "Aguardando OS"
            statusAjustado = 'Aguardando OS';
          } else if (tinhaMotoristaAntes && !novoMotorista) {
            // Motorista removido: voltar para "Selecionar Motorista"
            statusAjustado = 'Selecionar Motorista';
          }
        }
      }

      // Não sobrescrever se o usuário já definiu explicitamente um status na edição
      if (statusAjustado && !Object.prototype.hasOwnProperty.call(updatedData, 'status')) {
        payload.status = statusAjustado;
      }

      // Validar campos existentes na tabela
      const validColumns = [
        'id', 'solicitante', 'empresa', 'empresa_id', 'passageiro', 'telefone_passageiro',
        'origem', 'destino', 'data', 'hora_saida', 'hora_chegada', 'observacoes', 'status',
        'motorista', 'motorista_id', 'veiculo', 'km_inicial', 'km_final', 'km_total',
        'combustivel_inicial', 'combustivel_final', 'pedagio', 'estacionamento', 'hospedagem',
        'outros', 'total', 'valor', 'valor_motorista', 'motivo_rejeicao', 'hora_inicio',
        'tipo_abrangencia', 'data_servico', 'distancia_percorrida', 'tempo_viagem',
        'observacoes_os', 'reembolsos', 'valor_combustivel', 'local_abastecimento',
        'centro_custo', 'destino_extra', 'numero_os', 'passageiros', 'projeto', 'motivo',
        'preenchido_por_motorista', 'created_at', 'updated_at', 'status_pagamento',
        'medicao_nota_fiscal', 'preenchido_por_financeiro', 'data_edicao_financeiro',
        'usuario_edicao_financeiro', 'valor_hora_espera', 'cte_nf'
      ];

      // Remover campos inválidos do payload
      const invalidFields = Object.keys(payload).filter(key => !validColumns.includes(key));
      if (invalidFields.length > 0) {
        console.warn('Campos inválidos removidos do payload:', invalidFields);
        invalidFields.forEach(field => delete payload[field]);
      }

      console.debug('updateCorrida payload:', JSON.stringify(payload, null, 2));
      console.debug('Campos obrigatórios verificados:', {
        solicitante: payload.solicitante,
        empresa: payload.empresa,
        passageiro: payload.passageiro,
        origem: payload.origem,
        destino: payload.destino,
        data: payload.data,
        centro_custo: payload.centro_custo
      });

      const { error } = await supabase
        .from('corridas')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('Erro detalhado do Supabase:', JSON.stringify({
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }, null, 2));
        console.error('Payload que causou erro:', JSON.stringify(payload, null, 2));
        toast.error(`Erro ao atualizar corrida: ${error.message}`);
        return;
      }

      // Atualiza estado local após sucesso (incluindo possível ajuste automático de status)
      setCorridas(prev => prev.map(c => (
        c.id === id
          ? {
              ...c,
              ...updatedData,
              status: (statusAjustado && !Object.prototype.hasOwnProperty.call(updatedData, 'status'))
                ? statusAjustado
                : (updatedData.status ?? c.status),
            }
          : c
      )));
      toast.success('Corrida atualizada com sucesso!');
    } catch (err) {
      console.error('Falha ao atualizar corrida:', err);
      toast.error('Erro ao atualizar corrida');
    }
  };

  const fillOS = async (id: number, osData: Partial<Corrida>) => {
    try {
      // console.log('Preenchendo OS - ID:', id, 'Dados:', osData);
      const normalizeDate = (value: any) => {
        if (!value) return null;
        if (value instanceof Date) {
          const y = value.getFullYear();
          const m = String(value.getMonth() + 1).padStart(2, '0');
          const d = String(value.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        if (typeof value === 'string') {
          const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
          return value.split('T')[0];
        }
        return null;
      };
      const normalizeTime = (value: any) => {
        if (!value) return null;
        if (typeof value === 'string') {
          const hhmm = value.match(/^(\d{2}):(\d{2})/);
          if (hhmm) return `${hhmm[1]}:${hhmm[2]}`;
        }
        return null;
      };

      // Gerar número da OS automaticamente (5 dígitos) se não vier do formulário
      let numeroOSFinal = (osData as any).numeroOS as string | undefined;
      if (!numeroOSFinal || String(numeroOSFinal).trim() === '') {
        const existingNumbers = corridas
          .map(c => parseInt((c.numeroOS || '').toString(), 10))
          .filter(n => !isNaN(n));
        const next = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        numeroOSFinal = String(next).padStart(5, '0');
      }
      
      // Atualizar no Supabase com mapeamento correto de colunas
      const updatePayload: any = {
        hora_saida: (osData as any).horaSaida ?? (osData as any).horaInicio ?? null,
        hora_chegada: (osData as any).horaChegada ?? null,
        data: (osData as any).data ?? (osData as any).dataServico ?? null,
        // hora_inicio removido para preservar valor definido pelo administrador
        data_servico: (osData as any).dataServico ?? null,
        km_inicial: (osData as any).kmInicial ?? null,
        km_final: (osData as any).kmFinal ?? null,
        km_total: (osData as any).kmTotal ?? null,
        pedagio: (osData as any).pedagio ?? 0,
        estacionamento: (osData as any).estacionamento ?? 0,
        hospedagem: (osData as any).hospedagem ?? 0,
        destino_extra: (osData as any).destinoExtra ?? null,
        // Persistir campos que o motorista pode editar na OS
        origem: (osData as any).origem ?? null,
        destino: (osData as any).destino ?? null,
        centro_custo: (osData as any).centroCusto ?? null,
        numero_os: numeroOSFinal,
        passageiros: (osData as any).passageiros ?? null,
        observacoes_os: (osData as any).observacoes ?? null,
        status: 'Aguardando Conferência',
        preenchido_por_motorista: true,
        updated_at: new Date().toISOString()
      };

      // Normalizar datas/horas (converter '' para null também)
      if ('data' in updatePayload) updatePayload.data = normalizeDate(updatePayload.data);
      if ('data_servico' in updatePayload) updatePayload.data_servico = normalizeDate(updatePayload.data_servico);
      if ('hora_saida' in updatePayload) updatePayload.hora_saida = normalizeTime(updatePayload.hora_saida);
      if ('hora_chegada' in updatePayload) updatePayload.hora_chegada = normalizeTime(updatePayload.hora_chegada);
      // Removido normalize de hora_inicio pois não atualizamos esse campo aqui

      console.debug('fillOS payload:', updatePayload);

      const { error } = await supabase
        .from('corridas')
        .update(updatePayload)
        .eq('id', id);

      if (error) {
        console.error('Erro ao preencher OS:', error);
        toast.error('Erro ao preencher ordem de serviço');
        return;
      }

      // Salvar documentos/comprovantes se existirem
      const documentos = (osData as any).documentos;
      console.log('📎 Documentos recebidos para salvar:', documentos);
      
      if (documentos && documentos.length > 0) {
        let documentosSalvos = 0;
        
        for (const documento of documentos) {
          console.log('📄 Processando documento:', documento.nome, 'Arquivo:', !!documento.arquivo);
          console.log('📄 Tipo do arquivo:', documento.arquivo?.constructor?.name);
          console.log('📄 Tamanho do arquivo:', documento.arquivo?.size);
          
          if (documento.arquivo) {
            try {
              // Upload do arquivo para o storage
              const sanitizedName = documento.nome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
              const fileName = `${id}_OS_${Date.now()}_${sanitizedName}`;
              
              console.log('⬆️ Fazendo upload do arquivo:', fileName);
              console.log('⬆️ Bucket: corrida-documentos');
              console.log('⬆️ Arquivo:', documento.arquivo);
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('corrida-documentos')
                .upload(fileName, documento.arquivo);

              if (uploadError) {
                console.error('❌ Erro ao fazer upload do comprovante:', uploadError);
                console.error('❌ Detalhes do erro:', JSON.stringify(uploadError, null, 2));
                toast.error(`Erro ao fazer upload do comprovante ${documento.nome}: ${uploadError.message}`);
                continue;
              }
              
              console.log('✅ Upload realizado com sucesso:', uploadData);
              console.log('💾 Salvando registro na tabela corrida_documentos...');
              
              // Salvar registro do documento na tabela
              const documentoData = {
                corrida_id: id,
                nome: documento.nome,
                descricao: documento.descricao || `Comprovante de ${documento.nome}`,
                url: fileName
              };
              
              console.log('💾 Dados do documento para inserir:', documentoData);
              
              const { data: dbData, error: docInsertError } = await supabase
                .from('corrida_documentos')
                .insert(documentoData)
                .select();

              if (docInsertError) {
                console.error('❌ Erro ao salvar registro do comprovante:', docInsertError);
                console.error('❌ Detalhes do erro DB:', JSON.stringify(docInsertError, null, 2));
                toast.error(`Erro ao salvar registro do comprovante ${documento.nome}: ${docInsertError.message}`);
                continue;
              }
              
              console.log('✅ Documento salvo no banco com sucesso:', dbData);

              documentosSalvos++;
              // console.log('✅ Comprovante salvo com sucesso:', documento.nome);
              
            } catch (docError) {
              console.error('❌ Erro ao processar comprovante:', documento.nome, docError);
              toast.error(`Erro ao processar comprovante ${documento.nome}`);
            }
          } else {
            // console.log('⚠️ Documento sem arquivo:', documento.nome);
          }
        }
        
        if (documentosSalvos > 0) {
          toast.success(`${documentosSalvos} comprovante(s) salvo(s) com sucesso!`);
        }
      } else {
        // console.log('ℹ️ Nenhum documento para salvar');
      }

      // Atualizar estado local apenas após sucesso no banco
      setCorridas(prev => prev.map(c => 
        c.id === id ? { 
          ...c, 
          ...osData, 
          numeroOS: numeroOSFinal,
          status: 'Aguardando Conferência' as const, 
          preenchidoPorMotorista: true 
        } : c
      ));
      
      toast.success('Ordem de Serviço preenchida com sucesso!');
      // console.log('OS preenchida com sucesso para corrida:', id);
    } catch (error) {
      console.error('Erro ao preencher OS:', error);
      toast.error('Erro ao preencher ordem de serviço');
    }
  };

  const deleteCorrida = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta corrida?')) {
      try {
        // console.log('Excluindo corrida:', id);
        
        // Primeiro, excluir documentos relacionados
        const { error: docsError } = await supabase
          .from('corrida_documentos')
          .delete()
          .eq('corrida_id', id);
        
        if (docsError) {
          console.error('Erro ao excluir documentos da corrida:', docsError);
          // Continua mesmo com erro nos documentos
        }
        
        // Depois, excluir a corrida
        const { error } = await supabase
          .from('corridas')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao excluir corrida:', error);
          toast.error('Erro ao excluir corrida');
          return;
        }
        
        // Atualizar estado local apenas após sucesso na exclusão do banco
        setCorridas(prev => prev.filter(c => c.id !== id));
        toast.success('Corrida excluída com sucesso!');
        // console.log('Corrida excluída com sucesso:', id);
      } catch (error) {
        console.error('Erro ao excluir corrida:', error);
        toast.error('Erro ao excluir corrida');
      }
    }
  };

  const approveCorrida = async (id: number) => {
    try {
      const { error } = await supabase
        .from('corridas')
        .update({ status: 'Aprovada', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao aprovar corrida:', error);
        toast.error('Erro ao aprovar corrida');
        return;
      }

      setCorridas(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'Aprovada' as const } : c
      ));
      toast.success('Corrida aprovada com sucesso!');
    } catch (err) {
      console.error('Falha ao aprovar corrida:', err);
      toast.error('Erro ao aprovar corrida');
    }
  };

  const rejectCorrida = async (id: number, motivo: string) => {
    try {
      const { error } = await supabase
        .from('corridas')
        .update({ status: 'Rejeitada', motivo_rejeicao: motivo, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao rejeitar corrida:', error);
        toast.error('Erro ao rejeitar corrida');
        return;
      }

      setCorridas(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'Rejeitada' as const, motivoRejeicao: motivo } : c
      ));
      toast.error('Corrida rejeitada!');
    } catch (err) {
      console.error('Falha ao rejeitar corrida:', err);
      toast.error('Erro ao rejeitar corrida');
    }
  };

  const updateStatus = async (id: number, status: Corrida['status']) => {
    try {
      const { error } = await supabase
        .from('corridas')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status');
        return;
      }

      setCorridas(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
      toast.success('Status atualizado com sucesso!');
    } catch (err) {
      console.error('Falha ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  const selectMotorista = async (corridaId: number, motoristaName: string, veiculo?: string) => {
    try {
      const { error } = await supabase
        .from('corridas')
        .update({ 
          motorista: motoristaName,
          veiculo: veiculo || null,
          status: 'Aguardando OS'
        })
        .eq('id', corridaId);

      if (error) {
        console.error('Erro ao selecionar motorista:', error);
        toast.error('Erro ao selecionar motorista');
        return;
      }

      setCorridas(prev => prev.map(c => 
        c.id === corridaId ? { 
          ...c, 
          motorista: motoristaName,
          veiculo: veiculo || c.veiculo,
          status: 'Aguardando OS' as const
        } : c
      ));
      toast.success('Motorista selecionado com sucesso!');
    } catch (error) {
      console.error('Erro ao selecionar motorista:', error);
      toast.error('Erro ao selecionar motorista');
    }
  };

  // Função para refresh manual
  const refreshCorridas = async () => {
    if (!shouldLoadData) return;
    await loadCorridas();
    toast.success('Corridas atualizadas!');
  };

  return (
    <CorridasContext.Provider value={{
      corridas,
      loading,
      lastUpdated,
      isRealtimeConnected,
      addCorrida,
      updateCorrida,
      fillOS,
      deleteCorrida,
      approveCorrida,
      rejectCorrida,
      updateStatus,
      selectMotorista,
      loadCorridas,
      refreshCorridas,
      getCorridasByMotorista: (motoristaEmail: string, motoristas: any[]) => getCorridasByMotorista(corridas, motoristaEmail, motoristas)
    }}>
      {children}
    </CorridasContext.Provider>
  );
};

export const useCorridas = () => {
  const context = useContext(CorridasContext);
  if (context === undefined) {
    throw new Error('useCorridas must be used within a CorridasProvider');
  }
  return context;
};