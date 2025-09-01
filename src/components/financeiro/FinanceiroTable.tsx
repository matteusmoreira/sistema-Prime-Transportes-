
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Eye } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';

interface FinanceiroTableProps {
  corridas: CorridaFinanceiro[];
  onEdit: (corrida: CorridaFinanceiro) => void;
  onView: (corrida: CorridaFinanceiro) => void;
  onApprove: (corrida: CorridaFinanceiro) => void;
  onReject: (corrida: CorridaFinanceiro) => void;
  onStatusChange: (corridaId: number, status: CorridaFinanceiro['status']) => void;
  onPaymentStatusChange: (corridaId: number, status: CorridaFinanceiro['statusPagamento']) => void;
  onMedicaoNotaFiscalChange: (corridaId: number, medicaoNotaFiscal: CorridaFinanceiro['medicaoNotaFiscal']) => void;
}

export const FinanceiroTable = ({ 
  corridas, 
  onEdit, 
  onView,
  onApprove, 
  onReject, 
  onStatusChange,
  onPaymentStatusChange,
  onMedicaoNotaFiscalChange
}: FinanceiroTableProps) => {
  // Removidos logs de debug de renderização
  
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
      return (
        <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-amber-50 text-amber-700">
          {statusPagamento}
        </Badge>
      );
    } else if (statusPagamento === 'Pago') {
      return (
        <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-emerald-50 text-emerald-700">
          {statusPagamento}
        </Badge>
      );
    }
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{statusPagamento}</Badge>;
  };

  const getMedicaoNotaFiscalBadge = (medicaoNotaFiscal: string) => {
    if (medicaoNotaFiscal === 'Medição') {
      return (
        <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-sky-50 text-sky-700">
          {medicaoNotaFiscal}
        </Badge>
      );
    } else if (medicaoNotaFiscal === 'Nota Fiscal') {
      return (
        <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-violet-50 text-violet-700">
          {medicaoNotaFiscal}
        </Badge>
      );
    }
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{medicaoNotaFiscal}</Badge>;
  };

  const statusOptions: CorridaFinanceiro['status'][] = [
    'Aguardando Conferência',
    'Em Análise', 
    'No Show',
    'Revisar',
    'Cancelada',
    'Aprovada'
  ];

  const paymentStatusOptions: CorridaFinanceiro['statusPagamento'][] = [
    'Pendente',
    'Pago'
  ];

  const medicaoNotaFiscalOptions: CorridaFinanceiro['medicaoNotaFiscal'][] = [
    'Medição',
    'Nota Fiscal'
  ];

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>Rota</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Valor</TableHead>
              {/* Coluna Observação removida para interface mais clean */}
              <TableHead>Status</TableHead>
              <TableHead>Status de Pagamento</TableHead>
              <TableHead>Medição / Nota Fiscal</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {corridas.map((corrida) => (
              <TableRow key={corrida.id}>
                <TableCell>{formatDateDDMMYYYY(corrida.dataServico)}</TableCell>
                <TableCell className="font-medium">{corrida.empresa}</TableCell>
                <TableCell>{corrida.motorista}</TableCell>
                <TableCell>{corrida.origem} → {corrida.destino}</TableCell>
                <TableCell>{corrida.kmTotal} km</TableCell>
                <TableCell>{formatCurrency(corrida.valor ?? 0)}</TableCell>
                {/* Célula Observação removida */}
                <TableCell>
                  <Select
                    value={corrida.status}
                    onValueChange={(value: CorridaFinanceiro['status']) => 
                      onStatusChange(corrida.id, value)
                    }
                  >
                    <SelectTrigger className="h-7 min-w-[120px] sm:min-w-[160px] rounded-md px-2 py-0 text-xs">
                      <SelectValue>
                        {getStatusBadge(corrida.status)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            {getStatusBadge(status)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={corrida.statusPagamento}
                    onValueChange={(value: CorridaFinanceiro['statusPagamento']) => 
                      onPaymentStatusChange(corrida.id, value)
                    }
                  >
                    <SelectTrigger className="h-7 min-w-[100px] sm:min-w-[120px] rounded-md px-2 py-0 text-xs">
                      <SelectValue>
                        {getPaymentStatusBadge(corrida.statusPagamento)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            {getPaymentStatusBadge(status)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={corrida.medicaoNotaFiscal}
                    onValueChange={(value: CorridaFinanceiro['medicaoNotaFiscal']) => 
                      onMedicaoNotaFiscalChange(corrida.id, value)
                    }
                  >
                    <SelectTrigger className="h-7 min-w-[120px] sm:min-w-[140px] rounded-md px-2 py-0 text-xs">
                      <SelectValue>
                        {getMedicaoNotaFiscalBadge(corrida.medicaoNotaFiscal)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {medicaoNotaFiscalOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            {getMedicaoNotaFiscalBadge(status)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onView(corrida)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      // Removidos logs de debug de clique no botão Editar
                      try {
                        onEdit(corrida);
                        // sucesso silencioso
                      } catch (error) {
                        console.error('Erro ao acionar edição da corrida:', error);
                      }
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <WhatsAppButton corrida={corrida} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
