
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Car } from 'lucide-react';
import { toast } from 'sonner';
import { useMotoristas, Motorista, DocumentoMotorista, FotoVeiculo } from '@/hooks/useMotoristas';
import { MotoristaForm } from './form/MotoristaForm';
import { MotoristaTable } from './table/MotoristaTable';

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

export const MotoristaManager = () => {
  const { 
    motoristas, 
    addMotorista, 
    updateMotorista, 
    deleteMotorista, 
    approveMotorista, 
    rejectMotorista,
    loadMotoristas
  } = useMotoristas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState<Motorista | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    cnh: '',
    cnhDataValidade: '',
    status: 'Pendente' as 'Pendente' | 'Aprovado' | 'Reprovado'
  });
  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([]);
  const [fotosVeiculo, setFotosVeiculo] = useState<FotoVeiculoUpload[]>([]);

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      cnh: '',
      cnhDataValidade: '',
      status: 'Pendente' as 'Pendente' | 'Aprovado' | 'Reprovado'
    });
    setDocumentos([]);
    setFotosVeiculo([]);
    setEditingMotorista(null);
  };

  const handleEdit = (motorista: Motorista) => {
    setEditingMotorista(motorista);
    setFormData({
      nome: motorista.nome,
      cpf: motorista.cpf,
      telefone: motorista.telefone,
      email: motorista.email,
      cnh: motorista.cnh,
      cnhDataValidade: motorista.cnhDataValidade || '',
      status: motorista.status
    });
    
    // Converter documentos existentes para o formato do formulário
    const docsExistentes: DocumentoUpload[] = motorista.documentos.map(doc => ({
      id: doc.id,
      nome: doc.nome,
      descricao: doc.descricao
    }));
    setDocumentos(docsExistentes);

    // Converter fotos existentes para o formato do formulário
    const fotosExistentes: FotoVeiculoUpload[] = (motorista.fotosVeiculo || []).map(foto => ({
      id: foto.id,
      nome: foto.nome,
      tamanho: foto.tamanho
    }));
    setFotosVeiculo(fotosExistentes);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== SUBMIT DO FORMULÁRIO ===');
    console.log('FormData:', formData);
    console.log('Documentos antes da conversão:', documentos);
    console.log('Fotos antes da conversão:', fotosVeiculo);
    
    // Validação básica
    if (!formData.nome || !formData.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    
    // Converter documentos para o formato final, incluindo o arquivo File real
    const documentosFinais: any[] = documentos.map(doc => ({
      id: doc.id,
      nome: doc.nome,
      descricao: doc.descricao,
      arquivo: doc.arquivo?.name || '',
      arquivoFile: doc.arquivo, // Incluir o arquivo File real
      dataUpload: new Date().toISOString().split('T')[0]
    }));

    // Converter fotos para o formato final, incluindo o arquivo File real
    const fotosFinais: any[] = fotosVeiculo.map(foto => ({
      id: foto.id,
      nome: foto.nome,
      arquivo: foto.arquivo?.name || '',
      arquivoFile: foto.arquivo, // Incluir o arquivo File real
      tamanho: foto.tamanho,
      dataUpload: new Date().toISOString().split('T')[0]
    }));
    
    if (editingMotorista) {
      await updateMotorista(editingMotorista.id, {
        ...formData,
        documentos: documentosFinais,
        fotosVeiculo: fotosFinais
      });
      await loadMotoristas(); // Refresh data
    } else {
      const { status, ...motoristaDados } = formData;
      await addMotorista({
        ...motoristaDados,
        documentos: documentosFinais,
        fotosVeiculo: fotosFinais,
        status // Pass the admin-selected status
      });
      await loadMotoristas(); // Refresh data
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Motoristas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Motorista</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMotorista ? 'Editar Motorista' : 'Novo Motorista'}
              </DialogTitle>
            </DialogHeader>
            <MotoristaForm
              formData={formData}
              onInputChange={handleInputChange}
              onFileChange={setDocumentos}
              onFotosChange={setFotosVeiculo}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isEditing={!!editingMotorista}
              documentos={documentos}
              fotosVeiculo={fotosVeiculo}
              motoristaId={editingMotorista?.id}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span>Lista de Motoristas ({motoristas.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MotoristaTable
            motoristas={motoristas}
            onEdit={handleEdit}
            onDelete={deleteMotorista}
            onApprove={approveMotorista}
            onReject={rejectMotorista}
          />
        </CardContent>
      </Card>
    </div>
  );
};
