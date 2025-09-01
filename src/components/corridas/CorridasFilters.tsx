import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';

interface CorridasFiltersProps {
  startDate: string;
  endDate: string;
  motorista: string;
  numeroOS: string;
  motoristas: { id: number; nome: string }[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onMotoristaChange: (value: string) => void;
  onNumeroOSChange: (value: string) => void;
  onClear: () => void;
  // Novo: modo compacto para ocupar menos espaço
  compact?: boolean;
}

export const CorridasFilters = ({
  startDate,
  endDate,
  motorista,
  numeroOS,
  motoristas,
  onStartDateChange,
  onEndDateChange,
  onMotoristaChange,
  onNumeroOSChange,
  onClear,
  compact = false,
}: CorridasFiltersProps) => {
  return (
    <Card className={compact ? 'mb-3' : 'mb-4'}>
      <CardContent className={compact ? 'pt-3' : 'pt-6'}>
        <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'}>
          <div className="space-y-1">
            <Label htmlFor="startDate" className={compact ? 'text-xs text-gray-600' : ''}>Data Inicial</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className={compact ? 'h-9' : ''} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate" className={compact ? 'text-xs text-gray-600' : ''}>Data Final</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className={compact ? 'h-9' : ''} />
          </div>
          <div className="space-y-1">
            <Label className={compact ? 'text-xs text-gray-600' : ''}>Motorista</Label>
            <Select value={motorista} onValueChange={onMotoristaChange}>
              <SelectTrigger className={compact ? 'h-9' : ''}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {motoristas.map((m) => (
                  <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="numeroOS" className={compact ? 'text-xs text-gray-600' : ''}>Nº OS</Label>
            <Input id="numeroOS" placeholder="Buscar por Nº OS" value={numeroOS} onChange={(e) => onNumeroOSChange(e.target.value)} className={compact ? 'h-9' : ''} />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <Button variant="outline" onClick={onClear} className={compact ? 'h-9 px-3 text-sm' : ''}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};