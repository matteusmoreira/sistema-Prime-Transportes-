
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Check, X, FileEdit } from 'lucide-react';
import { Corrida } from '@/types/corridas';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface CorridasTableProps {
  corridas: Corrida[];
  userLevel: string;
  userEmail?: string;
  onView: (corrida: Corrida) => void;
  onEdit: (corrida: Corrida) => void;
  onFillOS: (corrida: Corrida) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number, motivo: string) => void;
}

export const CorridasTable = ({ 
  corridas, 
  userLevel,
  userEmail,
  onView, 
  onEdit,
  onFillOS,
  onDelete, 
  onApprove, 
  onReject 
}: CorridasTableProps) => {
  console.log('=== CORRIDAS TABLE DEBUG ===');
  console.log('UserLevel na tabela:', userLevel);
  console.log('UserEmail na tabela:', userEmail);
  console.log('Corridas recebidas na tabela:', corridas);
  console.log('Quantidade de corridas na tabela:', corridas.length);
  console.log('Tipo das corridas:', typeof corridas);
  console.log('É array?', Array.isArray(corridas));
  console.log('=== FIM CORRIDAS TABLE DEBUG ===');

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; corridaId: number | null }>({ 
    open: false, 
    corridaId: null 
  });
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectClick = (corridaId: number) => {
    setRejectDialog({ open: true, corridaId });
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (rejectDialog.corridaId && rejectReason.trim()) {
      onReject(rejectDialog.corridaId, rejectReason);
      setRejectDialog({ open: false, corridaId: null });
      setRejectReason('');
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

  const canEdit = (corrida: Corrida) => {
    if (userLevel === 'Administrador') return true;
    if (userLevel === 'Financeiro' && corrida.status === 'Aguardando Conferência') return true;
    return false;
  };

  // Verificar se corridas é válido e tem itens
  if (!corridas || !Array.isArray(corridas)) {
    console.log('ERRO: corridas não é um array válido:', corridas);
    return <div>Erro: dados inválidos</div>;
  }

  if (corridas.length === 0) {
    console.log('Lista de corridas está vazia');
    return <div>Nenhuma corrida encontrada</div>;
  }

  // Renderização específica para motoristas - apenas campos permitidos
  if (userLevel === 'Motorista') {
    console.log('=== RENDERIZANDO TABELA PARA MOTORISTA ===');
    console.log('Corridas que serão renderizadas:', corridas);
    console.log('Status das corridas:', corridas.map(c => ({ id: c.id, status: c.status, motorista: c.motorista })));
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Origem → Destino</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor a Receber</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corridas.map((corrida, index) => {
            console.log(`Renderizando corrida ${index + 1}:`, corrida);
            return (
              <TableRow key={corrida.id}>
                <TableCell>{new Date(corrida.dataServico || corrida.data).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium">{corrida.empresa}</TableCell>
                <TableCell>{corrida.origem} → {corrida.destino}</TableCell>
                <TableCell>{getStatusBadge(corrida.status)}</TableCell>
                <TableCell>R$ {(corrida.valorMotorista || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onView(corrida)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {corrida.status === 'Aguardando Conferência' && !corrida.preenchidoPorMotorista && (
                      <Button size="sm" variant="default" onClick={() => onFillOS(corrida)}>
                        <FileEdit className="h-4 w-4" />
                        Preencher OS
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Origem → Destino</TableHead>
            <TableHead>Centro de Custo</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corridas.map(corrida => (
            <TableRow key={corrida.id}>
              <TableCell>{new Date(corrida.dataServico || corrida.data).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell className="font-medium">{corrida.empresa}</TableCell>
              <TableCell>{corrida.motorista}</TableCell>
              <TableCell>{corrida.origem} → {corrida.destino}</TableCell>
              <TableCell>{corrida.centroCusto}</TableCell>
              <TableCell>R$ {(corrida.valor || 0).toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(corrida.status)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onView(corrida)}>
                    <Eye className="h-4 w-4" />
                  </Button>

                  {canEdit(corrida) && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(corrida)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {(userLevel === 'Administrador' || userLevel === 'Financeiro') && corrida.status === 'Aguardando Conferência' && (
                    <>
                      <Button size="sm" variant="default" onClick={() => onApprove(corrida.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectClick(corrida.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {userLevel === 'Administrador' && (
                    <Button size="sm" variant="destructive" onClick={() => onDelete(corrida.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, corridaId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Corrida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo da rejeição:
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Digite o motivo da rejeição..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setRejectDialog({ open: false, corridaId: null })}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
              >
                Rejeitar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
