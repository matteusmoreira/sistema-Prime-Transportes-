import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Car, Building, Hotel, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';

interface CorridaViewDialogProps {
  corrida: CorridaFinanceiro | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CorridaViewDialog = ({ corrida, isOpen, onOpenChange }: CorridaViewDialogProps) => {
  const [documentos, setDocumentos] = useState<any[]>([]);

  // Carregar documentos da corrida
  useEffect(() => {
    const loadDocumentos = async () => {
      if (!corrida?.id || !isOpen) {
        setDocumentos([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('corrida_documentos')
          .select('*')
          .eq('corrida_id', corrida.id);

        if (error) {
          console.error('Erro ao carregar documentos:', error);
          return;
        }

        setDocumentos(data || []);
      } catch (error) {
        console.error('Erro ao carregar documentos:', error);
      }
    };

    loadDocumentos();
  }, [corrida?.id, isOpen]);

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

  const handleDownloadDocument = async (documento: any) => {
    try {
      // If URL starts with http, it's already a public URL
      if (documento.url.startsWith('http')) {
        window.open(documento.url, '_blank');
        return;
      }

      // Otherwise, try to get from storage bucket
      const { data, error } = await supabase.storage
        .from('corrida-documentos')
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

      toast.success(`${documento.nome} foi baixado com sucesso`);
    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('Não foi possível baixar o documento');
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aguardando Conferência':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">{status}</Badge>;
      case 'Em Análise':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">{status}</Badge>;
      case 'Aprovada':
        return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">{status}</Badge>;
      case 'Revisar':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">{status}</Badge>;
      case 'Cancelada':
        return <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">{status}</Badge>;
      case 'No Show':
        return <Badge className="bg-green-700 text-white border-green-700 hover:bg-green-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!corrida) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualização Completa - Corrida #{corrida.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Empresa:</Label>
                  <p>{corrida.empresa}</p>
                </div>
                <div>
                  <Label className="font-semibold">Motorista:</Label>
                  <p>{corrida.motorista}</p>
                </div>
                <div>
                  <Label className="font-semibold">Data do Serviço:</Label>
                  <p>{new Date(corrida.dataServico).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <p>{getStatusBadge(corrida.status)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Centro de Custo:</Label>
                  <p>{corrida.centroCusto}</p>
                </div>
                <div>
                  <Label className="font-semibold">N° da O.S:</Label>
                  <p>{corrida.numeroOS}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Origem:</Label>
                  <p>{corrida.origem}</p>
                </div>
                <div>
                  <Label className="font-semibold">Destino:</Label>
                  <p>{corrida.destino}</p>
                </div>
              </div>
              {corrida.destinoExtra && (
                <div className="mt-4">
                  <Label className="font-semibold">Destino Extra:</Label>
                  <p>{corrida.destinoExtra}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores e Quilometragem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quilometragem */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Quilometragem</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="font-semibold">KM Inicial:</Label>
                      <p className="text-lg">{corrida.kmInicial || 0} km</p>
                    </div>
                    <div>
                      <Label className="font-semibold">KM Final:</Label>
                      <p className="text-lg">{corrida.kmFinal || 0} km</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Cálculo:</Label>
                      <p className="text-sm text-gray-600">{corrida.kmFinal || 0} - {corrida.kmInicial || 0}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">KM Total:</Label>
                      <p className="text-lg font-bold text-blue-600">{corrida.kmTotal} km</p>
                    </div>
                  </div>
                </div>
                
                {/* Valores */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Valores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Valor Total:</Label>
                      <p className="text-lg font-bold text-green-600">R$ {corrida.valor.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Valor para Motorista:</Label>
                      <p className="text-lg">R$ {corrida.valorMotorista?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custos Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="font-semibold">Pedágio:</Label>
                    <p className="text-lg">R$ {corrida.pedagio.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="font-semibold">Estacionamento:</Label>
                    <p className="text-lg">R$ {corrida.estacionamento.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Hotel className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label className="font-semibold">Hospedagem:</Label>
                    <p className="text-lg">R$ {corrida.hospedagem.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              {corrida.passageiros && (
                <div className="mb-4">
                  <Label className="font-semibold">Passageiros:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-line">
                    {corrida.passageiros}
                  </div>
                </div>
              )}
              
              {corrida.observacoes && (
                <div>
                  <Label className="font-semibold">Observações:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">
                    {corrida.observacoes}
                  </div>
                </div>
              )}
              
              {corrida.motivoReprovacao && (
                <div className="mt-4">
                  <Label className="font-semibold">Motivo da Reprovação:</Label>
                  <div className="mt-1 p-3 bg-red-50 rounded text-red-700">
                    {corrida.motivoReprovacao}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentos */}
          {documentos && documentos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comprovantes e Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {documentos.map(doc => (
                    <div key={doc.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {getDocumentIcon(doc.nome)}
                          <div>
                            <p className="font-medium text-base">{doc.nome}</p>
                            {doc.descricao && (
                              <p className="text-sm text-gray-600 mt-1">{doc.descricao}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Adicionado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {doc.url && (
                          <Button
                            onClick={() => handleDownloadDocument(doc)}
                            size="sm"
                            variant="outline"
                            className="ml-4"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
