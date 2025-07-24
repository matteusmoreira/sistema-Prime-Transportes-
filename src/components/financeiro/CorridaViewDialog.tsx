import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';

interface CorridaViewDialogProps {
  corrida: CorridaFinanceiro | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CorridaViewDialog = ({ corrida, isOpen, onOpenChange }: CorridaViewDialogProps) => {
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

  if (!corrida) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualização Completa - Corrida #{corrida.id}</DialogTitle>
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
                  <p>{corrida.empresa}</p>
                </div>
                <div>
                  <Label className="font-semibold">Motorista:</Label>
                  <p>{corrida.motorista}</p>
                </div>
                <div>
                  <Label className="font-semibold">Data do Serviço:</Label>
                  <p>{new Date(corrida.dataServico).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <p>{getStatusBadge(corrida.status)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Centro de Custo:</Label>
                  <p>{corrida.centroCusto}</p>
                </div>
                <div>
                  <Label className="font-semibold">N° da O.S:</Label>
                  <p>{corrida.numeroOS}</p>
                </div>
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
                  <p>{corrida.origem}</p>
                </div>
                <div>
                  <Label className="font-semibold">Destino:</Label>
                  <p>{corrida.destino}</p>
                </div>
              </div>
              {corrida.destinoExtra && (
                <div className="mt-4">
                  <Label className="font-semibold">Destino Extra:</Label>
                  <p>{corrida.destinoExtra}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores e Quilometragem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-semibold">KM Total:</Label>
                  <p>{corrida.kmTotal} km</p>
                </div>
                <div>
                  <Label className="font-semibold">Valor Total:</Label>
                  <p>R$ {corrida.valor.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Valor para Motorista:</Label>
                  <p>R$ {corrida.valorMotorista?.toFixed(2) || '0.00'}</p>
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
                <div>
                  <Label className="font-semibold">Pedágio:</Label>
                  <p>R$ {corrida.pedagio.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Estacionamento:</Label>
                  <p>R$ {corrida.estacionamento.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Hospedagem:</Label>
                  <p>R$ {corrida.hospedagem.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              {corrida.passageiros && (
                <div className="mb-4">
                  <Label className="font-semibold">Passageiros:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-line">
                    {corrida.passageiros}
                  </div>
                </div>
              )}
              
              {corrida.observacoes && (
                <div>
                  <Label className="font-semibold">Observações:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">
                    {corrida.observacoes}
                  </div>
                </div>
              )}
              
              {corrida.motivoReprovacao && (
                <div className="mt-4">
                  <Label className="font-semibold">Motivo da Reprovação:</Label>
                  <div className="mt-1 p-3 bg-red-50 rounded text-red-700">
                    {corrida.motivoReprovacao}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
