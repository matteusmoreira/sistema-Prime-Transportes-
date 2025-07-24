
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, AlertTriangle, Info, CheckCircle, X, Eye, Check } from 'lucide-react';
import { useAlertas, type Alerta } from '@/contexts/AlertasContext';
import { toast } from 'sonner';

interface NotificacoesMotoristaProps {
  motoristaEmail: string;
}

export const NotificacoesMotorista = ({ motoristaEmail }: NotificacoesMotoristaProps) => {
  const { alertasParaMotorista, alertasNaoLidos, marcarComoLido } = useAlertas();
  const [alertasDoMotorista, setAlertasDoMotorista] = useState<Alerta[]>([]);
  const [alertaSelecionado, setAlertaSelecionado] = useState<Alerta | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const alertas = alertasParaMotorista(motoristaEmail);
    setAlertasDoMotorista(alertas);
    
    // Mostrar toast para alertas urgentes não lidos
    const alertasUrgentesNaoLidos = alertas.filter(a => a.urgente && !a.lido);
    alertasUrgentesNaoLidos.forEach(alerta => {
      toast.error(`URGENTE: ${alerta.titulo}`, {
        description: alerta.mensagem,
        duration: 10000,
        action: {
          label: "Ver detalhes",
          onClick: () => {
            setAlertaSelecionado(alerta);
            setIsDialogOpen(true);
          }
        }
      });
    });
  }, [motoristaEmail, alertasParaMotorista]);

  const naoLidos = alertasNaoLidos(motoristaEmail);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'info':
        return <Badge variant="default">Info</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600">Sucesso</Badge>;
      default:
        return <Badge variant="secondary">{tipo}</Badge>;
    }
  };

  const handleVerAlerta = (alerta: Alerta) => {
    setAlertaSelecionado(alerta);
    setIsDialogOpen(true);
  };

  const handleMarcarComoLido = (alerta: Alerta, event: React.MouseEvent) => {
    event.stopPropagation();
    marcarComoLido(alerta.id, motoristaEmail);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <span>Notificações</span>
          {naoLidos > 0 && (
            <Badge variant="destructive" className="ml-2">
              {naoLidos} não lidas
            </Badge>
          )}
        </h2>
      </div>

      {alertasDoMotorista.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma notificação disponível</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alertasDoMotorista.map((alerta) => (
            <Card 
              key={alerta.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !alerta.lido ? 'ring-2 ring-blue-200 bg-blue-50' : ''
              } ${alerta.urgente ? 'border-red-300' : ''}`}
              onClick={() => handleVerAlerta(alerta)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{alerta.titulo}</h3>
                        {alerta.urgente && (
                          <Badge variant="destructive">URGENTE</Badge>
                        )}
                        {!alerta.lido && (
                          <Badge variant="default">Novo</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTipoBadge(alerta.tipo)}
                        {!alerta.lido && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => handleMarcarComoLido(alerta, e)}
                            className="text-sm"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Marcar como Visualizado
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {alerta.mensagem.length > 100 
                        ? `${alerta.mensagem.substring(0, 100)}...`
                        : alerta.mensagem
                      }
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Criado em: {formatDate(alerta.dataCreacao)}</span>
                      {alerta.dataExpiracao && (
                        <span>Expira em: {formatDate(alerta.dataExpiracao)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para ver detalhes do alerta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {alertaSelecionado && getIcon(alertaSelecionado.tipo)}
              <span>{alertaSelecionado?.titulo}</span>
              {alertaSelecionado?.urgente && (
                <Badge variant="destructive">URGENTE</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {alertaSelecionado && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Mensagem:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {alertaSelecionado.mensagem}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span className="font-medium">Tipo:</span> {getTipoBadge(alertaSelecionado.tipo)}
                </div>
                <div>
                  <span className="font-medium">Criado por:</span> {alertaSelecionado.criadoPor}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span className="font-medium">Criado em:</span> {formatDate(alertaSelecionado.dataCreacao)}
                </div>
                {alertaSelecionado.dataExpiracao && (
                  <div>
                    <span className="font-medium">Expira em:</span> {formatDate(alertaSelecionado.dataExpiracao)}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setIsDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
