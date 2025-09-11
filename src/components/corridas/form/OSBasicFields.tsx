import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeInput24h } from '@/components/common/TimeInput24h';
interface OSBasicFieldsProps {
  formData: any;
  updateFormData: (field: string, value: string) => void;
}
export const OSBasicFields = ({
  formData,
  updateFormData
}: OSBasicFieldsProps) => {
  return <>
      {/* Hora OS e Número OS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Hora OS</Label>
          <Input value={formatTime24h(formData.horaOS)} readOnly className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label>N° da O.S</Label>
          <Input value={formData.numeroOS || ''} readOnly className="bg-gray-100" placeholder="Será preenchida automaticamente!" />
        </div>
      </div>

      {/* Horários e Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Hora Saída</Label>
          <TimeInput24h value={formData.horaSaida} onChange={(v) => updateFormData('horaSaida', v)} />
        </div>
        <div className="space-y-2">
          <Label>Hora Chegada</Label>
          <TimeInput24h value={formData.horaChegada} onChange={(v) => updateFormData('horaChegada', v)} />
        </div>
        <div className="space-y-2">
          <Label>Data</Label>
          <Input type="date" value={formData.data} onChange={e => updateFormData('data', e.target.value)} />
        </div>
      </div>

      {/* Quilometragem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>KM Início</Label>
          <Input type="number" value={formData.kmInicio} onChange={e => updateFormData('kmInicio', e.target.value)} placeholder="Ex: 50000" />
        </div>
        <div className="space-y-2">
          <Label>KM Final</Label>
          <Input type="number" value={formData.kmFinal} onChange={e => updateFormData('kmFinal', e.target.value)} placeholder="Ex: 50150" />
        </div>
      </div>
    </>;
};