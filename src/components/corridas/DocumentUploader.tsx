import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Car, Building, Hotel } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  comprovantes: {
    pedagio: File | null;
    estacionamento: File | null;
    hospedagem: File | null;
  };
  onFileUpload: (tipo: 'pedagio' | 'estacionamento' | 'hospedagem', file: File | null) => void;
  title?: string;
}

export const DocumentUploader = ({ 
  formData, 
  updateFormData, 
  comprovantes, 
  onFileUpload,
  title = "Custos e Comprovantes"
}: DocumentUploaderProps) => {
  
  const [dragStates, setDragStates] = useState({
    pedagio: false,
    estacionamento: false,
    hospedagem: false
  });

  const handleDragOver = (e: React.DragEvent, tipo: string) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [tipo]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, tipo: string) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [tipo]: false }));
  };

  const handleDrop = (e: React.DragEvent, tipo: 'pedagio' | 'estacionamento' | 'hospedagem') => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [tipo]: false }));
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(tipo, file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use JPG, PNG ou PDF.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (tipo: 'pedagio' | 'estacionamento' | 'hospedagem', file: File | null) => {
    if (file && !validateFile(file)) {
      return;
    }
    onFileUpload(tipo, file);
  };

  const removeFile = (tipo: 'pedagio' | 'estacionamento' | 'hospedagem') => {
    onFileUpload(tipo, null);
  };

  const costItems = [
    {
      key: 'pedagio' as const,
      label: 'Pedágio',
      icon: <Car className="h-5 w-5 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/30'
    },
    {
      key: 'estacionamento' as const,
      label: 'Estacionamento',
      icon: <Building className="h-5 w-5 text-green-600" />,
      color: 'border-green-200 bg-green-50/30'
    },
    {
      key: 'hospedagem' as const,
      label: 'Hospedagem',
      icon: <Hotel className="h-5 w-5 text-purple-600" />,
      color: 'border-purple-200 bg-purple-50/30'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {costItems.map((item) => (
            <div key={item.key} className={`p-4 rounded-lg border-2 transition-all ${item.color}`}>
              <div className="space-y-3">
                {/* Header com ícone e label */}
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <Label className="font-semibold text-base">{item.label}</Label>
                </div>

                {/* Campo de valor */}
                <div>
                  <Label className="text-sm text-gray-600">Valor (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData[item.key] || ''} 
                    onChange={e => updateFormData(item.key, e.target.value)}
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>

                {/* Área de upload */}
                <div>
                  <Label className="text-sm text-gray-600">Comprovante</Label>
                  <div
                    className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
                      ${dragStates[item.key] 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onDragOver={(e) => handleDragOver(e, item.key)}
                    onDragLeave={(e) => handleDragLeave(e, item.key)}
                    onDrop={(e) => handleDrop(e, item.key)}
                    onClick={() => document.getElementById(`${item.key}-file-input`)?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileSelect(item.key, e.target.files?.[0] || null)}
                      className="hidden"
                      id={`${item.key}-file-input`}
                    />
                    
                    {comprovantes[item.key] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {comprovantes[item.key]!.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(item.key);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <p>Clique ou arraste o arquivo</p>
                          <p className="text-xs mt-1">JPG, PNG ou PDF (máx. 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};