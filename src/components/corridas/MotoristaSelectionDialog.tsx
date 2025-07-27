import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMotoristas } from '@/hooks/useMotoristas';

interface MotoristaSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (motoristaName: string) => void;
  corridaId?: number;
}

export const MotoristaSelectionDialog = ({ 
  open, 
  onOpenChange, 
  onSelect 
}: MotoristaSelectionDialogProps) => {
  const { motoristas } = useMotoristas();
  const [selectedMotorista, setSelectedMotorista] = useState('');

  const motoristasAprovados = motoristas.filter(motorista => 
    motorista.status === 'Aprovado'
  );

  const handleSelect = () => {
    if (selectedMotorista) {
      onSelect(selectedMotorista);
      onOpenChange(false);
      setSelectedMotorista('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedMotorista('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Motorista</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="motorista">Motorista</Label>
            <Select value={selectedMotorista} onValueChange={setSelectedMotorista}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motorista" />
              </SelectTrigger>
              <SelectContent>
                {motoristasAprovados.map((motorista) => (
                  <SelectItem key={motorista.id} value={motorista.nome}>
                    {motorista.nome} - {motorista.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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