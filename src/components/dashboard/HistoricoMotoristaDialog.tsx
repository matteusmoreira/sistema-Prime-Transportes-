import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin, FileText, FileEdit, Eye } from 'lucide-react';
import { Corrida } from '@/types/corridas';
import { formatDateDDMMYYYY } from '@/utils/format';
import { formatTime24h } from '@/utils/timeFormatter';

interface HistoricoMotoristaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corridas: Corrida[];
  motoristaEmail: string;
  motoristas: any[];
  onFillOS?: (corrida: Corrida) => void;
  onViewCorrida?: (corrida: Corrida) => void;
}

export const HistoricoMotoristaDialog = ({
  open,
  onOpenChange,
  corridas,
  motoristaEmail,
  motoristas,
  onFillOS,
  onViewCorrida
}: HistoricoMotoristaDialogProps) => {
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');

  // Buscar motorista pelo email
  const motorista = motoristas.find((m: any) => m.email === motoristaEmail);
  
  // Filtrar corridas do motorista
  const corridasDoMotorista = corridas.filter(c => 
    motorista && c.motorista === motorista.nome
  );

  // Aplicar filtro de status
  const corridasFiltradas = filtroStatus === 'todas' 
    ? corridasDoMotorista
    : corridasDoMotorista.filter(c => c.status === filtroStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aguardando OS':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">{status}</Badge>;
      case 'Aguardando Conferência':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">{status}</Badge>;
      case 'Aprovada':
        return <Badge className="bg-green-100 text-green-800 border-green-300">{status}</Badge>;
      case 'Concluída':
        return <Badge className="bg-green-700 text-white border-green-700">{status}</Badge>;
      case 'No Show':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">{status}</Badge>;
      case 'Cancelada':
        return <Badge className="bg-red-100 text-red-800 border-red-300">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Corridas - {motorista?.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total de Corridas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{corridasDoMotorista.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Corridas Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {corridasDoMotorista.filter(c => c.status === 'Concluída' || c.status === 'No Show').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filtroStatus === 'todas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('todas')}
            >
              Todas ({corridasDoMotorista.length})
            </Button>
            <Button 
              variant={filtroStatus === 'Aguardando OS' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('Aguardando OS')}
            >
              Aguardando OS ({corridasDoMotorista.filter(c => c.status === 'Aguardando OS').length})
            </Button>
            <Button 
              variant={filtroStatus === 'Concluída' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('Concluída')}
            >
              Concluídas ({corridasDoMotorista.filter(c => c.status === 'Concluída').length})
            </Button>
            <Button 
              variant={filtroStatus === 'Aprovada' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('Aprovada')}
            >
              Aprovadas ({corridasDoMotorista.filter(c => c.status === 'Aprovada').length})
            </Button>
          </div>

          {/* Lista de Corridas */}
          <div className="space-y-4">
            {corridasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma corrida encontrada para este filtro.
              </div>
            ) : (
              corridasFiltradas.map((corrida) => (
                <Card key={corrida.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">#{corrida.id}</span>
                          {getStatusBadge(corrida.status)}
                        </div>
                        <p className="text-sm text-gray-600">{corrida.empresa}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="h-4 w-4 text-gray-500" />
                          <span>{formatDateDDMMYYYY(corrida.dataServico || corrida.data)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{formatTime24h(corrida.horaInicio || corrida.horaSaida || '')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{corrida.origem} → {corrida.destino}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {corrida.solicitante && (
                          <div className="text-sm">
                            <span className="text-gray-500">Solicitante:</span> {corrida.solicitante}
                          </div>
                        )}
                        {corrida.passageiros && (
                          <div className="text-sm">
                            <span className="text-gray-500">Passageiros:</span> {corrida.passageiros}
                          </div>
                        )}
                        {corrida.observacoes && (
                          <div className="text-sm">
                            <span className="text-gray-500">Obs:</span> {corrida.observacoes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {onViewCorrida && (
                        <Button size="sm" variant="outline" onClick={() => onViewCorrida(corrida)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      )}
                      {onFillOS && (corrida.status === 'Aguardando Conferência' || corrida.status === 'Pendente') && !corrida.preenchidoPorMotorista && (
                        <Button size="sm" variant="default" onClick={() => onFillOS(corrida)}>
                          <FileEdit className="h-4 w-4 mr-1" />
                          Preencher OS
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};