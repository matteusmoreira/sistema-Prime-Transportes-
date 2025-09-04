import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Calendar, Image, Eye, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
// Removido: import { AlertDialog, ... } from '@/components/ui/alert-dialog';
// Removido: import { useMotoristas } from '@/hooks/useMotoristas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
// Remover import errado que ficou
// import { useMotoristas } from '@/hooks/useMotoristas';

interface DocumentoBanco {
  id: number;
  nome: string;
  tipo: string;
  url: string;
  created_at: string;
}

interface FotoBanco {
  id: number;
  nome: string;
  nome_original: string;
  url: string;
  tamanho: number;
  created_at: string;
}

interface MeusDocumentosViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeusDocumentosViewer = ({ 
  open, 
  onOpenChange 
}: MeusDocumentosViewerProps) => {
  const [documentos, setDocumentos] = useState<DocumentoBanco[]>([]);
  const [fotos, setFotos] = useState<FotoBanco[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  // Removido: const { deleteDocumento } = useMotoristas();

  const [motoristaId, setMotoristaId] = useState<number | null>(null);

  // Upload state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // Upload fotos veículo
  const [showPhotoUploadForm, setShowPhotoUploadForm] = useState(false);
  const [newPhotoName, setNewPhotoName] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Lightbox preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  useEffect(() => {
    if (open && user) {
      loadDocumentos();
    }
  }, [open, user]);

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  };

  const isImageFile = (path: string): boolean => /\.(jpg|jpeg|png)$/i.test(path);

  const getPublicUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const loadDocumentos = async () => {
    setLoading(true);
    
    try {
      if (!user?.id) {
        setDocumentos([]);
        setFotos([]);
        return;
      }

      // Buscar o motorista associado ao usuário logado
      const { data: motorista, error: motoristaError } = await supabase
        .from('motoristas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (motoristaError || !motorista) {
        // console.error('Motorista não encontrado para o usuário:', user.id, motoristaError);
        setDocumentos([]);
        setFotos([]);
        setMotoristaId(null);
        return;
      }

      const motoristaId = motorista.id;
      setMotoristaId(motoristaId);

      // Carregar documentos do banco
      const { data: docsData, error: docsError } = await supabase
        .from('motorista_documentos')
        .select('*')
        .eq('motorista_id', motoristaId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocumentos(docsData || []);

      // Carregar fotos do banco
      const { data: fotosData, error: fotosError } = await supabase
        .from('motorista_fotos')
        .select('*')
        .eq('motorista_id', motoristaId)
        .order('created_at', { ascending: false });

      if (fotosError) throw fotosError;
      setFotos(fotosData || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os documentos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (documento: DocumentoBanco) => {
    try {
      const { data, error } = await supabase.storage
        .from('motorista-documentos')
        .download(documento.url);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documento.nome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download realizado",
        description: `${documento.nome} foi baixado com sucesso`
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento",
        variant: "destructive"
      });
    }
  };

  const handleViewImage = async (foto: FotoBanco) => {
    try {
      const url = getPublicUrl('motorista-fotos', foto.url);
      setPreviewTitle(foto.nome);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Erro ao visualizar imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível visualizar a imagem",
        variant: "destructive"
      });
    }
  };

  const handleViewDocumento = async (documento: DocumentoBanco) => {
    try {
      const url = getPublicUrl('motorista-documentos', documento.url);
      setPreviewTitle(documento.nome);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      toast({ title: 'Erro', description: 'Não foi possível visualizar o documento', variant: 'destructive' });
    }
  };

  const handleUploadNewDocument = async () => {
    try {
      if (!user?.id || !motoristaId) {
        toast({ title: 'Erro', description: 'Usuário não autenticado', variant: 'destructive' });
        return;
      }
      if (!newDocFile) {
        toast({ title: 'Arquivo obrigatório', description: 'Selecione um arquivo para enviar' });
        return;
      }
      if (newDocFile.size > MAX_FILE_SIZE) {
        toast({ title: 'Arquivo muito grande', description: 'Tamanho máximo permitido: 5MB', variant: 'destructive' });
        return;
      }
      const nome = newDocName?.trim() || newDocFile.name;
      const tipo = newDocType?.trim() || 'Documento';

      setUploading(true);
      const sanitizedName = sanitizeFileName(newDocFile.name);
      const fileName = `${motoristaId}-${Date.now()}-${sanitizedName}`;
      const storagePrefix = `${user.id}/${motoristaId}`;
      const storagePath = `${storagePrefix}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('motorista-documentos')
        .upload(storagePath, newDocFile, { upsert: false });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('motorista_documentos')
        .insert({
          motorista_id: motoristaId,
          nome,
          tipo,
          url: storagePath
        });
      if (insertError) throw insertError;

      toast({ title: 'Documento enviado', description: 'Seu documento foi enviado com sucesso.' });
      // Reset form
      setShowUploadForm(false);
      setNewDocFile(null);
      setNewDocName('');
      setNewDocType('');
      await loadDocumentos();
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      toast({ title: 'Erro ao enviar', description: error?.message || 'Falha no upload do documento', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadNewPhoto = async () => {
    try {
      if (!user?.id || !motoristaId) {
        toast({ title: 'Erro', description: 'Usuário não autenticado', variant: 'destructive' });
        return;
      }
      if (!newPhotoFile) {
        toast({ title: 'Arquivo obrigatório', description: 'Selecione uma imagem (JPG/PNG) para enviar' });
        return;
      }
      const isValidType = ['image/jpeg', 'image/png'].includes(newPhotoFile.type);
      if (!isValidType) {
        toast({ title: 'Formato inválido', description: 'Apenas imagens JPG ou PNG são permitidas', variant: 'destructive' });
        return;
      }
      if (newPhotoFile.size > MAX_FILE_SIZE) {
        toast({ title: 'Arquivo muito grande', description: 'Tamanho máximo permitido: 5MB', variant: 'destructive' });
        return;
      }

      const nome = newPhotoName?.trim() || newPhotoFile.name;

      setUploadingPhoto(true);
      const sanitizedName = sanitizeFileName(newPhotoFile.name);
      const fileName = `${motoristaId}-${Date.now()}-${sanitizedName}`;
      const storagePrefix = `${user.id}/${motoristaId}`;
      const storagePath = `${storagePrefix}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('motorista-fotos')
        .upload(storagePath, newPhotoFile, { upsert: false });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('motorista_fotos')
        .insert({
          motorista_id: motoristaId,
          nome,
          nome_original: newPhotoFile.name,
          url: storagePath,
          tamanho: newPhotoFile.size
        });
      if (insertError) throw insertError;

      toast({ title: 'Foto enviada', description: 'Sua foto foi enviada com sucesso.' });
      setShowPhotoUploadForm(false);
      setNewPhotoFile(null);
      setNewPhotoName('');
      await loadDocumentos();
    } catch (error: any) {
      console.error('Erro ao enviar foto:', error);
      toast({ title: 'Erro ao enviar', description: error?.message || 'Falha no upload da foto', variant: 'destructive' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Removido: função e bloco de exclusão (motorista não pode excluir)
  // const confirmDeleteDocumento = async () => { /* removido */ };
  // if (!docToDelete) return;
  // try {
  //   await deleteDocumento(docToDelete.id, docToDelete.url);
  //   setConfirmOpen(false);
  //   setDocToDelete(null);
  //   await loadDocumentos();
  // } catch (error) {
  //   // deleteDocumento já faz toast de erro
  // }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meus Documentos</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Ações topo */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Gerencie seus documentos: envie novos e baixe.</p>
              <Button size="sm" onClick={() => setShowUploadForm((v) => !v)}>
                <Plus className="h-4 w-4 mr-2" /> {showUploadForm ? 'Fechar' : 'Enviar novo documento'}
              </Button>
            </div>

            {showUploadForm && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-nome">Nome</Label>
                      <Input id="doc-nome" placeholder="Ex: CNH frente" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-tipo">Tipo</Label>
                      <Input id="doc-tipo" placeholder="Ex: CNH, CRLV, Comprovante" value={newDocType} onChange={(e) => setNewDocType(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-arquivo">Arquivo</Label>
                      <Input id="doc-arquivo" type="file" onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setNewDocFile(f);
                        if (f && !newDocName) setNewDocName(f.name);
                      }} />
                      {newDocFile && (
                        <p className={`text-xs ${newDocFile.size > MAX_FILE_SIZE ? 'text-destructive' : 'text-muted-foreground'}`}>
                          Tamanho: {(newDocFile.size / (1024 * 1024)).toFixed(2)} MB {newDocFile.size > MAX_FILE_SIZE ? '(excede 5MB)' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleUploadNewDocument} disabled={uploading}>
                      {uploading ? 'Enviando...' : 'Enviar documento'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documentos */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documentos ({documentos.length})
              </h3>
              
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1,2,3,4].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6 space-y-3">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-8 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : documentos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {documentos.map((documento) => (
                    <Card key={documento.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-sm">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            {documento.nome}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground">Tipo: {documento.tipo}</p>
                        {isImageFile(documento.url) && (
                          <img
                            src={getPublicUrl('motorista-documentos', documento.url)}
                            alt={documento.nome}
                            className="w-full h-32 object-cover rounded border cursor-pointer"
                            onClick={() => handleViewDocumento(documento)}
                          />
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Enviado: {new Date(documento.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        
                        {isImageFile(documento.url) ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDocumento(documento)}>
                              <Eye className="h-4 w-4 mr-2" /> Visualizar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(documento)}>
                              <Download className="h-4 w-4 mr-2" /> Baixar
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(documento)} className="w-full">
                            <Download className="h-4 w-4 mr-2" /> Baixar
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum documento encontrado</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Fotos do Veículo */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Image className="h-5 w-5 mr-2" />
                Fotos do Veículo ({fotos.length})
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <p className="text-sm text-muted-foreground">Envie novas fotos do veículo (JPG/PNG) e visualize em tela.</p>
                <Button size="sm" onClick={() => setShowPhotoUploadForm((v) => !v)}>
                  <Plus className="h-4 w-4 mr-2" /> {showPhotoUploadForm ? 'Fechar' : 'Enviar nova foto'}
                </Button>
              </div>
              {showPhotoUploadForm && (
                <Card className="mb-4">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="foto-nome">Nome</Label>
                        <Input id="foto-nome" placeholder="Ex: Lateral direita" value={newPhotoName} onChange={(e) => setNewPhotoName(e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="foto-arquivo">Arquivo (JPG/PNG)</Label>
                        <Input id="foto-arquivo" type="file" accept="image/png,image/jpeg" onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setNewPhotoFile(f);
                          if (f && !newPhotoName) setNewPhotoName(f.name);
                        }} />
                        {newPhotoFile && (
                          <p className={`text-xs ${newPhotoFile.size > MAX_FILE_SIZE ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Tamanho: {(newPhotoFile.size / (1024 * 1024)).toFixed(2)} MB {newPhotoFile.size > MAX_FILE_SIZE ? '(excede 5MB)' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleUploadNewPhoto} disabled={uploadingPhoto}>
                        {uploadingPhoto ? 'Enviando...' : 'Enviar foto'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {loading ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[1,2,3].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6 space-y-3">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-8 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : fotos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {fotos.map((foto) => (
                    <Card key={foto.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-sm">
                          <Image className="h-4 w-4 text-green-600" />
                          <span>{foto.nome}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <img
                          src={getPublicUrl('motorista-fotos', foto.url)}
                          alt={foto.nome}
                          className="h-40 w-full object-cover rounded border cursor-pointer"
                          onClick={() => handleViewImage(foto)}
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewImage(foto)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-6">
                    <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhuma foto encontrada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>

        {/* Removido: Dialog de confirmação de exclusão */}
        {/* Removido: Dialog de confirmação de exclusão */}
      </Dialog>

      {/* Lightbox de visualização de imagem/documento */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt={previewTitle} className="max-h-[70vh] w-auto mx-auto rounded shadow" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};