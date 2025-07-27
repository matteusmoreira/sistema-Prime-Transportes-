import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Corrida } from '@/types/corridas';
import { useEmpresas } from '@/hooks/useEmpresas';

interface CorridaDetailsProps {
  corrida: Corrida;
}

export const CorridaDetails = ({
  corrida
}: CorridaDetailsProps) => {
  const { empresas } = useEmpresas();
  
  // Buscar o centro de custo da empresa associada à corrida
  const empresaAssociada = empresas.find(empresa => empresa.nome === corrida.empresa);
  const centroCustoEmpresa = empresaAssociada?.centroCusto || 'Não informado';
  
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
            <p>{new Date(corrida.dataServico || corrida.data).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <Label className="font-semibold">Horário de Início:</Label>
            <p>{corrida.horaInicio || corrida.horaSaida || 'Não informado'}</p>
          </div>
          <div>
            <Label className="font-semibold">Status:</Label>
            <p>{getStatusBadge(corrida.status)}</p>
          </div>
          <div>
            <Label className="font-semibold">Centro de Custo:</Label>
            <p>{centroCustoEmpresa}</p>
          </div>
          <div>
            <Label className="font-semibold">Nº OS:</Label>
            <p>{corrida.numeroOS || 'Não informado'}</p>
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
            <p>{corrida.tipoAbrangencia || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Detalhes do Projeto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Detalhes do Projeto</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Projeto:</Label>
            <p>{corrida.projeto || 'Não informado'}</p>
          </div>
          <div>
            <Label className="font-semibold">Motivo:</Label>
            <p>{corrida.motivo || 'Não informado'}</p>
          </div>
          <div>
            <Label className="font-semibold">Veículo:</Label>
            <p>{corrida.veiculo || 'Não informado'}</p>
          </div>
          <div>
            <Label className="font-semibold">Valor para o Motorista:</Label>
            <p>R$ {corrida.valorMotorista?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </div>

      {corrida.destinoExtra && <div>
          <Label className="font-semibold">Destino Extra:</Label>
          <p className="mt-1 p-2 bg-gray-50 rounded">{corrida.destinoExtra}</p>
        </div>}

      {/* Passageiros */}
      {(corrida.passageiros || corrida.passageiro) && <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Passageiros</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Lista de Passageiros:</Label>
              <pre className="mt-1 p-2 bg-gray-50 rounded whitespace-pre-wrap">{corrida.passageiros || corrida.passageiro}</pre>
            </div>
            {corrida.telefonePassageiro && <div>
              <Label className="font-semibold">Telefone do Passageiro:</Label>
              <p>{corrida.telefonePassageiro}</p>
            </div>}
          </div>
        </div>}

      {corrida.documentos && corrida.documentos.length > 0 && <div>
          <Label className="font-semibold">Documentos:</Label>
          <div className="mt-2 space-y-2">
            {corrida.documentos.map(doc => <div key={doc.id} className="p-3 border rounded">
                <p className="font-medium">{doc.nome}</p>
                <p className="text-sm text-gray-600">{doc.descricao}</p>
              </div>)}
          </div>
        </div>}

      {corrida.observacoes && <div>
          <Label className="font-semibold">Observações:</Label>
          <p className="mt-1 p-2 bg-gray-50 rounded">{corrida.observacoes}</p>
        </div>}
    </div>;
};
