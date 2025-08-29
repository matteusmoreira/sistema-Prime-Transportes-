import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
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
  });

  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([]);
  const [fotosVeiculo, setFotosVeiculo] = useState<FotoVeiculoUpload[]>([]);

  // CPF validation hook
  const { isValid: isCpfValid, isDuplicate, isChecking, error: cpfError, formatCpf } = useCpfValidation(
    formData.cpf
  );

  // Helpers de formatação
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCpf(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const handleInputChange = (field: keyof MotoristaSignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Gestão de documentos
  const adicionarDocumento = () => {
    const novoDoc: DocumentoUpload = {
      id: Date.now().toString(),
      nome: '',
      descricao: ''
    };
    setDocumentos(prev => [...prev, novoDoc]);
  };

  const atualizarDocumento = (id: string, campo: keyof DocumentoUpload, valor: any) => {
    setDocumentos(prev => prev.map(doc => doc.id === id ? { ...doc, [campo]: valor } : doc));
  };

  const removerDocumento = (id: string) => {
    setDocumentos(prev => prev.filter(doc => doc.id !== id));
  };

  // Gestão de fotos
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
      setFotosVeiculo(prev => [...prev, ...fotosValidas]);
      toast.success(`${fotosValidas.length} foto(s) adicionada(s)`);
    }
  };

  const removerFoto = (id: string) => {
    setFotosVeiculo(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTamanhoTotal = () => fotosVeiculo.reduce((total, foto) => total + foto.tamanho, 0);

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

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (error) throw error;
    return data;
  };

  // Cria o registro do motorista e faz o upload dos anexos (best-effort)
  const createMotoristaRecord = async (userId?: string) => {
    const { data: motoristaData, error: motoristaError } = await supabase
      .from('motoristas')
      .insert([{
        user_id: userId || null,
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

    const motoristaId = motoristaData.id as number;

    // Upload de documentos (best-effort)
    let docIndex = 0;
    for (const doc of documentos) {
      if (!doc.arquivo) { docIndex++; continue; }
      try {
        const originalName = sanitizeFileName(doc.arquivo.name);
        const fileName = `${Date.now()}_${docIndex}_${originalName}`;
        const storagePath = `${motoristaId}/${fileName}`;
        await uploadFile(doc.arquivo, 'motorista-documentos', storagePath);

        const nomeDoc = (doc.nome && doc.nome.trim()) ? doc.nome.trim() : `Documento ${docIndex + 1}`;
        const tipoDoc = (doc.descricao && doc.descricao.trim()) ? doc.descricao.trim() : nomeDoc;

        const { error: docError } = await supabase
          .from('motorista_documentos')
          .insert({
            motorista_id: motoristaId,
            nome: nomeDoc,
            tipo: tipoDoc,
            url: storagePath
          });

        if (docError) {
          console.error('Falha ao salvar metadados do documento:', docError);
          toast.warning(`Documento "${nomeDoc}" enviado mas não cadastrado.`);
        }
      } catch (err) {
        console.error('Erro no upload do documento:', err);
        toast.error('Falha ao enviar um dos documentos.');
      } finally {
        docIndex++;
      }
    }

    // Upload de fotos (best-effort)
    let fotoIndex = 0;
    for (const foto of fotosVeiculo) {
      if (!foto.arquivo) { fotoIndex++; continue; }
      try {
        const originalName = sanitizeFileName(foto.arquivo.name);
        const fileName = `${Date.now()}_${fotoIndex}_${originalName}`;
        const storagePath = `${motoristaId}/${fileName}`;
        await uploadFile(foto.arquivo, 'motorista-fotos', storagePath);

        const { error: fotoError } = await supabase
          .from('motorista_fotos')
          .insert({
            motorista_id: motoristaId,
            nome: foto.nome || `Foto ${fotoIndex + 1}`,
            nome_original: foto.arquivo.name,
            url: storagePath,
            tamanho: foto.tamanho
          });

        if (fotoError) {
          console.error('Falha ao salvar metadados da foto:', fotoError);
          toast.warning(`Foto "${foto.nome || `Foto ${fotoIndex + 1}`}" enviada mas não cadastrada.`);
        }
      } catch (err) {
        console.error('Erro no upload da foto:', err);
        toast.error('Falha ao enviar uma das fotos.');
      } finally {
        fotoIndex++;
      }
    }

    return motoristaId;
  };

  const validateStep1 = () => {
    if (!formData.nome.trim()) { toast.error('Informe o nome'); return false; }
    if (!formData.email.trim()) { toast.error('Informe o email'); return false; }
    if (!formData.password.trim()) { toast.error('Informe a senha'); return false; }
    if (!formData.cpf.trim()) { toast.error('Informe o CPF'); return false; }
    if (!isCpfValid) { toast.error(cpfError || 'CPF inválido'); return false; }
    if (isDuplicate) { toast.error('CPF já cadastrado'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, formData.nome, 'Motorista');
      if (error) {
        console.error('Erro ao criar usuário:', error);
        toast.error('Não foi possível criar o usuário');
        return;
      }

      // Tentar obter usuário logado (pode não existir se exigir confirmação por email)
      let userId: string | undefined = undefined;
      try {
        const { data: userResp } = await supabase.auth.getUser();
        userId = userResp?.user?.id;
      } catch (e) {
        // Sem sessão; prosseguir criando o registro mesmo assim
      }

      try {
        await createMotoristaRecord(userId);
      } catch (e) {
        console.error('Erro ao criar registro de motorista:', e);
        toast.error('Usuário criado, mas ocorreu erro ao salvar dados do motorista.');
        return;
      }

      toast.success('Cadastro iniciado com sucesso! Verifique seu e-mail para confirmar a conta.');
      onSuccess();
    } catch (err) {
      console.error('Erro no processo de cadastro:', err);
      toast.error('Erro no processo de cadastro');
    } finally {
      setLoading(false);
    }
  };

  // UI Simplificada em etapas
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cadastro de Motorista</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <X className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={step >= 1 ? 'font-semibold text-foreground' : ''}>1. Dados</span>
        <span>›</span>
        <span className={step >= 2 ? 'font-semibold text-foreground' : ''}>2. Documentos e Fotos</span>
        <span>›</span>
        <span className={step >= 3 ? 'font-semibold text-foreground' : ''}>3. Revisão</span>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <Input value={formData.nome} onChange={e => handleInputChange('nome', e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="seu@email.com" />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <Label>CPF</Label>
            <Input value={formData.cpf} onChange={e => handleCpfChange(e.target.value)} placeholder="000.000.000-00" />
            <div className="text-xs mt-1">
              {isChecking ? 'Verificando CPF...' : isCpfValid ? (
                <span className="text-green-600">CPF válido</span>
              ) : formData.cpf ? (
                <span className="text-red-600">{cpfError || 'CPF inválido'}</span>
              ) : null}
              {isDuplicate && <div className="text-red-600">CPF já cadastrado</div>}
            </div>
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={formData.telefone} onChange={e => handlePhoneChange(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <Label>CNH</Label>
            <Input value={formData.cnh} onChange={e => handleInputChange('cnh', e.target.value)} placeholder="Número da CNH" />
          </div>
          <div>
            <Label>Validade da CNH</Label>
            <Input type="date" value={formData.cnhDataValidade} onChange={e => handleInputChange('cnhDataValidade', e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Documentos</Label>
              <Button variant="outline" size="sm" onClick={adicionarDocumento}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-3">
              {documentos.map(doc => (
                <div key={doc.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-1">
                    <Label>Nome</Label>
                    <Input value={doc.nome} onChange={e => atualizarDocumento(doc.id, 'nome', e.target.value)} placeholder="Ex: RG, CPF, Comprovante" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descrição</Label>
                    <Textarea value={doc.descricao} onChange={e => atualizarDocumento(doc.id, 'descricao', e.target.value)} placeholder="Detalhes do documento" />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-1">
                    <Input type="file" onChange={e => atualizarDocumento(doc.id, 'arquivo', e.target.files?.[0])} />
                    <Button variant="destructive" size="icon" onClick={() => removerDocumento(doc.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {documentos.length === 0 && <div className="text-sm text-muted-foreground">Nenhum documento adicionado</div>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fotos do Veículo</Label>
              <div className="flex items-center gap-2">
                <Input type="file" multiple accept="image/*" onChange={e => adicionarFoto(e.target.files)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fotosVeiculo.map(f => (
                <div key={f.id} className="flex items-center justify-between border rounded-md p-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{f.nome}</div>
                    <div className="text-xs text-muted-foreground">{formatFileSize(f.tamanho)}</div>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => removerFoto(f.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {fotosVeiculo.length === 0 && <div className="text-sm text-muted-foreground">Nenhuma foto adicionada</div>}
            </div>
            <div className="text-xs text-muted-foreground">Tamanho total: {formatFileSize(getTamanhoTotal())}</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nome</div>
              <div className="font-medium">{formData.nome || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{formData.email || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">CPF</div>
              <div className="font-medium">{formData.cpf || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telefone</div>
              <div className="font-medium">{formData.telefone || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">CNH</div>
              <div className="font-medium">{formData.cnh || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Validade CNH</div>
              <div className="font-medium">{formData.cnhDataValidade || '-'}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Documentos ({documentos.length})</div>
            <ul className="list-disc pl-6 text-sm">
              {documentos.map(d => (
                <li key={d.id}>{d.nome || 'Sem nome'} {d.arquivo ? `(arquivo: ${d.arquivo.name})` : '(sem arquivo)'}</li>
              ))}
              {documentos.length === 0 && <li>Nenhum documento</li>}
            </ul>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Fotos do veículo ({fotosVeiculo.length})</div>
            <ul className="list-disc pl-6 text-sm">
              {fotosVeiculo.map(f => (
                <li key={f.id}>{f.nome} ({formatFileSize(f.tamanho)})</li>
              ))}
              {fotosVeiculo.length === 0 && <li>Nenhuma foto</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setStep(prev => Math.max(1, prev - 1))} disabled={step === 1 || loading}>
          Voltar
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(prev => prev + 1)} disabled={loading || (step === 1 && (!formData.nome || !formData.email || !formData.password || !formData.cpf))}>
            Próximo
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>) : 'Concluir cadastro'}
          </Button>
        )}
      </div>
    </div>
  );
};