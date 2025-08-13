
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Eye } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';

interface FinanceiroTableProps {
  corridas: CorridaFinanceiro[];
  onEdit: (corrida: CorridaFinanceiro) => void;
  onView: (corrida: CorridaFinanceiro) => void;
  onApprove: (corrida: CorridaFinanceiro) => void;
  onReject: (corrida: CorridaFinanceiro) => void;
  onStatusChange: (corridaId: number, status: CorridaFinanceiro['status']) => void;
  onPaymentStatusChange: (corridaId: number, statusPagamento: CorridaFinanceiro['statusPagamento']) => void;
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
        return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (statusPagamento: string) => {
    if (statusPagamento === 'Pendente') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
          {statusPagamento}
        </Badge>
      );
    } else if (statusPagamento === 'Pago') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
          {statusPagamento}
        </Badge>
      );
    }
    return <Badge variant="outline">{statusPagamento}</Badge>;
  };

  const getMedicaoNotaFiscalBadge = (medicaoNotaFiscal: string) => {
    if (medicaoNotaFiscal === 'Medição') {
      return (
        <Badge className="bg-blue-200 text-blue-900 border-blue-400 hover:bg-blue-300">
          {medicaoNotaFiscal}
        </Badge>
      );
    } else if (medicaoNotaFiscal === 'Nota Fiscal') {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200">
          {medicaoNotaFiscal}
        </Badge>
      );
    }
    return <Badge variant="outline">{medicaoNotaFiscal}</Badge>;
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Rota</TableHead>
            <TableHead>KM</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Observação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Status de Pagamento</TableHead>
            <TableHead>Medição / Nota Fiscal</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corridas.map((corrida) => (
            <TableRow key={corrida.id}>
              <TableCell>{new Date(corrida.dataServico).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell className="font-medium">{corrida.empresa}</TableCell>
              <TableCell>{corrida.motorista}</TableCell>
              <TableCell>{corrida.origem} → {corrida.destino}</TableCell>
              <TableCell>{corrida.kmTotal} km</TableCell>
              <TableCell>R$ {corrida.valor.toFixed(2)}</TableCell>
              <TableCell className="max-w-xs">
                {corrida.observacoes ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer">
                        {truncateText(corrida.observacoes)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-md whitespace-pre-wrap">{corrida.observacoes}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={corrida.status}
                  onValueChange={(value: CorridaFinanceiro['status']) => 
                    onStatusChange(corrida.id, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
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
                  <SelectTrigger className="w-[120px]">
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
                  <SelectTrigger className="w-[130px]">
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
                  <Button size="sm" variant="outline" onClick={() => onEdit(corrida)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <WhatsAppButton corrida={corrida} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};
