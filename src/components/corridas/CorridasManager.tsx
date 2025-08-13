import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Route } from 'lucide-react';
import { CorridaForm } from './CorridaForm';
import { CorridasTable } from './CorridasTable';
import { CorridasDialogs } from './CorridasDialogs';
import { useCorridasDialogs } from '@/hooks/useCorridasDialogs';
import { useCorridasLogic } from '@/hooks/useCorridasLogic';
import { toast } from 'sonner';

interface CorridasManagerProps {
  userLevel?: string;
  userEmail?: string;
}

export const CorridasManager = ({
  userLevel = 'Administrador',
  userEmail = ''
}: CorridasManagerProps) => {

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingCorrida,
    fillingOS,
    viewingCorrida,
    isViewDialogOpen,
    setIsViewDialogOpen,
    openEditDialog,
    openOSDialog,
    openViewDialog,
    closeDialog,
    resetForm
  } = useCorridasDialogs();

  const {
    corridasFiltradas,
    handleEdit,
    handleFillOS,
    processFormData,
    addCorrida,
    updateCorrida,
    fillOS,
    deleteCorrida,
    approveCorrida,
    rejectCorrida,
    selectMotorista
  } = useCorridasLogic(userLevel, userEmail);


  const handleEditClick = (corrida: any) => {
    if (handleEdit(corrida)) {
      openEditDialog(corrida);
    } else {
      toast.error('Você não tem permissão para editar esta corrida');
    }
  };

  const handleFillOSClick = (corrida: any) => {
    if (handleFillOS(corrida)) {
      openOSDialog(corrida);
    }
  };

  const handleFormSubmit = (formData: any, documentos: any) => {
    const corridaData = processFormData(formData, documentos);

    if (fillingOS) {
      fillOS(fillingOS.id, corridaData);
    } else if (editingCorrida) {
      updateCorrida(editingCorrida.id, corridaData);
    } else {
      addCorrida(corridaData);
    }

    closeDialog();
  };

  const handleOSSubmit = (osData: any, documentos: any) => {
    const corridaData = {
      ...osData,
      horaInicio: osData.horaSaida,
      horaFim: osData.horaChegada,
      dataServico: osData.data,
      documentos: documentos // Garantir que os documentos sejam passados
    };

    fillOS(fillingOS!.id, corridaData);
    closeDialog();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          {userLevel === 'Motorista' ? 'Minhas Corridas' : 'Gerenciar Corridas'}
        </h2>
{userLevel !== 'Motorista' && (
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Corrida</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Lista de Corridas ({corridasFiltradas.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CorridasTable
            corridas={corridasFiltradas}
            userLevel={userLevel}
            userEmail={userEmail}
            onView={openViewDialog}
            onEdit={handleEditClick}
            onFillOS={handleFillOSClick}
            onDelete={deleteCorrida}
            onApprove={approveCorrida}
            onReject={rejectCorrida}
            onSelectMotorista={selectMotorista}
          />
        </CardContent>
      </Card>

      <CorridasDialogs
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingCorrida={editingCorrida}
        fillingOS={fillingOS}
        viewingCorrida={viewingCorrida}
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        userLevel={userLevel}
        onFormSubmit={handleFormSubmit}
        onOSSubmit={handleOSSubmit}
        onCancel={closeDialog}
      />
    </div>
  );
};
