
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, RotateCcw, Building, Users } from 'lucide-react';

interface VoucherFiltersProps {
  startDate: string;
  endDate: string;
  selectedEmpresa: string;
  passageirosFilter: string;
  empresas: string[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEmpresaChange: (empresa: string) => void;
  onPassageirosChange: (passageiros: string) => void;
}

export const VoucherFilters = ({
  startDate,
  endDate,
  selectedEmpresa,
  passageirosFilter,
  empresas,
  onStartDateChange,
  onEndDateChange,
  onEmpresaChange,
  onPassageirosChange
}: VoucherFiltersProps) => {
  const clearFilters = () => {
    onStartDateChange('');
    onEndDateChange('');
    onEmpresaChange('all');
    onPassageirosChange('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Empresa
            </Label>
            <Select value={selectedEmpresa} onValueChange={onEmpresaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa} value={empresa}>
                    {empresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passageiros" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Passageiros
            </Label>
            <Input
              id="passageiros"
              type="text"
              placeholder="Digite pelo menos 3 letras..."
              value={passageirosFilter}
              onChange={(e) => onPassageirosChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
