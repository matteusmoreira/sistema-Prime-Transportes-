import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, FileEdit, Edit, MoreVertical } from 'lucide-react';
import { Corrida } from '@/types/corridas';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';
import StatusBadge from '@/components/corridas/StatusBadge';

interface CorridaCardProps {
  corrida: Corrida;
  userLevel: string;
  onView: (corrida: Corrida) => void;
  onEdit: (corrida: Corrida) => void;
  onFillOS: (corrida: Corrida) => void;
}

const CorridaCard: React.FC<CorridaCardProps> = ({ corrida, userLevel, onView, onEdit, onFillOS }) => {
  const podePreencherOS = (corrida.status === 'Aguardando Conferência' || corrida.status === 'Pendente' || corrida.status === 'Aguardando OS')
    && !corrida.preenchidoPorMotorista && !corrida.preenchidoPorFinanceiro;

  const showEdit = userLevel === 'Administrador' || userLevel === 'Administração' || userLevel === 'Financeiro';
  const valorLabel = userLevel === 'Motorista' ? 'Valor a Receber' : 'Valor Total';
  const valor = userLevel === 'Motorista' ? (corrida.valorMotorista ?? 0) : (corrida.valor ?? 0);

  return (
    <Card className="p-4 space-y-3 shadow-sm border-border bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">OS {corrida.numeroOS || '-'}</div>
          <div className="text-base font-semibold text-foreground">{corrida.empresa}</div>
          <div className="text-xs text-muted-foreground">{formatDateDDMMYYYY(corrida.dataServico || corrida.data)}</div>
        </div>
        <StatusBadge status={corrida.status} size="sm" />
      </div>

      <div className="text-sm text-foreground">
        <div className="font-medium">{corrida.origem} → {corrida.destino}</div>
        {corrida.preenchidoPorFinanceiro && (
          <div className="mt-1 text-[11px] text-indigo-700 bg-indigo-50 inline-flex px-2 py-0.5 rounded border border-indigo-200">Conferenciado pelo Financeiro</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{valorLabel}</div>
        <div className="text-base font-semibold">{formatCurrency(valor)}</div>
      </div>

      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" aria-label="Abrir menu de ações da corrida" title="Ações">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuItem onClick={() => onView(corrida)} aria-label="Ver detalhes da corrida">
              <Eye className="mr-2 h-4 w-4" /> Ver detalhes
            </DropdownMenuItem>
            {podePreencherOS && (
              <DropdownMenuItem onClick={() => onFillOS(corrida)} aria-label="Preencher Ordem de Serviço">
                <FileEdit className="mr-2 h-4 w-4" /> Preencher OS
              </DropdownMenuItem>
            )}
            {showEdit && (
              <DropdownMenuItem onClick={() => onEdit(corrida)} aria-label="Editar corrida">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default CorridaCard;
export { CorridaCard };