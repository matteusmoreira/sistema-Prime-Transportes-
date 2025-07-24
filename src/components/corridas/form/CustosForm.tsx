
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustosFormProps {
  formData: {
    valor: string;
    valorMotorista: string;
    pedagio: string;
    estacionamento: string;
    hospedagem: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export const CustosForm = ({
  formData,
  onFormChange
}: CustosFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Valor Total (R$)</Label>
        <Input 
          type="number" 
          step="0.01" 
          value={formData.valor} 
          onChange={e => onFormChange('valor', e.target.value)} 
          placeholder="0.00"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Valor para o Motorista (R$)</Label>
        <Input 
          type="number" 
          step="0.01" 
          value={formData.valorMotorista} 
          onChange={e => onFormChange('valorMotorista', e.target.value)} 
          placeholder="0.00" 
        />
      </div>
    </div>
  );
};
