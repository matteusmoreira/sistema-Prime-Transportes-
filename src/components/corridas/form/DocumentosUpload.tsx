
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash2 } from 'lucide-react';
import { DocumentoUpload } from '@/types/corridas';

interface DocumentosUploadProps {
  documentos: DocumentoUpload[];
  onDocumentosChange: (documentos: DocumentoUpload[]) => void;
}

export const DocumentosUpload = ({ documentos, onDocumentosChange }: DocumentosUploadProps) => {
  const adicionarDocumento = () => {
    const novoDoc: DocumentoUpload = {
      id: Date.now().toString(),
      nome: '',
      descricao: ''
    };
    onDocumentosChange([...documentos, novoDoc]);
  };

  const atualizarDocumento = (id: string, campo: keyof DocumentoUpload, valor: any) => {
    onDocumentosChange(documentos.map(doc => doc.id === id ? {
      ...doc,
      [campo]: valor
    } : doc));
  };

  const removerDocumento = (id: string) => {
    onDocumentosChange(documentos.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg">Documentos</Label>
        <Button type="button" onClick={adicionarDocumento} variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
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
                placeholder="Ex: Nota Fiscal, Recibo de Combustível" 
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
              placeholder="Descreva o que é este documento" 
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
  );
};
