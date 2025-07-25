import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, Image, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCpfValidation } from '@/hooks/useCpfValidation';

interface MotoristaFormData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cnh: string;
  cnhDataValidade: string;
}

interface DocumentoUpload {
  id: string;
  nome: string;
  descricao: string;
  arquivo?: File;
}

interface FotoVeiculoUpload {
  id: string;
  nome: string;
  arquivo?: File;
  tamanho: number;
}

interface MotoristaFormProps {
  formData: MotoristaFormData;
  onInputChange: (field: keyof MotoristaFormData, value: string) => void;
  onFileChange: (documentos: DocumentoUpload[]) => void;
  onFotosChange: (fotos: FotoVeiculoUpload[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  documentos?: DocumentoUpload[];
  fotosVeiculo?: FotoVeiculoUpload[];
  motoristaId?: number;
}

export const MotoristaForm = ({ 
  formData, 
  onInputChange, 
  onFileChange, 
  onFotosChange,
  onSubmit, 
  onCancel, 
  isEditing,
  documentos = [],
  fotosVeiculo = [],
  motoristaId
}: MotoristaFormProps) => {
  const [documentosLocal, setDocumentosLocal] = useState<DocumentoUpload[]>(documentos);
  const [fotosLocal, setFotosLocal] = useState<FotoVeiculoUpload[]>(fotosVeiculo);
  
  // CPF validation hook
  const { isValid: isCpfValid, isDuplicate, isChecking, error: cpfError, formatCpf } = useCpfValidation(
    formData.cpf, 
    motoristaId
  );

  // Format phone number
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // Handle CPF input with formatting
  const handleCpfChange = (value: string) => {
    const formatted = formatCpf(value);
    onInputChange('cpf', formatted);
  };

  // Handle phone input with formatting
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    onInputChange('telefone', formatted);
  };

  // Enhanced form validation
  const isFormValid = () => {
    const hasRequiredFields = formData.nome && formData.email && formData.cpf && formData.telefone;
    const cpfValid = formData.cpf ? isCpfValid && !isDuplicate : true;
    return hasRequiredFields && cpfValid && !isChecking;
  };

  const adicionarDocumento = () => {
    const novoDoc: DocumentoUpload = {
      id: Date.now().toString(),
      nome: '',
      descricao: ''
    };
    const novosDocumentos = [...documentosLocal, novoDoc];
    setDocumentosLocal(novosDocumentos);
    onFileChange(novosDocumentos);
  };

  const atualizarDocumento = (id: string, campo: keyof DocumentoUpload, valor: any) => {
    const novosDocumentos = documentosLocal.map(doc => doc.id === id ? {
      ...doc,
      [campo]: valor
    } : doc);
    setDocumentosLocal(novosDocumentos);
    onFileChange(novosDocumentos);
  };

  const removerDocumento = (id: string) => {
    const novosDocumentos = documentosLocal.filter(doc => doc.id !== id);
    setDocumentosLocal(novosDocumentos);
    onFileChange(novosDocumentos);
  };

  const adicionarFoto = (files: FileList | null) => {
    if (!files) return;

    const fotosArray = Array.from(files);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_TOTAL_SIZE = 150 * 1024 * 1024; // 150MB
    const MAX_FILES = 15;

    // Verificar número máximo de arquivos
    if (fotosLocal.length + fotosArray.length > MAX_FILES) {
      toast.error(`Máximo de ${MAX_FILES} fotos permitidas`);
      return;
    }

    // Verificar tamanho individual e total
    let tamanhoAtual = fotosLocal.reduce((total, foto) => total + foto.tamanho, 0);
    const fotosValidas: FotoVeiculoUpload[] = [];

    for (const file of fotosArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} excede o tamanho máximo de 10MB`);
        continue;
      }

      if (tamanhoAtual + file.size > MAX_TOTAL_SIZE) {
        toast.error('Tamanho total das fotos excede 150MB');
        break;
      }

      // Verificar se é imagem
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é um arquivo de imagem válido`);
        continue;
      }

      fotosValidas.push({
        id: Date.now().toString() + Math.random(),
        nome: file.name,
        arquivo: file,
        tamanho: file.size
      });

      tamanhoAtual += file.size;
    }

    if (fotosValidas.length > 0) {
      const novasFotos = [...fotosLocal, ...fotosValidas];
      setFotosLocal(novasFotos);
      onFotosChange(novasFotos);
      toast.success(`${fotosValidas.length} foto(s) adicionada(s)`);
    }
  };

  const removerFoto = (id: string) => {
    const novasFotos = fotosLocal.filter(foto => foto.id !== id);
    setFotosLocal(novasFotos);
    onFotosChange(novasFotos);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTamanhoTotal = () => {
    return fotosLocal.reduce((total, foto) => total + foto.tamanho, 0);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => onInputChange('nome', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF *</Label>
        <div className="relative">
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
            className={`pr-10 ${
              formData.cpf && cpfError ? 'border-red-500' : 
              formData.cpf && isCpfValid && !isDuplicate ? 'border-green-500' : ''
            }`}
          />
          {isChecking && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
          )}
          {!isChecking && formData.cpf && cpfError && (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
          )}
          {!isChecking && formData.cpf && isCpfValid && !isDuplicate && (
            <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {cpfError && (
          <p className="text-sm text-red-500">{cpfError}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone *</Label>
        <Input
          id="telefone"
          value={formData.telefone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(00) 00000-0000"
          maxLength={15}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnh">CNH</Label>
          <Input
            id="cnh"
            value={formData.cnh}
            onChange={(e) => onInputChange('cnh', e.target.value)}
            placeholder="Número da CNH"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnhDataValidade">Data de Validade da CNH</Label>
          <Input
            id="cnhDataValidade"
            type="date"
            value={formData.cnhDataValidade}
            onChange={(e) => onInputChange('cnhDataValidade', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Documentos</Label>
          <Button type="button" onClick={adicionarDocumento} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Documento
          </Button>
        </div>
        
        {documentosLocal.map(doc => (
          <div key={doc.id} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Documento</Label>
                <Input 
                  value={doc.nome} 
                  onChange={e => atualizarDocumento(doc.id, 'nome', e.target.value)} 
                  placeholder="Ex: CNH, RG, Comprovante de Residência" 
                />
              </div>
              <div className="space-y-2">
                <Label>Arquivo</Label>
                <Input 
                  type="file" 
                  onChange={e => atualizarDocumento(doc.id, 'arquivo', e.target.files?.[0])} 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea 
                value={doc.descricao} 
                onChange={e => atualizarDocumento(doc.id, 'descricao', e.target.value)} 
                placeholder="Descreva o documento (ex: CNH categoria B válida até 2025)" 
                rows={2} 
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => removerDocumento(doc.id)} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {documentosLocal.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum documento adicionado. Clique em "Adicionar Documento" para começar.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-lg">Fotos do Veículo</Label>
            <p className="text-sm text-gray-500">
              Máximo 15 fotos, 10MB cada (Total: {formatFileSize(getTamanhoTotal())}/150MB)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {fotosLocal.length}/15 fotos
            </span>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('foto-input')?.click()}
              disabled={fotosLocal.length >= 15}
            >
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Fotos
            </Button>
            <input
              id="foto-input"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => adicionarFoto(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {fotosLocal.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotosLocal.map(foto => (
              <div key={foto.id} className="relative border rounded-lg p-2 bg-gray-50">
                <div className="aspect-square bg-gray-200 rounded flex items-center justify-center mb-2">
                  {foto.arquivo && (
                    <img
                      src={URL.createObjectURL(foto.arquivo)}
                      alt={foto.nome}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                  {!foto.arquivo && (
                    <Image className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <p className="text-xs font-medium truncate" title={foto.nome}>
                  {foto.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(foto.tamanho)}
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removerFoto(foto.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {fotosLocal.length === 0 && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => document.getElementById('foto-input')?.click()}
          >
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-2">
              Clique aqui ou arraste fotos do veículo para adicionar
            </p>
            <p className="text-xs text-gray-400">
              Formatos aceitos: JPG, PNG, WEBP (máx. 10MB cada)
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isFormValid()}>
          {isEditing ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};
