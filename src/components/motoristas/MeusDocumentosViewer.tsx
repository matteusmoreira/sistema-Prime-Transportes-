import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Calendar, Image, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    if (open && user) {
      loadDocumentos();
    }
  }, [open, user]);

  const loadDocumentos = async () => {
    setLoading(true);
    console.log('Loading documents for current user:', user?.id);
    
    try {
      // First get the motorista ID for the current user
      const { data: motoristaData, error: motoristaError } = await supabase
        .from('motoristas')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (motoristaError || !motoristaData) {
        console.log('Motorista not found for user:', user?.id);
        return;
      }

      const motoristaId = motoristaData.id;
      console.log('Found motorista ID:', motoristaId);

      // Load documents
      const { data: docsData, error: docsError } = await supabase
        .from('motorista_documentos')
        .select('*')
        .eq('motorista_id', motoristaId)
        .order('created_at', { ascending: false });

      console.log('Documents query result:', { docsData, docsError });
      if (docsError) throw docsError;
      setDocumentos(docsData || []);

      // Load photos
      const { data: fotosData, error: fotosError } = await supabase
        .from('motorista_fotos')
        .select('*')
        .eq('motorista_id', motoristaId)
        .order('created_at', { ascending: false });

      console.log('Photos query result:', { fotosData, fotosError });
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
      const { data } = await supabase.storage
        .from('motorista-fotos')
        .getPublicUrl(foto.url);

      window.open(data.publicUrl, '_blank');
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
          <DialogTitle>Meus Documentos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
    </Dialog>
  );
};