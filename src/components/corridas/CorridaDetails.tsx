import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Corrida } from '@/types/corridas';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatTimeToAmPm } from '@/utils/timeFormatter';

interface CorridaDetailsProps {
  corrida: Corrida;
}

export const CorridaDetails = ({
  corrida
}: CorridaDetailsProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleDownloadDocument = async (documento: any) => {
    try {
      // If URL starts with http, it's already a public URL
      if (documento.url.startsWith('http')) {
        window.open(documento.url, '_blank');
        return;
      }

      // Otherwise, try to get from storage bucket
      const { data, error } = await supabase.storage
        .from('corrida-documentos')
        .download(documento.url);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documento.nome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download realizado",
        description: `${documento.nome} foi baixado com sucesso`
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento",
        variant: "destructive"
      });
    }
  };
  // Helper: value presence (treat 0 as empty for numbers)
  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  };

  // Helper: display with fallback
  const displayValue = (value: any, fallback: string = 'Não informado'): string => {
    return hasValue(value) ? String(value) : fallback;
  };

  // Currency formatter (pt-BR)
  const formatCurrency = (value?: number | string): string => {
    const num = typeof value === 'number' ? value : Number(value);
    if (!isFinite(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selecionar Motorista':
        return <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">{status}</Badge>;
      case 'Aguardando OS':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">{status}</Badge>;
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
      case 'Aguardando':
        return <Badge variant="outline">{status}</Badge>;
      case 'Em Andamento':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Concluída':
        return <Badge variant="default">{status}</Badge>;
      case 'Reprovada':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return <div className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Dados Básicos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Empresa:</Label>
            <p>{corrida.empresa}</p>
          </div>
          <div>
            <Label className="font-semibold">Solicitante:</Label>
            <p>{corrida.solicitante}</p>
          </div>
          <div>
            <Label className="font-semibold">Motorista:</Label>
            <p>{corrida.motorista}</p>
          </div>
          <div>
            <Label className="font-semibold">Data do Serviço:</Label>
            <p>{corrida.dataServico ? new Date(corrida.dataServico).toLocaleDateString('pt-BR') : new Date(corrida.data).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <Label className="font-semibold">Horário de Início:</Label>
            <p>{formatTimeToAmPm(corrida.horaInicio || corrida.horaSaida || '')}</p>
          </div>
          <div>
            <Label className="font-semibold">Status:</Label>
            <p>{getStatusBadge(corrida.status)}</p>
          </div>
          <div>
            <Label className="font-semibold">Centro de Custo:</Label>
            <p>{displayValue(corrida.centroCusto)}</p>
          </div>
          <div>
            <Label className="font-semibold">Nº OS:</Label>
            <p>{displayValue(corrida.numeroOS)}</p>
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Localização</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Origem:</Label>
            <p>{corrida.origem}</p>
          </div>
          <div>
            <Label className="font-semibold">Destino:</Label>
            <p>{corrida.destino}</p>
          </div>
          <div>
            <Label className="font-semibold">Tipo de Abrangência:</Label>
            <p>{displayValue(corrida.tipoAbrangencia)}</p>
          </div>
          {hasValue(corrida.destinoExtra) && (
            <div className="col-span-2">
              <Label className="font-semibold">Destino Extra:</Label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{corrida.destinoExtra}</p>
            </div>
          )}
        </div>
      </div>

      {/* Detalhes do Projeto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Detalhes do Projeto</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Projeto:</Label>
            <p>{displayValue(corrida.projeto)}</p>
          </div>
          <div>
            <Label className="font-semibold">Motivo:</Label>
            <p>{displayValue(corrida.motivo)}</p>
          </div>
          <div>
            <Label className="font-semibold">Veículo:</Label>
            <p>{displayValue(corrida.veiculo)}</p>
          </div>
          {/* Mostrar ambos os valores para admins, apenas valor motorista para motoristas */}
          {profile?.role !== 'Motorista' && (
            <div>
              <Label className="font-semibold">Valor Total:</Label>
              <p>{formatCurrency((corrida.total ?? 0) > 0 ? corrida.total : corrida.valor)}</p>
            </div>
          )}
          <div>
            <Label className="font-semibold">Valor para o Motorista:</Label>
            <p>{formatCurrency(corrida.valorMotorista)}</p>
          </div>
        </div>
      </div>

      {/* Tempo e Quilometragem */}
      {(hasValue(corrida.kmInicial) || hasValue(corrida.kmFinal) || hasValue(corrida.kmTotal) || hasValue(corrida.distanciaPercorrida) || hasValue(corrida.tempoViagem)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Tempo e Quilometragem</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">KM Inicial:</Label>
              <p>{displayValue(corrida.kmInicial)}</p>
            </div>
            <div>
              <Label className="font-semibold">KM Final:</Label>
              <p>{displayValue(corrida.kmFinal)}</p>
            </div>
            <div>
              <Label className="font-semibold">KM Total:</Label>
              <p>{displayValue(corrida.kmTotal)}</p>
            </div>
            <div>
              <Label className="font-semibold">Distância Percorrida:</Label>
              <p>{displayValue(corrida.distanciaPercorrida)}</p>
            </div>
            <div>
              <Label className="font-semibold">Tempo de Viagem:</Label>
              <p>{displayValue(corrida.tempoViagem)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Custos e Reembolsos */}
      {(hasValue(corrida.pedagio) || hasValue(corrida.estacionamento) || hasValue(corrida.hospedagem) || hasValue(corrida.outros) || hasValue(corrida.reembolsos)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Custos e Reembolsos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Pedágio:</Label>
              <p>{formatCurrency(corrida.pedagio)}</p>
            </div>
            <div>
              <Label className="font-semibold">Estacionamento:</Label>
              <p>{formatCurrency(corrida.estacionamento)}</p>
            </div>
            <div>
              <Label className="font-semibold">Hospedagem:</Label>
              <p>{formatCurrency(corrida.hospedagem)}</p>
            </div>
            <div>
              <Label className="font-semibold">Outros:</Label>
              <p>{formatCurrency(corrida.outros)}</p>
            </div>
            <div>
              <Label className="font-semibold">Reembolsos:</Label>
              <p>{formatCurrency(corrida.reembolsos)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Abastecimento */}
      {(hasValue(corrida.combustivelInicial) || hasValue(corrida.combustivelFinal) || hasValue(corrida.valorCombustivel) || hasValue(corrida.localAbastecimento)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Abastecimento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Combustível Inicial:</Label>
              <p>{displayValue(corrida.combustivelInicial)}</p>
            </div>
            <div>
              <Label className="font-semibold">Combustível Final:</Label>
              <p>{displayValue(corrida.combustivelFinal)}</p>
            </div>
            <div>
              <Label className="font-semibold">Valor de Combustível:</Label>
              <p>{formatCurrency(corrida.valorCombustivel)}</p>
            </div>
            <div>
              <Label className="font-semibold">Local de Abastecimento:</Label>
              <p>{displayValue(corrida.localAbastecimento)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Passageiros */}
      {hasValue(corrida.passageiros) && <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Passageiros</h3>
          <div>
            <div>
              <Label className="font-semibold">Lista de Passageiros:</Label>
              <pre className="mt-1 p-2 bg-gray-50 rounded whitespace-pre-wrap">{corrida.passageiros}</pre>
            </div>
          </div>
        </div>}

      {corrida.documentos && corrida.documentos.length > 0 && <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Documentos</h3>
          <div className="grid gap-4">
            {corrida.documentos.map(doc => (
              <div key={doc.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-base">{doc.nome}</p>
                    {doc.descricao && (
                      <p className="text-sm text-gray-600 mt-1">{doc.descricao}</p>
                    )}
                  </div>
                  {doc.url && (
                    <Button
                      onClick={() => handleDownloadDocument(doc)}
                      size="sm"
                      variant="outline"
                      className="ml-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>}

      {hasValue(corrida.observacoesOS) && (
        <div>
          <Label className="font-semibold">Observações da OS:</Label>
          <p className="mt-1 p-2 bg-gray-50 rounded">{corrida.observacoesOS}</p>
        </div>
      )}

      {hasValue(corrida.motivoRejeicao) && (
        <div>
          <Label className="font-semibold">Motivo da Rejeição:</Label>
          <p className="mt-1 p-2 bg-gray-50 rounded">{corrida.motivoRejeicao}</p>
        </div>
      )}

      {hasValue(corrida.observacoes) && <div>
          <Label className="font-semibold">Observações:</Label>
          <p className="mt-1 p-2 bg-gray-50 rounded">{corrida.observacoes}</p>
        </div>}
    </div>;
};
