
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Eye } from 'lucide-react';
import { useMotoristas, DocumentoMotorista } from '@/hooks/useMotoristas';
import { MeusDocumentosViewer } from './MeusDocumentosViewer';

interface MeusDocumentosProps {
  motoristaEmail: string;
}

export const MeusDocumentos = ({ motoristaEmail }: MeusDocumentosProps) => {
  const { getMotoristaByEmail } = useMotoristas();
  const motorista = getMotoristaByEmail(motoristaEmail);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);

  if (!motorista) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Motorista não encontrado.</p>
      </div>
    );
  }

  const handleDownload = (documento: DocumentoMotorista) => {
    // Simular download do documento
    // ...existing code ...
    alert(`Download iniciado: ${documento.nome}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Meus Documentos</h2>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setIsDocumentViewerOpen(true)}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Documentos Reais
          </Button>
          <Badge variant={
            motorista.status === 'Aprovado' ? 'default' : 
            motorista.status === 'Reprovado' ? 'destructive' : 'secondary'
          }>
            {motorista.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {motorista.documentos.map((documento) => (
          <Card key={documento.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>{documento.nome}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                {documento.descricao}
              </p>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Enviado em: {new Date(documento.dataUpload).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {documento.arquivo && (
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDownload(documento)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {motorista.documentos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento cadastrado
            </h3>
            <p className="text-gray-500">
              Seus documentos aparecerão aqui quando forem adicionados pelo administrador.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {motorista.status === 'Pendente' && (
              <p className="text-sm text-orange-600">
                ⏳ Seus documentos estão sendo analisados pela administração.
              </p>
            )}
            {motorista.status === 'Aprovado' && (
              <p className="text-sm text-green-600">
                ✅ Parabéns! Seus documentos foram aprovados e você está habilitado para realizar corridas.
              </p>
            )}
            {motorista.status === 'Reprovado' && (
              <p className="text-sm text-red-600">
                ❌ Seus documentos foram reprovados. Entre em contato com a administração para mais informações.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <MeusDocumentosViewer 
        open={isDocumentViewerOpen}
        onOpenChange={setIsDocumentViewerOpen}
      />
    </div>
  );
};
