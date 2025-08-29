import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Building, Hotel } from 'lucide-react';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';
import { useCorridaDocuments } from '@/hooks/useCorridaDocuments';
import { DocumentViewer } from '@/components/corridas/DocumentViewer';
import { formatCurrency } from '@/utils/format';

interface CorridaViewDialogProps {
  corrida: CorridaFinanceiro | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentsUpdateTrigger?: number;
}

export const CorridaViewDialog = ({ corrida, isOpen, onOpenChange, documentsUpdateTrigger }: CorridaViewDialogProps) => {
  const [corridaAtual, setCorridaAtual] = React.useState<CorridaFinanceiro | null>(null);
  const { documentos, loading, downloadDocumento, forceReload } = useCorridaDocuments(
    isOpen ? corrida?.id || null : null
  );

  // Buscar dados frescos do banco quando o dialog abrir
  React.useEffect(() => {
    if (isOpen && corrida?.id) {
      // console.log('🔄 Dialog aberto, buscando dados frescos da corrida:', corrida.id);
      buscarDadosFrescos(corrida.id);
    }
  }, [isOpen, corrida?.id]);

  // Forçar reload quando documentsUpdateTrigger mudar
  React.useEffect(() => {
    if (documentsUpdateTrigger && documentsUpdateTrigger > 0) {
      // console.log('🔄 Trigger de atualização de documentos detectado:', documentsUpdateTrigger);
      forceReload();
      
      // Também recarregar dados da corrida
      if (corrida?.id) {
        buscarDadosFrescos(corrida.id);
      }
    }
  }, [documentsUpdateTrigger, forceReload, corrida?.id]);

  const buscarDadosFrescos = async (corridaId: number) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('corridas')
        .select('*')
        .eq('id', corridaId)
        .single();

      if (error) throw error;

      // Removido log informativo: dados frescos carregados com sucesso
      // console.log('✅ Dados frescos carregados:', data);
      
      // Converter dados do banco para o formato CorridaFinanceiro
      const corridaFresca: CorridaFinanceiro = {
        id: data.id,
        empresa: data.empresa,
        motorista: data.motorista || '',
        dataServico: data.data_servico || data.data,
        origem: data.origem,
        destino: data.destino,
        kmTotal: data.km_total || 0,
        valor: data.valor || 0,
        valorMotorista: data.valor_motorista || 0,
        status: mapStatusToFinanceiro(data.status),
        statusPagamento: (data.status_pagamento as CorridaFinanceiro['statusPagamento']) || 'Pendente',
        medicaoNotaFiscal: (data.medicao_nota_fiscal as CorridaFinanceiro['medicaoNotaFiscal']) || 'Medição',
        observacoes: data.observacoes,
        centroCusto: data.centro_custo || '',
        pedagio: data.pedagio || 0,
        estacionamento: data.estacionamento || 0,
        hospedagem: data.hospedagem || 0,
        passageiros: data.passageiro || '',
        destinoExtra: data.destino_extra || '',
        numeroOS: data.numero_os || '',
        projeto: data.projeto,
        motivo: data.motivo,
        horaInicio: data.hora_inicio || data.hora_saida,
        tipoAbrangencia: data.tipo_abrangencia,
        kmInicial: data.km_inicial,
        kmFinal: data.km_final,
        solicitante: data.solicitante
      };
      
      setCorridaAtual(corridaFresca);
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados frescos:', error);
      // Em caso de erro, usar os dados originais
      setCorridaAtual(corrida);
    }
  };

  // Função auxiliar para mapear status
  const mapStatusToFinanceiro = (status: string): CorridaFinanceiro['status'] => {
    switch (status) {
      case 'OS Preenchida':
      case 'Pendente':
      case 'Aguardando Conferência':
        return 'Aguardando Conferência';
      case 'Aprovada':
        return 'Aprovada';
      case 'No Show':
        return 'No Show';
      case 'Rejeitada':
        return 'Revisar';
      case 'Cancelada':
        return 'Cancelada';
      default:
        return 'Em Análise';
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aguardando Conferência':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">{status}</Badge>;
      case 'Em Análise':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">{status}</Badge>;
      case 'Aprovada':
        return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">{status}</Badge>;
      case 'Revisar':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">{status}</Badge>;
      case 'Cancelada':
        return <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">{status}</Badge>;
      case 'No Show':
        return <Badge className="bg-green-700 text-white border-green-700 hover:bg-green-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Usar dados frescos se disponíveis, senão usar dados originais
  const dadosParaExibir = corridaAtual || corrida;
  
  if (!dadosParaExibir) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualização Completa - Corrida #{dadosParaExibir.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Empresa:</Label>
                  <p>{dadosParaExibir.empresa}</p>
                </div>
                <div>
                  <Label className="font-semibold">Motorista:</Label>
                  <p>{dadosParaExibir.motorista}</p>
                </div>
                {dadosParaExibir.veiculo && (
                 <div>
                   <Label className="font-semibold">Veículo:</Label>
                   <p>{dadosParaExibir.veiculo}</p>
                 </div>
                )}
                <div>
                  <Label className="font-semibold">Data do Serviço:</Label>
                  <p>{new Date(dadosParaExibir.dataServico).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <p>{getStatusBadge(dadosParaExibir.status)}</p>
                </div>
                {dadosParaExibir.solicitante && (
                 <div>
                   <Label className="font-semibold">Solicitante:</Label>
                   <p>{dadosParaExibir.solicitante}</p>
                 </div>
                )}
                <div>
                  <Label className="font-semibold">Centro de Custo:</Label>
                  <p>{dadosParaExibir.centroCusto}</p>
                </div>
                <div>
                  <Label className="font-semibold">N° da O.S:</Label>
                  <p>{dadosParaExibir.numeroOS}</p>
                </div>
                {(dadosParaExibir.projeto || dadosParaExibir.motivo || dadosParaExibir.tipoAbrangencia) && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                   {dadosParaExibir.projeto && (
                     <div>
                       <Label className="font-semibold">Projeto:</Label>
                       <p>{dadosParaExibir.projeto}</p>
                     </div>
                   )}
                   {dadosParaExibir.motivo && (
                     <div>
                       <Label className="font-semibold">Motivo:</Label>
                       <p>{dadosParaExibir.motivo}</p>
                     </div>
                   )}
                   {dadosParaExibir.tipoAbrangencia && (
                     <div>
                       <Label className="font-semibold">Tipo de Abrangência:</Label>
                       <p>{dadosParaExibir.tipoAbrangencia}</p>
                     </div>
                   )}
                 </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Origem:</Label>
                  <p>{dadosParaExibir.origem}</p>
                </div>
                <div>
                  <Label className="font-semibold">Destino:</Label>
                  <p>{dadosParaExibir.destino}</p>
                </div>
              </div>
              {dadosParaExibir.destinoExtra && (
                <div className="mt-4">
                  <Label className="font-semibold">Destino Extra:</Label>
                  <p>{dadosParaExibir.destinoExtra}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores e Quilometragem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quilometragem */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Quilometragem</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="font-semibold">KM Inicial:</Label>
                      <p className="text-lg">{dadosParaExibir.kmInicial || 0} km</p>
                    </div>
                    <div>
                      <Label className="font-semibold">KM Final:</Label>
                      <p className="text-lg">{dadosParaExibir.kmFinal || 0} km</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Cálculo:</Label>
                      <p className="text-sm text-gray-600">{dadosParaExibir.kmFinal || 0} - {dadosParaExibir.kmInicial || 0}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">KM Total:</Label>
                      <p className="text-lg font-bold text-blue-600">{dadosParaExibir.kmTotal} km</p>
                    </div>
                  </div>
                  {(dadosParaExibir.horaInicio || dadosParaExibir.horaFim) && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                     {dadosParaExibir.horaInicio && (
                       <div>
                         <Label className="font-semibold">Hora Início:</Label>
                         <p className="text-lg">{dadosParaExibir.horaInicio}</p>
                       </div>
                     )}
                     {dadosParaExibir.horaFim && (
                       <div>
                         <Label className="font-semibold">Hora Fim:</Label>
                         <p className="text-lg">{dadosParaExibir.horaFim}</p>
                       </div>
                     )}
                   </div>
                  )}
                </div>
                
                {/* Valores */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Valores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                  <Label className="font-semibold">Valor Total:</Label>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(dadosParaExibir.valor ?? 0)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Valor para Motorista:</Label>
                  <p className="text-lg">{formatCurrency(dadosParaExibir.valorMotorista ?? 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custos Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="font-semibold">Pedágio:</Label>
                    <p className="text-lg">{formatCurrency(dadosParaExibir.pedagio ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="font-semibold">Estacionamento:</Label>
                    <p className="text-lg">{formatCurrency(dadosParaExibir.estacionamento ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Hotel className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label className="font-semibold">Hospedagem:</Label>
                    <p className="text-lg">{formatCurrency(dadosParaExibir.hospedagem ?? 0)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              {dadosParaExibir.passageiros && (
                <div className="mb-4">
                  <Label className="font-semibold">Passageiros:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-line">
                    {dadosParaExibir.passageiros}
                  </div>
                </div>
              )}
              
              {dadosParaExibir.observacoes && (
                <div>
                  <Label className="font-semibold">Observações:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-line">
                    {dadosParaExibir.observacoes}
                  </div>
                </div>
              )}
              
              {dadosParaExibir.motivoReprovacao && (
                <div className="mt-4">
                  <Label className="font-semibold">Motivo da Reprovação:</Label>
                  <div className="mt-1 p-3 bg-red-50 rounded text-red-700">
                    {dadosParaExibir.motivoReprovacao}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <DocumentViewer
            documentos={documentos}
            loading={loading}
            onDownload={downloadDocumento}
            title="Comprovantes e Documentos"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
