
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerBR } from '@/components/common/DatePickerBR';
import { Input } from '@/components/ui/input';
import { formatTime24h } from '@/utils/timeFormatter';
import { TimeInput24h } from '@/components/common/TimeInput24h';

type DataHorarioProps = {
  formData: { dataServico: string; horaInicio: string; tipoAbrangencia: string };
  onFormChange: (field: string, value: string) => void;
  readOnly?: boolean;
};

export const DataHorario: React.FC<DataHorarioProps> = ({ formData, onFormChange, readOnly }) => {
  const set = (field: keyof DataHorarioProps['formData']) => (value: string) => {
    console.log('[DataHorario] change', field, value);
    onFormChange(field, value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Data do Serviço *</Label>
        <DatePickerBR value={formData.dataServico} onChange={set('dataServico')} readOnly={!!readOnly} />
      </div>

      <div className="space-y-2">
        <Label>Hora Início *</Label>
        {readOnly ? (
          <Input value={formatTime24h(formData.horaInicio || '')} readOnly className="bg-gray-100" />
        ) : (
          <TimeInput24h value={formData.horaInicio || ''} onChange={set('horaInicio')} />
        )}
      </div>

      <div className="space-y-2">
        <Label>Tipo de abrangência *</Label>
        <Select value={formData.tipoAbrangencia || ''} onValueChange={set('tipoAbrangencia')} disabled={!!readOnly}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de abrangência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="municipal">Municipal</SelectItem>
            <SelectItem value="intermunicipal">Intermunicipal</SelectItem>
            <SelectItem value="interestadual">Interestadual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
