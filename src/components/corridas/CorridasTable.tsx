
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Check, X, FileEdit, UserPlus } from 'lucide-react';
import { Corrida } from '@/types/corridas';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MotoristaSelectionDialog } from './MotoristaSelectionDialog';
import { WhatsAppButton } from '@/components/financeiro/WhatsAppButton';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';

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
  onSelectMotorista?: (corridaId: number, motoristaName: string, veiculo?: string) => void;
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
  onReject,
  onSelectMotorista
}: CorridasTableProps) => {

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; corridaId: number | null }>({ 
    open: false, 
    corridaId: null 
  });
  const [rejectReason, setRejectReason] = useState('');
  const [motoristaSelectionDialog, setMotoristaSelectionDialog] = useState<{ open: boolean; corridaId: number | null }>({
    open: false,
    corridaId: null
  });

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
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-sky-50 text-sky-700">{status}</Badge>;
      case 'Em Análise':
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-amber-50 text-amber-700">{status}</Badge>;
      case 'Aprovada':
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-emerald-50 text-emerald-700">{status}</Badge>;
      case 'Revisar':
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-sky-50 text-sky-700">{status}</Badge>;
      case 'Cancelada':
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-rose-50 text-rose-700">{status}</Badge>;
      case 'No Show':
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-zinc-800 text-white">{status}</Badge>;
      case 'Selecionar Motorista':
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-rose-50 text-rose-700">{status}</Badge>;
      default:
        return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>;
    }
  };

  const getMotoristaDisplay = (motorista: string | undefined) => {
    if (motorista) {
      return <span className="text-sm">{motorista}</span>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">Selecionar Motorista</Badge>;
  };

  const handleSelectMotoristaClick = (corridaId: number) => {
    setMotoristaSelectionDialog({ open: true, corridaId });
  };

  const handleMotoristaSelected = (motoristaName: string, veiculo?: string) => {
    if (motoristaSelectionDialog.corridaId && onSelectMotorista) {
      onSelectMotorista(motoristaSelectionDialog.corridaId, motoristaName, veiculo);
      setMotoristaSelectionDialog({ open: false, corridaId: null });
    }
  };

  const canEdit = (corrida: Corrida) => {
    if (userLevel === 'Administrador') return true;
    if (userLevel === 'Administração') return true;
    if (userLevel === 'Financeiro') return true;
    return false;
  };

  // Verificar se corridas é válido e tem itens
  if (!corridas || !Array.isArray(corridas)) {
    return <div>Erro: dados inválidos</div>;
  }

  if (corridas.length === 0) {
    return <div>Nenhuma corrida encontrada</div>;
  }

  // cabeçalho colante para facilitar navegação ao rolar
  const StickyHeader = ({ children }: { children: React.ReactNode }) => (
    <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {children}
    </TableHeader>
  );

  // Renderização específica para motoristas - apenas campos permitidos
  if (userLevel === 'Motorista') {
    return (
      <Table className="min-w-[880px] text-sm">
        <StickyHeader>
          <TableRow>
            <TableHead className="py-2">Nº OS</TableHead>
            <TableHead className="py-2">Data</TableHead>
            <TableHead className="py-2">Empresa</TableHead>
            <TableHead className="py-2">Origem → Destino</TableHead>
            <TableHead className="py-2">Status</TableHead>
            <TableHead className="py-2">Valor a Receber</TableHead>
            <TableHead className="py-2">Ações</TableHead>
          </TableRow>
        </StickyHeader>
        <TableBody>
          {corridas.map((corrida) => (
            <TableRow key={corrida.id} className="align-top">
              <TableCell className="py-2">{corrida.numeroOS || '-'}</TableCell>
              <TableCell className="py-2">{formatDateDDMMYYYY(corrida.dataServico || corrida.data)}</TableCell>
              <TableCell className="py-2 font-medium">{corrida.empresa}</TableCell>
              <TableCell className="py-2">{corrida.origem} → {corrida.destino}</TableCell>
              <TableCell className="py-2">
                <div className="flex flex-col">
                  {getStatusBadge(corrida.status)}
                  {corrida.preenchidoPorFinanceiro && (
                    <Badge variant="outline" className="mt-1 px-1.5 py-0 text-[10px] rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">Conferenciado pelo Financeiro</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">{formatCurrency(corrida.valorMotorista ?? 0)}</TableCell>
              <TableCell className="py-2">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(corrida)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(corrida.status === 'Aguardando Conferência' || corrida.status === 'Pendente' || corrida.status === 'Aguardando OS') && !corrida.preenchidoPorMotorista && !corrida.preenchidoPorFinanceiro && (
                    <Button size="sm" variant="default" onClick={() => onFillOS(corrida)}>
                      <FileEdit className="h-4 w-4" />
                      Preencher OS
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <Table className="min-w-[920px] text-sm">
        <StickyHeader>
          <TableRow>
            <TableHead className="py-2">Nº OS</TableHead>
            <TableHead className="py-2">Data</TableHead>
            <TableHead className="py-2">Empresa</TableHead>
            <TableHead className="py-2">Motorista</TableHead>
            <TableHead className="py-2">Origem → Destino</TableHead>
            <TableHead className="py-2">Centro de Custo</TableHead>
            <TableHead className="py-2">Valor Total</TableHead>
            <TableHead className="py-2">Status</TableHead>
            <TableHead className="py-2">Ações</TableHead>
          </TableRow>
        </StickyHeader>
        <TableBody>
          {corridas.map(corrida => (
            <TableRow key={corrida.id} className="align-top">
              <TableCell className="py-2">{corrida.numeroOS || '-'}</TableCell>
              <TableCell className="py-2">{formatDateDDMMYYYY(corrida.dataServico || corrida.data)}</TableCell>
              <TableCell className="py-2 font-medium">{corrida.empresa}</TableCell>
              <TableCell className="py-2">{getMotoristaDisplay(corrida.motorista)}</TableCell>
              <TableCell className="py-2">{corrida.origem} → {corrida.destino}</TableCell>
              <TableCell className="py-2">{corrida.centroCusto || '-'}</TableCell>
              <TableCell className="py-2">{formatCurrency(corrida.valor ?? 0)}</TableCell>
              <TableCell className="py-2">
                <div className="flex flex-col">
                  {getStatusBadge(corrida.status)}
                  {corrida.preenchidoPorFinanceiro && (
                    <Badge variant="outline" className="mt-1 px-1.5 py-0 text-[10px] rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">Conferenciado pelo Financeiro</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(corrida)}>
                    <Eye className="h-4 w-4" />
                  </Button>

                  {userLevel === 'Administrador' && corrida.motorista && (
                    <WhatsAppButton corrida={corrida} />
                  )}

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

                  {userLevel === 'Administrador' && corrida.status === 'Selecionar Motorista' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-300 text-red-800 hover:bg-red-50"
                      onClick={() => handleSelectMotoristaClick(corrida.id)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
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

      {/* Motorista Selection Dialog */}
      <MotoristaSelectionDialog
        open={motoristaSelectionDialog.open}
        onOpenChange={(open) => setMotoristaSelectionDialog({ open, corridaId: null })}
        onSelect={handleMotoristaSelected}
        corridaId={motoristaSelectionDialog.corridaId || undefined}
      />
    </>
  );
};
