
import { DocumentUploader } from '../DocumentUploader';

interface OSCostFieldsProps {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  comprovantes: {
    pedagio: File | null;
    estacionamento: File | null;
    hospedagem: File | null;
  };
  handleFileUpload: (tipo: 'pedagio' | 'estacionamento' | 'hospedagem', file: File | null) => void;
}

export const OSCostFields = ({ 
  formData, 
  updateFormData, 
  comprovantes, 
  handleFileUpload 
}: OSCostFieldsProps) => {
  return (
    <DocumentUploader 
      formData={formData}
      updateFormData={updateFormData}
      comprovantes={comprovantes}
      onFileUpload={handleFileUpload}
      title="Custos e Comprovantes - OS"
    />
  );
};
