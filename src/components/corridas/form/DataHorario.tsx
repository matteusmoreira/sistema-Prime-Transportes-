
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerBR } from '@/components/common/DatePickerBR';
import { TimeInputAmPm } from '@/components/common/TimeInputAmPm';

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
        {/* DatePicker com exibição dd/mm/aaaa e armazenamento ISO */}
        <DatePickerBR 
          value={formData.dataServico}
          onChange={(v) => onFormChange('dataServico', v)}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <Label>Hora Início *</Label>
        {/* Entrada de hora com AM/PM automático */}
        <TimeInputAmPm 
          value24h={formData.horaInicio}
          onChange24h={(v) => onFormChange('horaInicio', v)}
          readOnly={readOnly}
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
