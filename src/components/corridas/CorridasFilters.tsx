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
}: CorridasFiltersProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Motorista</Label>
            <Select value={motorista} onValueChange={onMotoristaChange}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label htmlFor="numeroOS">Nº OS</Label>
            <Input id="numeroOS" placeholder="Buscar por Nº OS" value={numeroOS} onChange={(e) => onNumeroOSChange(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClear}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};