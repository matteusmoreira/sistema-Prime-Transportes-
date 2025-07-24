
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificacoes } from '@/contexts/NotificacoesContext';
import { CheckCheck, Clock, FileText } from 'lucide-react';

interface NotificationsListProps {
  userEmail?: string;
  onClose: () => void;
}

export const NotificationsList = ({ userEmail, onClose }: NotificationsListProps) => {
  const { 
    notificacoes, 
    marcarComoLida, 
    marcarTodasComoLidas, 
    obterNaoLidas 
  } = useNotificacoes();

  const notificacoesFiltradas = userEmail 
    ? notificacoes.filter(notif => notif.destinatarios.includes(userEmail))
    : notificacoes;

  const notificacoesNaoLidas = obterNaoLidas(userEmail);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'os_preenchida':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'documento_vencendo':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatarData = (dataISO: string) => {
    try {
      return formatDistanceToNow(new Date(dataISO), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'há pouco tempo';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notificações</h3>
        {notificacoesNaoLidas.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              marcarTodasComoLidas();
              onClose();
            }}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <ScrollArea className="h-80">
        {notificacoesFiltradas.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="p-2">
            {notificacoesFiltradas.map((notificacao, index) => (
              <div key={notificacao.id}>
                <div
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    !notificacao.lida 
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => marcarComoLida(notificacao.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notificacao.tipo)}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${!notificacao.lida ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notificacao.titulo}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {notificacao.descricao}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatarData(notificacao.dataHora)}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
                {index < notificacoesFiltradas.length - 1 && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
