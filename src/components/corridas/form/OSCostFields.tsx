
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

interface OSCostFieldsProps {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  comprovantes: any;
  handleFileUpload: (tipo: string, file: File | null) => void;
}

export const OSCostFields = ({ 
  formData, 
  updateFormData, 
  comprovantes, 
  handleFileUpload 
}: OSCostFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Pedágio (R$)</Label>
        <Input 
          type="number" 
          step="0.01" 
          value={formData.pedagio} 
          onChange={e => updateFormData('pedagio', e.target.value)}
          placeholder="0.00"
        />
        <div className="mt-2">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload('pedagio', e.target.files?.[0] || null)}
            className="hidden"
            id="pedagio-file"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('pedagio-file')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Anexar Comprovante
          </Button>
          {comprovantes.pedagio && (
            <p className="text-sm text-green-600 mt-1">
              <FileText className="h-4 w-4 inline mr-1" />
              {comprovantes.pedagio.name}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Estacionamento (R$)</Label>
        <Input 
          type="number" 
          step="0.01" 
          value={formData.estacionamento} 
          onChange={e => updateFormData('estacionamento', e.target.value)}
          placeholder="0.00"
        />
        <div className="mt-2">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload('estacionamento', e.target.files?.[0] || null)}
            className="hidden"
            id="estacionamento-file"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('estacionamento-file')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Anexar Comprovante
          </Button>
          {comprovantes.estacionamento && (
            <p className="text-sm text-green-600 mt-1">
              <FileText className="h-4 w-4 inline mr-1" />
              {comprovantes.estacionamento.name}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Hospedagem (R$)</Label>
        <Input 
          type="number" 
          step="0.01" 
          value={formData.hospedagem} 
          onChange={e => updateFormData('hospedagem', e.target.value)}
          placeholder="0.00"
        />
        <div className="mt-2">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload('hospedagem', e.target.files?.[0] || null)}
            className="hidden"
            id="hospedagem-file"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('hospedagem-file')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Anexar Comprovante
          </Button>
          {comprovantes.hospedagem && (
            <p className="text-sm text-green-600 mt-1">
              <FileText className="h-4 w-4 inline mr-1" />
              {comprovantes.hospedagem.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
