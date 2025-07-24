
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataHorarioProps {
  formData: {
    dataServico: string;
    horaInicio: string;
    tipoAbrangencia: string;
  };
  onFormChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const DataHorario = ({ formData, onFormChange, readOnly = false }: DataHorarioProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Data do Serviço *</Label>
        <Input 
          type="date" 
          value={formData.dataServico} 
          onChange={e => onFormChange('dataServico', e.target.value)} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Hora Início *</Label>
        <Input 
          type="time" 
          value={formData.horaInicio} 
          onChange={e => onFormChange('horaInicio', e.target.value)} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Tipo de abrangência *</Label>
        <Select 
          value={formData.tipoAbrangencia} 
          onValueChange={(value) => onFormChange('tipoAbrangencia', value)}
          disabled={readOnly}
        >
          <SelectTrigger className={readOnly ? "bg-gray-100" : ""}>
            <SelectValue placeholder="Selecione o tipo de abrangência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Municipal">Municipal</SelectItem>
            <SelectItem value="Intermunicipal">Intermunicipal</SelectItem>
            <SelectItem value="Interestadual">Interestadual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
