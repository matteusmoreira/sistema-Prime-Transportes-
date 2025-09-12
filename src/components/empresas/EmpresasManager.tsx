
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, TestTube } from 'lucide-react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { EmpresaForm } from './form/EmpresaForm';
import { EmpresaTable } from './table/EmpresaTable';
import { useLogs } from '@/contexts/LogsContext';

export const EmpresasManager = () => {
  const { empresas, addEmpresa, updateEmpresa, deleteEmpresa } = useEmpresas();
  const { logAction } = useLogs();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    observacoes: '',
    centroCusto: ''
  });

  const resetForm = () => {
    // console.log('Resetando formulário');
    setFormData({
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      observacoes: '',
      centroCusto: ''
    });
    setEditingEmpresa(null);
  };

  const handleEdit = (empresa: Empresa) => {
    // console.log('Editando empresa:', empresa);
    setEditingEmpresa(empresa);
    setFormData({
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      telefone: empresa.telefone,
      email: empresa.email,
      endereco: empresa.endereco,
      observacoes: empresa.observacoes,
      centroCusto: empresa.centroCusto || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Processando submissão:', { formData, editingEmpresa });
    
    if (editingEmpresa) {
      // console.log('Atualizando empresa existente');
      updateEmpresa(editingEmpresa.id, formData);
    } else {
      // console.log('Adicionando nova empresa');
      addEmpresa(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // console.log(`Campo ${field} alterado para:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDialogOpen = () => {
    // console.log('Abrindo dialog para nova empresa');
    resetForm();
    setIsDialogOpen(true);
  };

  const testLogSystem = async () => {
    console.log('🧪 Testando sistema de logs...');
    try {
      await logAction({
        action_type: 'CREATE',
        entity_type: 'empresas',
        entity_id: '999',
        new_data: { nome: 'Teste Log System', cnpj: '12345678901234' }
      });
      console.log('✅ Teste de log realizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no teste de log:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Empresas</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={testLogSystem} variant="outline" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Testar Logs</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleDialogOpen} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nova Empresa</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
                </DialogTitle>
              </DialogHeader>
              <EmpresaForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => {
                  // console.log('Cancelando cadastro/edição');
                  setIsDialogOpen(false);
                  resetForm();
                }}
                isEditing={!!editingEmpresa}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Lista de Empresas ({empresas.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmpresaTable
            empresas={empresas}
            onEdit={handleEdit}
            onDelete={deleteEmpresa}
          />
        </CardContent>
      </Card>
    </div>
  );
};
