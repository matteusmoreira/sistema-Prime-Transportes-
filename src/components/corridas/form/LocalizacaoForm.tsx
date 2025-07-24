
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocalizacaoFormProps {
  formData: {
    origem: string;
    destino: string;
    destinoExtra: string;
  };
  onFormChange: (field: string, value: string) => void;
  readOnly?: (field: string) => boolean;
}

export const LocalizacaoForm = ({ formData, onFormChange, readOnly }: LocalizacaoFormProps) => {
  const isFieldReadOnly = (field: string) => readOnly ? readOnly(field) : false;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Origem *</Label>
          <Input 
            value={formData.origem} 
            onChange={e => onFormChange('origem', e.target.value)} 
            placeholder="Cidade - Estado" 
            readOnly={isFieldReadOnly('origem')}
            className={isFieldReadOnly('origem') ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label>Destino *</Label>
          <Input 
            value={formData.destino} 
            onChange={e => onFormChange('destino', e.target.value)} 
            placeholder="Cidade - Estado" 
            readOnly={isFieldReadOnly('destino')}
            className={isFieldReadOnly('destino') ? "bg-gray-100" : ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Destino Extra</Label>
        <Input 
          value={formData.destinoExtra} 
          onChange={e => onFormChange('destinoExtra', e.target.value)} 
          placeholder="Paradas adicionais durante a viagem" 
          readOnly={isFieldReadOnly('destinoExtra')}
          className={isFieldReadOnly('destinoExtra') ? "bg-gray-100" : ""}
        />
      </div>
    </>
  );
};
