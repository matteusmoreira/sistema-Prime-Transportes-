
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Bell, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAlertas } from '@/contexts/AlertasContext';
import { AlertaForm } from './AlertaForm';
import { AlertasTable } from './AlertasTable';

export const AlertasManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlerta, setEditingAlerta] = useState<any>(null);
  const { alertas, excluirAlerta, atualizarAlerta } = useAlertas();

  const handleEdit = (alerta: any) => {
    setEditingAlerta(alerta);
    setIsDialogOpen(true);
  };

  const handleToggleAtivo = (alertaId: number, ativo: boolean) => {
    atualizarAlerta(alertaId, { ativo: !ativo });
  };

  const handleDelete = (alertaId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este alerta?')) {
      excluirAlerta(alertaId);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAlerta(null);
  };

  const alertasAtivos = alertas.filter(a => a.ativo).length;
  const alertasUrgentes = alertas.filter(a => a.urgente && a.ativo).length;
  const alertasExpirandoHoje = alertas.filter(a => {
    if (!a.dataExpiracao) return false;
    const hoje = new Date().toDateString();
    return new Date(a.dataExpiracao).toDateString() === hoje;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Sistema de Alertas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAlerta(null)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Alerta</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAlerta ? 'Editar Alerta' : 'Novo Alerta'}
              </DialogTitle>
            </DialogHeader>
            <AlertaForm
              editingAlerta={editingAlerta}
              onCancel={closeDialog}
              onSuccess={closeDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alertasAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertasUrgentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiram Hoje</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alertasExpirandoHoje}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Lista de Alertas ({alertas.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertasTable
            alertas={alertas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAtivo={handleToggleAtivo}
          />
        </CardContent>
      </Card>
    </div>
  );
};
