import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Eye, MoreVertical, MessageCircle, Check, X } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';

interface FinanceiroGridProps {
  corridas: CorridaFinanceiro[];
  onEdit: (corrida: CorridaFinanceiro) => void;
  onView: (corrida: CorridaFinanceiro) => void;
  onApprove: (corrida: CorridaFinanceiro) => void;
  onReject: (corrida: CorridaFinanceiro) => void;
  onStatusChange: (corridaId: number, status: CorridaFinanceiro['status']) => void;
  onPaymentStatusChange: (corridaId: number, status: CorridaFinanceiro['statusPagamento']) => void;
  onMedicaoNotaFiscalChange: (corridaId: number, medicaoNotaFiscal: CorridaFinanceiro['medicaoNotaFiscal']) => void;
}

const statusOptions: CorridaFinanceiro['status'][] = [
  'Aguardando Conferência',
  'Em Análise',
  'No Show',
  'Revisar',
  'Cancelada',
  'Aprovada',
];

const paymentStatusOptions: CorridaFinanceiro['statusPagamento'][] = ['Pendente', 'Pago'];
const medicaoNotaFiscalOptions: CorridaFinanceiro['medicaoNotaFiscal'][] = ['Medição', 'Nota Fiscal'];

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
    default:
      return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (statusPagamento: string) => {
  if (statusPagamento === 'Pendente') {
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-amber-50 text-amber-700">{statusPagamento}</Badge>;
  } else if (statusPagamento === 'Pago') {
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-emerald-50 text-emerald-700">{statusPagamento}</Badge>;
  }
  return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{statusPagamento}</Badge>;
};

const getMedicaoNotaFiscalBadge = (medicaoNotaFiscal: string) => {
  if (medicaoNotaFiscal === 'Medição') {
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-sky-50 text-sky-700">{medicaoNotaFiscal}</Badge>;
  } else if (medicaoNotaFiscal === 'Nota Fiscal') {
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-violet-50 text-violet-700">{medicaoNotaFiscal}</Badge>;
  }
  return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{medicaoNotaFiscal}</Badge>;
};

export const FinanceiroGrid = ({
  corridas,
  onEdit,
  onView,
  onApprove,
  onReject,
  onStatusChange,
  onPaymentStatusChange,
  onMedicaoNotaFiscalChange,
}: FinanceiroGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {corridas.map((corrida) => (
        <Card key={corrida.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">OS {corrida.numeroOS || '-'} • {formatDateDDMMYYYY(corrida.dataServico)}</CardTitle>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" aria-label="Abrir menu de ações" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500">
                       <MoreVertical className="h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[220px]">
                    <DropdownMenuItem onClick={() => onView(corrida)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                    </DropdownMenuItem>
                    <WhatsAppButton
                      corrida={corrida}
                      trigger={
                        <DropdownMenuItem>
                          <MessageCircle className="mr-2 h-4 w-4" /> Enviar Zap
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem onClick={() => onEdit(corrida)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    {corrida.status === 'Aguardando Conferência' && (
                      <>
                        <DropdownMenuItem onClick={() => onApprove(corrida)}>
                          <Check className="mr-2 h-4 w-4" /> Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReject(corrida)}>
                          <X className="mr-2 h-4 w-4" /> Rejeitar
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Empresa</div>
                <div className="font-medium">{corrida.empresa || '-'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Motorista</div>
                <div>{corrida.motorista || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">Rota</div>
                <div className="whitespace-nowrap overflow-x-auto">{corrida.origem} → {corrida.destino}</div>
              </div>
              <div>
                <div className="text-muted-foreground">KM</div>
                <div>{corrida.kmTotal} km</div>
              </div>
              <div>
                <div className="text-muted-foreground">Valor</div>
                <div>{formatCurrency(corrida.valor ?? 0)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select
                value={corrida.status}
                onValueChange={(value: CorridaFinanceiro['status']) => onStatusChange(corrida.id, value)}
              >
                <SelectTrigger className="h-8 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500" aria-label="Alterar status">
                  <SelectValue>{getStatusBadge(corrida.status)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">{getStatusBadge(status)}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={corrida.statusPagamento}
                onValueChange={(value: CorridaFinanceiro['statusPagamento']) => onPaymentStatusChange(corrida.id, value)}
              >
                <SelectTrigger className="h-8 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500" aria-label="Alterar status de pagamento">
                  <SelectValue>{getPaymentStatusBadge(corrida.statusPagamento)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">{getPaymentStatusBadge(status)}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={corrida.medicaoNotaFiscal}
                onValueChange={(value: CorridaFinanceiro['medicaoNotaFiscal']) => onMedicaoNotaFiscalChange(corrida.id, value)}
              >
                <SelectTrigger className="h-8 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500" aria-label="Alterar medição/nota fiscal">
                  <SelectValue>{getMedicaoNotaFiscalBadge(corrida.medicaoNotaFiscal)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {medicaoNotaFiscalOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">{getMedicaoNotaFiscalBadge(status)}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};