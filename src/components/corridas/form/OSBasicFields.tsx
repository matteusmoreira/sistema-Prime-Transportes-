import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
          <Label>Hora O.S</Label>
          <Input type="time" value={formData.horaOS} onChange={e => updateFormData('horaOS', e.target.value)} readOnly className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label>N° da O.S</Label>
          <Input value={formData.numeroOS} readOnly className="bg-gray-100" placeholder="Dados vindos do formulário do admin" />
          
        </div>
      </div>

      {/* Horários e Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Hora Saída</Label>
          <Input type="time" value={formData.horaSaida} onChange={e => updateFormData('horaSaida', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Hora Chegada</Label>
          <Input type="time" value={formData.horaChegada} onChange={e => updateFormData('horaChegada', e.target.value)} />
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