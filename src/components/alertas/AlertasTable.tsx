
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Eye, EyeOff, AlertTriangle, Users } from 'lucide-react';
import { type Alerta, useAlertas } from '@/contexts/AlertasContext';

interface AlertasTableProps {
  alertas: Alerta[];
  onEdit: (alerta: Alerta) => void;
  onDelete: (alertaId: number) => void;
  onToggleAtivo: (alertaId: number, ativo: boolean) => void;
}

export const AlertasTable = ({ alertas, onEdit, onDelete, onToggleAtivo }: AlertasTableProps) => {
  const { getLeiturasDoAlerta } = useAlertas();
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'info':
        return <Badge variant="default">Informação</Badge>;
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

  const getDestinatariosBadge = (destinatarios: string, motoristaEspecifico?: string) => {
    switch (destinatarios) {
      case 'todos':
        return <Badge variant="outline">Todos</Badge>;
      case 'motoristas':
        return <Badge variant="outline">Motoristas</Badge>;
      case 'especifico':
        return <Badge variant="outline">{motoristaEspecifico || 'Específico'}</Badge>;
      default:
        return <Badge variant="outline">{destinatarios}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpired = (dataExpiracao?: string) => {
    if (!dataExpiracao) return false;
    return new Date(dataExpiracao) < new Date();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Destinatários</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Leituras</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Expira em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alertas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Nenhum alerta encontrado
              </TableCell>
            </TableRow>
          ) : (
            alertas.map((alerta) => (
              <TableRow key={alerta.id} className={isExpired(alerta.dataExpiracao) ? 'opacity-50' : ''}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {alerta.urgente && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <span className="font-medium">{alerta.titulo}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {alerta.mensagem.length > 50 
                      ? `${alerta.mensagem.substring(0, 50)}...`
                      : alerta.mensagem
                    }
                  </div>
                </TableCell>
                <TableCell>{getTipoBadge(alerta.tipo)}</TableCell>
                <TableCell>{getDestinatariosBadge(alerta.destinatarios, alerta.motoristaEspecifico)}</TableCell>
                 <TableCell>
                   <div className="flex flex-col space-y-1">
                     <Badge variant={alerta.ativo ? "default" : "secondary"}>
                       {alerta.ativo ? 'Ativo' : 'Inativo'}
                     </Badge>
                     {isExpired(alerta.dataExpiracao) && (
                       <Badge variant="destructive">Expirado</Badge>
                     )}
                   </div>
                 </TableCell>
                 <TableCell>
                   {(() => {
                     const leituras = getLeiturasDoAlerta(alerta.id);
                     return (
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="flex items-center space-x-1">
                             <Users className="h-4 w-4" />
                             <span>{leituras.length} leituras</span>
                           </Button>
                         </DialogTrigger>
                         <DialogContent>
                           <DialogHeader>
                             <DialogTitle>Leituras do Alerta: {alerta.titulo}</DialogTitle>
                           </DialogHeader>
                           <div className="space-y-2">
                             {leituras.length === 0 ? (
                               <p className="text-gray-500">Nenhuma leitura registrada</p>
                             ) : (
                               <div className="space-y-2">
                                 {leituras.map((leitura, index) => (
                                   <div key={index} className="flex justify-between items-center p-2 border rounded">
                                     <span className="font-medium">{leitura.motoristaEmail}</span>
                                     <span className="text-sm text-gray-500">
                                       {new Date(leitura.dataLeitura).toLocaleString('pt-BR')}
                                     </span>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                         </DialogContent>
                       </Dialog>
                     );
                   })()}
                 </TableCell>
                <TableCell>{formatDate(alerta.dataCreacao)}</TableCell>
                <TableCell>
                  {alerta.dataExpiracao ? formatDate(alerta.dataExpiracao) : 'Sem expiração'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleAtivo(alerta.id, alerta.ativo)}
                      title={alerta.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {alerta.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(alerta)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(alerta.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
