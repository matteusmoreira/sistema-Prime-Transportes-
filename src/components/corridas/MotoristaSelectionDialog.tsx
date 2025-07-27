import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useMotoristas } from '@/hooks/useMotoristas';

interface MotoristaSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (motoristaName: string, veiculo?: string) => void;
  corridaId?: number;
}

export const MotoristaSelectionDialog = ({ 
  open, 
  onOpenChange, 
  onSelect 
}: MotoristaSelectionDialogProps) => {
  const { motoristas } = useMotoristas();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMotorista, setSelectedMotorista] = useState('');
  const [selectedVeiculo, setSelectedVeiculo] = useState('');

  const filteredMotoristas = motoristas.filter(motorista => 
    motorista.status === 'Aprovado' &&
    motorista.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedMotorista) {
      onSelect(selectedMotorista, selectedVeiculo || undefined);
      onOpenChange(false);
      setSelectedMotorista('');
      setSelectedVeiculo('');
      setSearchTerm('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedMotorista('');
    setSelectedVeiculo('');
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Motorista</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Buscar Motorista</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Digite o nome do motorista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="motorista">Motorista</Label>
            <Select value={selectedMotorista} onValueChange={setSelectedMotorista}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motorista" />
              </SelectTrigger>
              <SelectContent>
                {filteredMotoristas.map((motorista) => (
                  <SelectItem key={motorista.id} value={motorista.nome}>
                    {motorista.nome} - {motorista.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="veiculo">Veículo (Opcional)</Label>
            <Input
              id="veiculo"
              placeholder="Ex: Honda Civic - ABC-1234"
              value={selectedVeiculo}
              onChange={(e) => setSelectedVeiculo(e.target.value)}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSelect} 
              disabled={!selectedMotorista}
              className="flex-1"
            >
              Selecionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};