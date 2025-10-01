
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Check, X, FileEdit, UserPlus, MoreVertical, MessageCircle } from 'lucide-react';
import { Corrida } from '@/types/corridas';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MotoristaSelectionDialog } from './MotoristaSelectionDialog';
import { WhatsAppButton } from '@/components/financeiro/WhatsAppButton';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';
import StatusBadge from '@/components/corridas/StatusBadge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

  const getMotoristaDisplay = (corrida: Corrida) => {
    if (corrida.motorista) {
      return <span className="text-sm">{corrida.motorista}</span>;
    }

    const clickable = userLevel === 'Administrador' && corrida.status === 'Selecionar Motorista';

    return (
      <Badge
        className={`bg-red-100 text-red-800 border-red-300 hover:bg-red-200 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={(e) => {
          e.stopPropagation();
          if (clickable) {
            handleSelectMotoristaClick(corrida.id);
          }
        }}
        title={clickable ? 'Selecionar motorista' : undefined}
        aria-label="Selecionar motorista"
      >
        Selecionar Motorista
      </Badge>
    );
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

  // Utilitário simples para formatar horário (HH:mm)
  const formatTime = (time?: string) => {
    if (!time) return '-';
    // Aceita formatos HH:mm ou HH:mm:ss
    return time.length >= 5 ? time.slice(0, 5) : time;
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
            <TableRow key={corrida.id} className="align-top cursor-pointer hover:bg-muted/40" onClick={() => onView(corrida)}>
              <TableCell className="py-2">{corrida.numeroOS || '-'}</TableCell>
              <TableCell className="py-2">{formatDateDDMMYYYY(corrida.dataServico || corrida.data)}</TableCell>
              <TableCell className="py-2 font-medium">{corrida.empresa}</TableCell>
              <TableCell className="py-2">
                <div className="flex flex-col">
                  <span>{corrida.origem} → {corrida.destino}</span>
                  {corrida.destinoExtra && (
                    <span className="text-xs text-muted-foreground">Destino extra: {corrida.destinoExtra}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex flex-col">
                  <StatusBadge status={corrida.status} size="xs" />
                  {corrida.preenchidoPorFinanceiro && (
                    <Badge variant="outline" className="mt-1 px-1.5 py-0 text-[10px] rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">Conferenciado pelo Financeiro</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">{formatCurrency(corrida.valorMotorista ?? 0)}</TableCell>
              <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {((corrida.status === 'Aguardando Conferência' || corrida.status === 'Pendente' || corrida.status === 'Aguardando OS') && !corrida.preenchidoPorMotorista && !corrida.preenchidoPorFinanceiro) && (
                    <Button size="sm" variant="default" onClick={() => onFillOS(corrida)}>
                      <FileEdit className="mr-2 h-4 w-4" /> Preencher OS
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" aria-label="Abrir menu de ações">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[220px]">
                      <DropdownMenuItem onClick={() => onView(corrida)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                      </DropdownMenuItem>
                      {((corrida.status === 'Aguardando Conferência' || corrida.status === 'Pendente' || corrida.status === 'Aguardando OS') && !corrida.preenchidoPorMotorista && !corrida.preenchidoPorFinanceiro) && (
                        <DropdownMenuItem onClick={() => onFillOS(corrida)}>
                          <FileEdit className="mr-2 h-4 w-4" /> Preencher OS
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <TableHead className="py-2">Horário</TableHead>
            <TableHead className="py-2">Empresa</TableHead>
            <TableHead className="py-2">Motorista</TableHead>
            <TableHead className="py-2">Origem → Destino</TableHead>
            <TableHead className="py-2">Status</TableHead>
            <TableHead className="py-2">Ações</TableHead>
          </TableRow>
        </StickyHeader>
        <TableBody>
          {corridas.map(corrida => (
            <TableRow key={corrida.id} className="align-top cursor-pointer hover:bg-muted/40" onClick={() => onView(corrida)}>
              <TableCell className="py-2">{corrida.numeroOS || '-'}</TableCell>
              <TableCell className="py-2">{formatDateDDMMYYYY(corrida.dataServico || corrida.data)}</TableCell>
              <TableCell className="py-2">{formatTime(corrida.horaInicio || corrida.horaSaida)}</TableCell>
              <TableCell className="py-2 font-medium">{corrida.empresa}</TableCell>
              <TableCell className="py-2">{getMotoristaDisplay(corrida)}</TableCell>
              <TableCell className="py-2">
                <div className="flex flex-col">
                  <span>{corrida.origem} → {corrida.destino}</span>
                  {corrida.destinoExtra && (
                    <span className="text-xs text-muted-foreground">Destino extra: {corrida.destinoExtra}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex flex-col">
                  <StatusBadge status={corrida.status} size="xs" />
                  {corrida.preenchidoPorFinanceiro && (
                    <Badge variant="outline" className="mt-1 px-1.5 py-0 text-[10px] rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">Conferenciado pelo Financeiro</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" aria-label="Abrir menu de ações">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[240px]">
                    <DropdownMenuItem onClick={() => onView(corrida)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                    </DropdownMenuItem>
                    {userLevel === 'Administrador' && corrida.motorista && (
                      <WhatsAppButton
                        corrida={corrida}
                        trigger={
                          <DropdownMenuItem>
                            <MessageCircle className="mr-2 h-4 w-4" /> Enviar Zap
                          </DropdownMenuItem>
                        }
                      />
                    )}
                    {canEdit(corrida) && (
                      <DropdownMenuItem onClick={() => onEdit(corrida)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                    )}
                    {(userLevel === 'Administrador' || userLevel === 'Financeiro') && corrida.status === 'Aguardando Conferência' && (
                      <>
                        <DropdownMenuItem onClick={() => onApprove(corrida.id)}>
                          <Check className="mr-2 h-4 w-4" /> Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRejectClick(corrida.id)}>
                          <X className="mr-2 h-4 w-4" /> Rejeitar
                        </DropdownMenuItem>
                      </>
                    )}
                    {userLevel === 'Administrador' && corrida.status === 'Selecionar Motorista' && (
                      <DropdownMenuItem onClick={() => handleSelectMotoristaClick(corrida.id)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Selecionar Motorista
                      </DropdownMenuItem>
                    )}
                    {userLevel === 'Administrador' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(corrida.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diálogo de Rejeição */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, corridaId: open ? rejectDialog.corridaId : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo da Rejeição</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Descreva o motivo da rejeição"
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, corridaId: null })}>Cancelar</Button>
            <Button onClick={handleRejectConfirm}>Confirmar Rejeição</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seleção de Motorista */}
      <MotoristaSelectionDialog
        open={motoristaSelectionDialog.open}
        onOpenChange={(open) => setMotoristaSelectionDialog({ open, corridaId: open ? motoristaSelectionDialog.corridaId : null })}
        onSelect={handleMotoristaSelected}
      />
    </>
  );
};
