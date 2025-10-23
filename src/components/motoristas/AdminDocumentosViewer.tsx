import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Calendar, Image, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useMotoristas, Motorista } from '@/hooks/useMotoristas';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDateDDMMYYYY } from '@/utils/format';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useLogs } from '@/contexts/LogsContext';

interface AdminDocumentosViewerProps {
  motorista: Motorista;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

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

export const AdminDocumentosViewer = ({ 
  motorista, 
  open, 
  onOpenChange,
  onApprove,
  onReject 
}: AdminDocumentosViewerProps) => {
  const [documentos, setDocumentos] = useState<DocumentoBanco[]>([]);
  const [fotos, setFotos] = useState<FotoBanco[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { deleteDocumento, deleteFoto } = useMotoristas();
  const [docImagePreviews, setDocImagePreviews] = useState<Record<number, string>>({});
  const [expandedDocIds, setExpandedDocIds] = useState<Set<number>>(new Set());
  const { logAction } = useLogs();

  const isImagePath = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return !!ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  };

  const handleToggleDocPreview = async (documento: DocumentoBanco) => {
    if (!isImagePath(documento.url)) {
      toast({
        title: 'Pré-visualização indisponível',
        description: 'Este documento não é uma imagem.',
        variant: 'destructive'
      });
      return;
    }
    try {
      if (!docImagePreviews[documento.id]) {
        const { data } = await supabase.storage
          .from('motorista-documentos')
          .getPublicUrl(documento.url);
        setDocImagePreviews(prev => ({ ...prev, [documento.id]: data.publicUrl }));
      }
      setExpandedDocIds(prev => {
        const s = new Set(prev);
        const wasOpen = s.has(documento.id);
        if (wasOpen) s.delete(documento.id); else s.add(documento.id);
        return s;
      });
      // Log somente quando abrir a visualização
      const isCurrentlyOpen = expandedDocIds.has(documento.id);
      if (!isCurrentlyOpen) {
        logAction({
          action_type: 'CREATE',
          entity_type: 'motoristas',
          entity_id: String(motorista.id),
          old_data: null,
          new_data: {
            acao: 'visualizacao_documento',
            origem: 'public_url',
            documento: { id: documento.id, nome: documento.nome, path: documento.url }
          }
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a pré-visualização',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (open && motorista) {
      // ...existing code...
      loadDocumentos();
    }
  }, [open, motorista]);

  const loadDocumentos = async () => {
    setLoading(true);
    // console.log('Loading documents for motorista:', motorista.id);
    
    try {
      // Carregar documentos do banco
      const { data: docsData, error: docsError } = await supabase
        .from('motorista_documentos')
        .select('*')
        .eq('motorista_id', motorista.id)
        .order('created_at', { ascending: false });

      // console.log('Documents query result:', { docsData, docsError });
      if (docsError) throw docsError;
      setDocumentos(docsData || []);

      // Carregar fotos do banco
      const { data: fotosData, error: fotosError } = await supabase
        .from('motorista_fotos')
        .select('*')
        .eq('motorista_id', motorista.id)
        .order('created_at', { ascending: false });

      // console.log('Photos query result:', { fotosData, fotosError });
      if (fotosError) throw fotosError;
      setFotos(fotosData || []);

    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos",
        variant: "destructive"
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

      // Criar URL para download
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

      // Log de auditoria: download de documento de motorista (via storage)
      logAction({
        action_type: 'CREATE',
        entity_type: 'motoristas',
        entity_id: String(motorista.id),
        old_data: null,
        new_data: {
          acao: 'download_documento',
          origem: 'storage',
          documento: { id: documento.id, nome: documento.nome, path: documento.url }
        }
      }).catch(() => {});
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
      const { data } = await supabase.storage
        .from('motorista-fotos')
        .getPublicUrl(foto.url);

      window.open(data.publicUrl, '_blank');

      // Log de auditoria: visualização de foto de motorista (via public URL)
      logAction({
        action_type: 'CREATE',
        entity_type: 'motoristas',
        entity_id: String(motorista.id),
        old_data: null,
        new_data: {
          acao: 'visualizacao_foto',
          origem: 'public_url',
          foto: { id: foto.id, nome: foto.nome, path: foto.url }
        }
      }).catch(() => {});
    } catch (error) {
      console.error('Erro ao visualizar imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível visualizar a imagem",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Documentos de {motorista.nome}</span>
            <Badge variant={
              motorista.status === 'Aprovado' ? 'default' : 
              motorista.status === 'Reprovado' ? 'destructive' : 'secondary'
            }>
              {motorista.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ações de Aprovação/Rejeição */}
          {motorista.status === 'Pendente' && (
            <div className="flex space-x-2 p-4 bg-gray-50 rounded-lg">
              <Button 
                onClick={async () => {
                  await onApprove?.(motorista.id);
                  await loadDocumentos();
                }}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar Motorista
              </Button>
              <Button 
                onClick={async () => {
                  await onReject?.(motorista.id);
                  await loadDocumentos();
                }}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reprovar Motorista
              </Button>
            </div>
          )}

          {/* Documentos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentos ({documentos.length})
            </h3>
            
            {loading ? (
              <p>Carregando documentos...</p>
            ) : documentos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {documentos.map((documento) => (
                  <Card key={documento.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{documento.nome}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-gray-600">
                        Tipo: {documento.tipo}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Enviado: {new Date(documento.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDownloadDocument(documento)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      {isImagePath(documento.url) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleToggleDocPreview(documento)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      )}
                      {expandedDocIds.has(documento.id) && docImagePreviews[documento.id] && (
                        <div className="mt-2 rounded-md border overflow-hidden">
                          <img
                            src={docImagePreviews[documento.id]}
                            alt={documento.nome}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full mt-2"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O arquivo será removido do armazenamento e do banco de dados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                await deleteDocumento(documento.id, documento.url);
                                toast({ title: 'Excluído', description: 'Documento removido com sucesso.' });
                                await loadDocumentos();
                              }}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
            
            {fotos.length > 0 ? (
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewImage(foto)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full mt-2"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O arquivo será removido do armazenamento e do banco de dados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                await deleteFoto(foto.id, foto.url);
                                toast({ title: 'Excluída', description: 'Foto removida com sucesso.' });
                                await loadDocumentos();
                              }}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

          {/* Informações do Motorista */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Motorista</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div><strong>Email:</strong> {motorista.email}</div>
              <div><strong>CPF:</strong> {motorista.cpf}</div>
              <div><strong>Telefone:</strong> {motorista.telefone}</div>
              <div><strong>CNH:</strong> {motorista.cnh}</div>
              <div><strong>Validade CNH:</strong> {formatDateDDMMYYYY(motorista.cnhDataValidade)}</div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};