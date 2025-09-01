import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const sizeClasses: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  xs: 'px-1.5 py-0 text-[10px] rounded-md',
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-0.5 text-sm rounded-md',
};

const statusClasses: Record<string, string> = {
  'Aguardando Conferência': 'bg-sky-50 text-sky-700 border-0',
  'Em Análise': 'bg-amber-50 text-amber-700 border-0',
  'Aprovada': 'bg-emerald-50 text-emerald-700 border-0',
  'Revisar': 'bg-sky-50 text-sky-700 border-0',
  'Cancelada': 'bg-rose-50 text-rose-700 border-0',
  'No Show': 'bg-zinc-800 text-white border-0',
  'Selecionar Motorista': 'bg-rose-50 text-rose-700 border-0',
  'Pendente': 'bg-yellow-50 text-yellow-700 border-0',
  'Aguardando OS': 'bg-blue-50 text-blue-700 border-0',
  'Concluída': 'bg-emerald-50 text-emerald-700 border-0',
};

export const StatusBadge = ({ status, size = 'xs', className = '' }: StatusBadgeProps) => {
  const base = sizeClasses[size];
  const color = status ? (statusClasses[status] || 'bg-gray-50 text-gray-700 border border-gray-200') : 'bg-gray-50 text-gray-700 border border-gray-200';
  return (
    <Badge className={`${base} ${color} ${className}`}>{status || '-'}</Badge>
  );
};

export default StatusBadge;