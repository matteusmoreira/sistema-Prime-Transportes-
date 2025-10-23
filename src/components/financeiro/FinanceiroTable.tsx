
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Eye, Check, X } from 'lucide-react';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';
import { WhatsAppButton } from './WhatsAppButton';

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

export const FinanceiroTable: React.FC<FinanceiroTableProps> = ({
  corridas,
  onView,
  onEdit,
  onApprove,
  onReject,
  onStatusChange,
  onPaymentStatusChange,
  onMedicaoNotaFiscalChange,
}) => {
  // Top horizontal scrollbar synced with the table's scroll
  const tableRef = useRef<HTMLTableElement | null>(null);
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const [topScrollInnerWidth, setTopScrollInnerWidth] = useState<number>(0);

  useEffect(() => {
    const container = tableRef.current?.parentElement; // div with overflow-x from Table component
    const top = topScrollRef.current;
    if (!container || !top) return;

    const updateWidth = () => setTopScrollInnerWidth(container.scrollWidth);
    updateWidth();

    const onContainerScroll = () => {
      if (!top) return;
      top.scrollLeft = container.scrollLeft;
    };
    const onTopScroll = () => {
      container.scrollLeft = top.scrollLeft;
    };

    container.addEventListener('scroll', onContainerScroll, { passive: true });
    top.addEventListener('scroll', onTopScroll, { passive: true });
    window.addEventListener('resize', updateWidth);

    return () => {
      container.removeEventListener('scroll', onContainerScroll);
      top.removeEventListener('scroll', onTopScroll);
      window.removeEventListener('resize', updateWidth);
    };
  }, [corridas.length]);

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
    }
    if (statusPagamento === 'Pago') {
      return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-emerald-50 text-emerald-700">{statusPagamento}</Badge>;
    }
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{statusPagamento}</Badge>;
  };

  const getMedicaoNotaFiscalBadge = (medicaoNotaFiscal: string) => {
    if (medicaoNotaFiscal === 'Medição') {
      return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-sky-50 text-sky-700">{medicaoNotaFiscal}</Badge>;
    }
    if (medicaoNotaFiscal === 'Nota Fiscal') {
      return <Badge className="px-1.5 py-0 text-[10px] rounded-md border-0 bg-violet-50 text-violet-700">{medicaoNotaFiscal}</Badge>;
    }
    return <Badge className="px-1.5 py-0 text-[10px] rounded-md border bg-gray-50 text-gray-700 border-gray-200">{medicaoNotaFiscal}</Badge>;
  };

  const statusOptions: CorridaFinanceiro['status'][] = [
    'Aguardando Conferência',
    'Em Análise',
    'No Show',
    'Revisar',
    'Cancelada',
    'Aprovada',
  ];

  const paymentStatusOptions: CorridaFinanceiro['statusPagamento'][] = ['Pendente', 'Pago'];
  const medicaoNotaFiscalOptions: CorridaFinanceiro['medicaoNotaFiscal'][] = ['Medição', 'Nota Fiscal', 'Não Enviada'];

  return (
    <div className="w-full">
      <div ref={topScrollRef} className="w-full overflow-x-auto rounded-md border bg-muted/30 h-3 mb-2" aria-hidden="true">
        <div style={{ width: topScrollInnerWidth || 1000, height: '1px' }} />
      </div>

      <Table ref={tableRef} className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead>Nº OS</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Rota</TableHead>
            <TableHead>KM</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Status de Pagamento</TableHead>
            <TableHead>Medição / Nota Fiscal</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corridas.map((corrida) => (
            <TableRow key={corrida.id}>
              <TableCell>{corrida.numeroOS || '-'}</TableCell>
              <TableCell>{formatDateDDMMYYYY(corrida.dataServico)}</TableCell>
              <TableCell className="font-medium max-w-[220px] truncate" title={corrida.empresa}>{corrida.empresa}</TableCell>
              <TableCell>{corrida.motorista}</TableCell>
              <TableCell className="max-w-[280px] truncate" title={`${corrida.origem} → ${corrida.destino}`}>{corrida.origem} → {corrida.destino}</TableCell>
              <TableCell>{corrida.kmTotal} km</TableCell>
              <TableCell>{formatCurrency(corrida.valor ?? 0)}</TableCell>

              <TableCell>
                <Select
                  value={corrida.status}
                  onValueChange={(value: CorridaFinanceiro['status']) => onStatusChange(corrida.id, value)}
                >
                  <SelectTrigger className="h-7 min-w-[120px] sm:min-w-[160px] rounded-md px-2 py-0 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500" aria-label="Alterar status">
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
              </TableCell>

              <TableCell>
                <Select
                  value={corrida.statusPagamento}
                  onValueChange={(value: CorridaFinanceiro['statusPagamento']) => onPaymentStatusChange(corrida.id, value)}
                >
                  <SelectTrigger className="h-7 min-w-[100px] sm:min-w-[120px] rounded-md px-2 py-0 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500" aria-label="Alterar status de pagamento">
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
              </TableCell>

              <TableCell>
                <Select
                  value={corrida.medicaoNotaFiscal}
                  onValueChange={(value: CorridaFinanceiro['medicaoNotaFiscal']) => onMedicaoNotaFiscalChange(corrida.id, value)}
                >
                  <SelectTrigger className="h-7 min-w-[120px] sm:min-w-[140px] rounded-md px-2 py-0 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500" aria-label="Alterar medição/nota fiscal">
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
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onView(corrida)} aria-label="Visualizar corrida" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Visualizar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(corrida)} aria-label="Editar corrida" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onApprove(corrida)} aria-label="Aprovar corrida" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500">
                        <Check className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Aprovar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onReject(corrida)} aria-label="Rejeitar corrida" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500">
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rejeitar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <WhatsAppButton corrida={corrida} />
                    </TooltipTrigger>
                    <TooltipContent>Enviar WhatsApp</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
