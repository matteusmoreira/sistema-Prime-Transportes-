import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users } from 'lucide-react';
import { useSolicitantes, Solicitante } from '@/hooks/useSolicitantes';
import { useEmpresas } from '@/hooks/useEmpresas';
import { SolicitanteForm } from './form/SolicitanteForm';
import { SolicitanteTable } from './table/SolicitanteTable';
import { toast } from 'sonner';

export const SolicitantesManager = () => {
  const { solicitantes, addSolicitante, updateSolicitante, deleteSolicitante } = useSolicitantes();
  const { empresas } = useEmpresas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSolicitante, setEditingSolicitante] = useState<Solicitante | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    empresaId: '',
    email: '',
    telefone: '',
    cargo: ''
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      empresaId: '',
      email: '',
      telefone: '',
      cargo: ''
    });
    setEditingSolicitante(null);
  };

  const handleEdit = (solicitante: Solicitante) => {
    setEditingSolicitante(solicitante);
    setFormData({
      nome: solicitante.nome,
      empresaId: solicitante.empresaId.toString(),
      email: solicitante.email,
      telefone: solicitante.telefone,
      cargo: solicitante.cargo
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresaId) {
      toast.error('Selecione uma empresa');
      return;
    }

    const empresa = empresas.find(e => e.id === parseInt(formData.empresaId));
    
    if (editingSolicitante) {
      updateSolicitante(editingSolicitante.id, {
        nome: formData.nome,
        empresaId: parseInt(formData.empresaId),
        empresaNome: empresa?.nome || '',
        email: formData.email,
        telefone: formData.telefone,
        cargo: formData.cargo
      });
    } else {
      addSolicitante({
        nome: formData.nome,
        empresaId: parseInt(formData.empresaId),
        empresaNome: empresa?.nome || '',
        email: formData.email,
        telefone: formData.telefone,
        cargo: formData.cargo
      });
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
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Solicitantes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Solicitante</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSolicitante ? 'Editar Solicitante' : 'Novo Solicitante'}
              </DialogTitle>
            </DialogHeader>
            <SolicitanteForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isEditing={!!editingSolicitante}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Lista de Solicitantes ({solicitantes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SolicitanteTable
            solicitantes={solicitantes}
            onEdit={handleEdit}
            onDelete={deleteSolicitante}
          />
        </CardContent>
      </Card>
    </div>
  );
};
