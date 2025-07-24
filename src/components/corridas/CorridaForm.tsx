
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Corrida, DocumentoUpload } from '@/types/corridas';
import { useFormData } from '@/hooks/useFormData';
import { DadosBasicos } from './form/DadosBasicos';
import { DataHorario } from './form/DataHorario';
import { LocalizacaoForm } from './form/LocalizacaoForm';
import { CustosForm } from './form/CustosForm';
import { DocumentosUpload } from './form/DocumentosUpload';
interface CorridaFormProps {
  editingCorrida: Corrida | null;
  onSubmit: (formData: any, documentos: DocumentoUpload[]) => void;
  onCancel: () => void;
  isFillingOS?: boolean;
  userLevel?: string;
}
export const CorridaForm = ({
  editingCorrida,
  onSubmit,
  onCancel,
  isFillingOS = false,
  userLevel = 'Administrador'
}: CorridaFormProps) => {
  const {
    formData,
    updateFormData
  } = useFormData(editingCorrida);
  const [documentos, setDocumentos] = useState<DocumentoUpload[]>(editingCorrida?.documentos || []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do formulário sendo enviados:', formData);
    onSubmit(formData, documentos);
  };
  const isReadOnly = (field: string) => {
    // Se for preenchimento de OS, alguns campos ficam readonly
    if (isFillingOS && userLevel === 'Motorista') {
      const readOnlyFields = ['empresa', 'solicitante', 'motorista', 'dataServico'];
      return readOnlyFields.includes(field);
    }
    return false;
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <DadosBasicos formData={formData} onFormChange={updateFormData} readOnly={isFillingOS && userLevel === 'Motorista'} />

      {/* Nº da Ordem de Serviço */}
      <div className="space-y-2">
        <Label>Nº da Ordem de Serviço</Label>
        <Input value={formData.numeroOS} onChange={e => updateFormData('numeroOS', e.target.value)} placeholder="Ex: OS-2024-001" readOnly={isReadOnly('numeroOS')} />
      </div>

      {/* Projeto, Motivo e Veículo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Projeto</Label>
          <Input value={formData.projeto} onChange={e => updateFormData('projeto', e.target.value)} placeholder="Digite o nome do projeto" readOnly={isReadOnly('projeto')} />
        </div>
        <div className="space-y-2">
          <Label>Motivo</Label>
          <Input value={formData.motivo} onChange={e => updateFormData('motivo', e.target.value)} placeholder="Digite o motivo da viagem" readOnly={isReadOnly('motivo')} />
        </div>
        <div className="space-y-2">
          <Label>Veículo</Label>
          <Select value={formData.veiculo || ""} onValueChange={(value) => updateFormData('veiculo', value)} disabled={isReadOnly('veiculo')}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onibus">Ônibus</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="carro">Carro</SelectItem>
              <SelectItem value="pick-up">Pick-up</SelectItem>
              <SelectItem value="caminhao">Caminhão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataHorario formData={formData} onFormChange={updateFormData} readOnly={isFillingOS && userLevel === 'Motorista'} />
      
      <LocalizacaoForm formData={formData} onFormChange={updateFormData} readOnly={isReadOnly} />

      {/* Quilometragem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        
        
      </div>

      <CustosForm formData={formData} onFormChange={updateFormData} />

      {/* Custos Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        
        
      </div>

      {/* Passageiros */}
      <div className="space-y-2">
        <Label>Passageiros</Label>
        <Textarea value={formData.passageiros} onChange={e => updateFormData('passageiros', e.target.value)} rows={4} placeholder="Cole aqui a lista de passageiros (um por linha)&#10;Ex:&#10;João Silva&#10;Maria Costa&#10;Pedro Santos" />
      </div>

      <DocumentosUpload documentos={documentos} onDocumentosChange={setDocumentos} />

      {/* Observações */}
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea value={formData.observacoes} onChange={e => updateFormData('observacoes', e.target.value)} rows={3} />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isFillingOS ? 'Enviar OS' : editingCorrida ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>;
};
