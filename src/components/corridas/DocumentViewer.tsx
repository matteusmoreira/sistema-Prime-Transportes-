import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Car, Building, Hotel, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { DocumentoUpload } from '@/hooks/useCorridaDocuments';

interface DocumentViewerProps {
  documentos: DocumentoUpload[];
  loading?: boolean;
  onDownload?: (documento: DocumentoUpload) => void;
  title?: string;
  showEmptyState?: boolean;
}

export const DocumentViewer = ({ 
  documentos, 
  loading = false, 
  onDownload, 
  title = "Comprovantes e Documentos",
  showEmptyState = true 
}: DocumentViewerProps) => {
  
  const getDocumentIcon = (nome: string) => {
    const nomeNormalizado = nome.toLowerCase();
    if (nomeNormalizado.includes('pedagio') || nomeNormalizado.includes('pedágio')) {
      return <Car className="h-5 w-5 text-blue-600" />;
    }
    if (nomeNormalizado.includes('estacionamento')) {
      return <Building className="h-5 w-5 text-green-600" />;
    }
    if (nomeNormalizado.includes('hospedagem')) {
      return <Hotel className="h-5 w-5 text-purple-600" />;
    }
    return <CreditCard className="h-5 w-5 text-gray-600" />;
  };

  const getDocumentType = (nome: string) => {
    const nomeNormalizado = nome.toLowerCase();
    if (nomeNormalizado.includes('pedagio') || nomeNormalizado.includes('pedágio')) {
      return { label: 'Pedágio', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
    if (nomeNormalizado.includes('estacionamento')) {
      return { label: 'Estacionamento', color: 'bg-green-100 text-green-800 border-green-300' };
    }
    if (nomeNormalizado.includes('hospedagem')) {
      return { label: 'Hospedagem', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    }
    return { label: 'Outro', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Carregando documentos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{title}</span>
            {documentos.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {documentos.length}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documentos.length === 0 && showEmptyState ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhum comprovante anexado</p>
            <p className="text-sm mt-1">Os comprovantes anexados pelo motorista aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentos.map((doc, index) => {
              const docType = getDocumentType(doc.nome);
              return (
                <div key={doc.id || index} className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getDocumentIcon(doc.nome)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-base">{doc.nome}</p>
                          <Badge className={docType.color}>
                            {docType.label}
                          </Badge>
                        </div>
                        {doc.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{doc.descricao}</p>
                        )}
                        {doc.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            📅 Anexado em {new Date(doc.created_at).toLocaleDateString('pt-BR')} às {new Date(doc.created_at).toLocaleTimeString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    {(doc.url || onDownload) && (
                      <Button
                        onClick={() => onDownload?.(doc)}
                        size="sm"
                        variant="outline"
                        className="ml-4 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};