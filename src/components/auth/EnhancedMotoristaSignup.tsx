import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, Image, X, CheckCircle, AlertCircle, Loader2, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useCpfValidation } from '@/hooks/useCpfValidation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

interface MotoristaSignupData {
  nome: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  cnh: string;
  cnhDataValidade: string;
  documentos: DocumentoUpload[];
  fotosVeiculo: FotoVeiculoUpload[];
}

interface EnhancedMotoristaSignupProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const EnhancedMotoristaSignup = ({ onSuccess, onBack }: EnhancedMotoristaSignupProps) => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState<MotoristaSignupData>({
    nome: '',
    email: '',
    password: '',
    cpf: '',
    telefone: '',
    cnh: '',
    cnhDataValidade: '',
    documentos: [],
    fotosVeiculo: []
  });

  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([]);
  const [fotosVeiculo, setFotosVeiculo] = useState<FotoVeiculoUpload[]>([]);

  // CPF validation hook
  const { isValid: isCpfValid, isDuplicate, isChecking, error: cpfError, formatCpf } = useCpfValidation(
    formData.cpf
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
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  // Handle phone input with formatting
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const handleInputChange = (field: keyof MotoristaSignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Document management functions
  const adicionarDocumento = () => {
    const novoDoc: DocumentoUpload = {
      id: Date.now().toString(),
      nome: '',
      descricao: ''
    };
    const novosDocumentos = [...documentos, novoDoc];
    setDocumentos(novosDocumentos);
  };

  const atualizarDocumento = (id: string, campo: keyof DocumentoUpload, valor: any) => {
    const novosDocumentos = documentos.map(doc => doc.id === id ? {
      ...doc,
      [campo]: valor
    } : doc);
    setDocumentos(novosDocumentos);
  };

  const removerDocumento = (id: string) => {
    const novosDocumentos = documentos.filter(doc => doc.id !== id);
    setDocumentos(novosDocumentos);
  };

  // Photo management functions
  const adicionarFoto = (files: FileList | null) => {
    if (!files) return;

    const fotosArray = Array.from(files);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_TOTAL_SIZE = 150 * 1024 * 1024; // 150MB
    const MAX_FILES = 15;

    if (fotosVeiculo.length + fotosArray.length > MAX_FILES) {
      toast.error(`Máximo de ${MAX_FILES} fotos permitidas`);
      return;
    }

    let tamanhoAtual = fotosVeiculo.reduce((total, foto) => total + foto.tamanho, 0);
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
      const novasFotos = [...fotosVeiculo, ...fotosValidas];
      setFotosVeiculo(novasFotos);
      toast.success(`${fotosValidas.length} foto(s) adicionada(s)`);
    }
  };

  const removerFoto = (id: string) => {
    const novasFotos = fotosVeiculo.filter(foto => foto.id !== id);
    setFotosVeiculo(novasFotos);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTamanhoTotal = () => {
    return fotosVeiculo.reduce((total, foto) => total + foto.tamanho, 0);
  };

  // Helpers para arquivos
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  };

  // Upload file utility
  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (error) throw error;
    return data;
  };

  // Create motorista record after successful signup
  const createMotoristaRecord = async (userId: string) => {
    try {
      // 1) Cria o registro do motorista primeiro (evita que erros de upload bloqueiem o cadastro)
      const { data: motoristaData, error: motoristaError } = await supabase
        .from('motoristas')
        .insert([{
          user_id: userId,
          nome: formData.nome,
          email: formData.email,
          cpf: formData.cpf,
          telefone: formData.telefone,
          cnh: formData.cnh,
          validade_cnh: formData.cnhDataValidade || null,
          status: 'Pendente'
        }])
        .select()
        .single();

      if (motoristaError) throw motoristaError;

      // 2) Upload e vínculo dos documentos (best-effort)
      let docIndex = 0;
      for (const doc of documentos) {
        if (!doc.arquivo) { docIndex++; continue; }
        try {
          const originalName = sanitizeFileName(doc.arquivo.name);
          const fileName = `${userId}/${Date.now()}_${docIndex}_${originalName}`;
          await uploadFile(doc.arquivo, 'motorista-documentos', fileName);

          const nomeDoc = (doc.nome && doc.nome.trim()) ? doc.nome.trim() : `Documento ${docIndex + 1}`;
          const tipoDoc = (doc.descricao && doc.descricao.trim()) ? doc.descricao.trim() : nomeDoc;

          // Atenção: a tabela possui colunas (nome, tipo, url, motorista_id)
          const { error: docError } = await supabase
            .from('motorista_documentos')
            .insert({
              motorista_id: motoristaData.id,
              nome: nomeDoc,
              tipo: tipoDoc,
              url: fileName
            });

          if (docError) {
            console.warn('Falha ao salvar metadados do documento:', docError);
            toast.warning(`Documento "${nomeDoc}" enviado mas não cadastrado.`);
          }
        } catch (err) {
          console.warn('Erro no upload do documento:', err);
          toast.warning(`Falha ao enviar documento: ${doc.nome || `Documento ${docIndex + 1}`}`);
        }
        docIndex++;
      }

      // 3) Upload e vínculo das fotos (best-effort)
      let photoIndex = 0;
      for (const foto of fotosVeiculo) {
        if (!foto.arquivo) { photoIndex++; continue; }
        try {
          const originalName = sanitizeFileName(foto.arquivo.name);
          const fileName = `${userId}/${Date.now()}_${photoIndex}_${originalName}`;
          await uploadFile(foto.arquivo, 'motorista-fotos', fileName);

          const { error: photoError } = await supabase
            .from('motorista_fotos')
            .insert({
              motorista_id: motoristaData.id,
              nome: foto.nome,
              nome_original: foto.arquivo.name,
              url: fileName,
              tamanho: foto.tamanho
            });

          if (photoError) {
            console.warn('Falha ao salvar metadados da foto:', photoError);
            toast.warning(`Foto "${foto.nome}" enviada mas não cadastrada.`);
          }
        } catch (err) {
          console.warn('Erro no upload da foto:', err);
          toast.warning(`Falha ao enviar foto: ${foto.nome}`);
        }
        photoIndex++;
      }

      return motoristaData;
    } catch (error) {
      console.error('Erro ao criar registro do motorista:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, create the user account
      const { error: signUpError } = await signUp(
        formData.email, 
        formData.password, 
        formData.nome, 
        'Motorista'
      );

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          toast.error('Email já cadastrado. Tente fazer login.');
        } else {
          toast.error(`Erro no cadastro: ${signUpError.message}`);
        }
        return;
      }

      // Get the newly created user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create the complete motorista record
        await createMotoristaRecord(user.id);
      }

      toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar a conta. Seu cadastro está pendente de aprovação.');
      onSuccess();

    } catch (error: any) {
      console.error('Erro durante o cadastro:', error);
      toast.error('Erro ao processar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 validation
  const isStep1Valid = () => {
    return formData.nome && formData.email && formData.password && 
           formData.cpf && isCpfValid && !isDuplicate && formData.telefone;
  };

  // Step 2 validation
  const isStep2Valid = () => {
    return true; // CNH and documents are optional
  };

  const nextStep = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha *
              </Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
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
                  required
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
                required
              />
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onBack}>
                Voltar
              </Button>
              <Button 
                type="button" 
                onClick={nextStep} 
                disabled={!isStep1Valid() || isChecking}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Documentação e CNH</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnh">CNH</Label>
                <Input
                  id="cnh"
                  value={formData.cnh}
                  onChange={(e) => handleInputChange('cnh', e.target.value)}
                  placeholder="Número da CNH"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnhDataValidade">Data de Validade da CNH</Label>
                <Input
                  id="cnhDataValidade"
                  type="date"
                  value={formData.cnhDataValidade}
                  onChange={(e) => handleInputChange('cnhDataValidade', e.target.value)}
                />
              </div>
            </div>

            {/* Documents section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Documentos</Label>
                <Button type="button" onClick={adicionarDocumento} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Documento
                </Button>
              </div>
              
              {documentos.map(doc => (
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
            </div>

            {/* Photos section */}
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
                    {fotosVeiculo.length}/15 fotos
                  </span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('foto-input')?.click()}
                    disabled={fotosVeiculo.length >= 15}
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

              {fotosVeiculo.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fotosVeiculo.map(foto => (
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

              {fotosVeiculo.length === 0 && (
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

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Anterior
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !isStep2Valid()}
              >
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};