
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Corrida, CorridasContextType } from '@/types/corridas';
import { getCorridasByMotorista } from '@/utils/corridaHelpers';
import { useAuthDependentData } from '@/hooks/useAuthDependentData';

const CorridasContext = createContext<CorridasContextType | undefined>(undefined);

export const CorridasProvider = ({ children }: { children: ReactNode }) => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [loading, setLoading] = useState(true);
  const { shouldLoadData, isAuthLoading } = useAuthDependentData();

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
          preenchidoPorMotorista: corrida.preenchido_por_motorista || false,
          preenchidoPorFinanceiro: (corrida as any).preenchido_por_financeiro || false,
          numeroOS: corrida.numero_os || '',
          total: corrida.total || 0,
          localAbastecimento: corrida.local_abastecimento || '',
          destinoExtra: corrida.destino_extra || '',
          passageiros: corrida.passageiros || corrida.passageiro || '',
          documentos: Array.isArray(corrida.corrida_documentos) ? corrida.corrida_documentos : []
        };
      }) || [];

      setCorridas(corridasFormatted);
      // console.log('Corridas carregadas do Supabase:', corridasFormatted.length);
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
  useEffect(() => {
    if (!shouldLoadData) return;
    
    const channel = supabase
      .channel('corridas-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'corridas' },
        () => {
          loadCorridas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shouldLoadData]);

  const addCorrida = async (corridaData: Omit<Corrida, 'id' | 'status'>) => {
    
    try {
      const status = corridaData.motorista ? 'Aguardando OS' : 'Selecionar Motorista';
      
      const insertPayload = {
        empresa: corridaData.empresa,
        empresa_id: corridaData.empresaId,
        centro_custo: corridaData.centroCusto,
        solicitante: corridaData.solicitante,
        origem: corridaData.origem,
        destino: corridaData.destino,
        data: corridaData.dataServico || corridaData.data, // Priorizar dataServico
        data_servico: corridaData.dataServico || corridaData.data, // Salvar no campo correto
        hora_saida: corridaData.horaSaida,
        hora_inicio: corridaData.horaInicio, // Adicionar hora_inicio
        hora_chegada: corridaData.horaChegada,
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
        distanciaPercorrida: 'distancia_percorrida',
        motivoRejeicao: 'motivo_rejeicao',
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
      };

      // Campos que não devem ser enviados para o banco
      const excludedFields = ['documentos', 'solicitanteId'];

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

      // Normalizar datas/horas
      if (payload.data) payload.data = normalizeDate(payload.data);
      if (payload.data_servico) payload.data_servico = normalizeDate(payload.data_servico);
      if (payload.hora_saida) payload.hora_saida = normalizeTime(payload.hora_saida);
      if (payload.hora_chegada) payload.hora_chegada = normalizeTime(payload.hora_chegada);
      if (payload.hora_inicio) payload.hora_inicio = normalizeTime(payload.hora_inicio);

      // Garantir que não haja chave inválida
      delete (payload as any).solicitanteId;

      console.debug('updateCorrida payload:', payload);

      const { error } = await supabase
        .from('corridas')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar corrida no banco:', error);
        toast.error('Erro ao atualizar corrida');
        return;
      }

      // Atualiza estado local após sucesso
      setCorridas(prev => prev.map(c => (c.id === id ? { ...c, ...updatedData } : c)));
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
        hora_inicio: (osData as any).horaInicio ?? null,
        data_servico: (osData as any).dataServico ?? null,
        km_inicial: (osData as any).kmInicial ?? null,
        km_final: (osData as any).kmFinal ?? null,
        km_total: (osData as any).kmTotal ?? null,
        pedagio: (osData as any).pedagio ?? 0,
        estacionamento: (osData as any).estacionamento ?? 0,
        hospedagem: (osData as any).hospedagem ?? 0,
        destino_extra: (osData as any).destinoExtra ?? null,
        numero_os: numeroOSFinal,
        passageiros: (osData as any).passageiros ?? null,
        observacoes_os: (osData as any).observacoes ?? null,
        status: 'Aguardando Conferência',
        preenchido_por_motorista: true,
        updated_at: new Date().toISOString()
      };

      // Normalizar datas/horas
      if (updatePayload.data) updatePayload.data = normalizeDate(updatePayload.data);
      if (updatePayload.data_servico) updatePayload.data_servico = normalizeDate(updatePayload.data_servico);
      if (updatePayload.hora_saida) updatePayload.hora_saida = normalizeTime(updatePayload.hora_saida);
      if (updatePayload.hora_chegada) updatePayload.hora_chegada = normalizeTime(updatePayload.hora_chegada);
      if (updatePayload.hora_inicio) updatePayload.hora_inicio = normalizeTime(updatePayload.hora_inicio);

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
      // console.log('📎 Documentos recebidos para salvar:', documentos);
      
      if (documentos && documentos.length > 0) {
        let documentosSalvos = 0;
        
        for (const documento of documentos) {
          // console.log('📄 Processando documento:', documento.nome, 'Arquivo:', !!documento.arquivo);
          
          if (documento.arquivo) {
            try {
              // Upload do arquivo para o storage
              const sanitizedName = documento.nome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
              const fileName = `${id}_OS_${Date.now()}_${sanitizedName}`;
              
              // console.log('⬆️ Fazendo upload do arquivo:', fileName);
              // console.log('⬆️ Fazendo upload do arquivo:', fileName);
              const { error: uploadError } = await supabase.storage
                .from('corrida-documentos')
                .upload(fileName, documento.arquivo);

              if (uploadError) {
                console.error('❌ Erro ao fazer upload do comprovante:', uploadError);
                toast.error(`Erro ao fazer upload do comprovante ${documento.nome}`);
                continue;
              }

              // ... console.log('✅ Upload realizado com sucesso, salvando registro na tabela...');
              // console.log('✅ Upload realizado com sucesso, salvando registro na tabela...');
              // Salvar registro do documento na tabela
              const { error: docInsertError } = await supabase
                .from('corrida_documentos')
                .insert({
                  corrida_id: id,
                  nome: documento.nome,
                  descricao: documento.descricao || `Comprovante de ${documento.nome}`,
                  url: fileName
                });

              if (docInsertError) {
                console.error('❌ Erro ao salvar registro do comprovante:', docInsertError);
                toast.error(`Erro ao salvar registro do comprovante ${documento.nome}`);
                continue;
              }

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

  return (
    <CorridasContext.Provider value={{
      corridas,
      loading,
      addCorrida,
      updateCorrida,
      fillOS,
      deleteCorrida,
      approveCorrida,
    rejectCorrida,
    updateStatus,
    selectMotorista,
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