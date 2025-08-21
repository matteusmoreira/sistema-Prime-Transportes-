
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CorridaForm } from './CorridaForm';
import { OSForm } from './form/OSForm';
import { CorridaDetails } from './CorridaDetails';
import { Corrida } from '@/types/corridas';

interface CorridasDialogsProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingCorrida: Corrida | null;
  fillingOS: Corrida | null;
  viewingCorrida: Corrida | null;
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: (open: boolean) => void;
  userLevel: string;
  onFormSubmit: (formData: any, documentos: any) => void;
  onOSSubmit: (osData: any, documentos: any) => void;
  onCancel: () => void;
}

export const CorridasDialogs = ({
  isDialogOpen,
  setIsDialogOpen,
  editingCorrida,
  fillingOS,
  viewingCorrida,
  isViewDialogOpen,
  setIsViewDialogOpen,
  userLevel,
  onFormSubmit,
  onOSSubmit,
  onCancel
}: CorridasDialogsProps) => {
  const getDialogTitle = () => {
    if (fillingOS) return 'Preencher Ordem de Serviço';
    if (editingCorrida) return 'Editar Corrida';
    return 'Nova Corrida';
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          
          {fillingOS ? (
            <OSForm
              corrida={fillingOS}
              onSubmit={onOSSubmit}
              onCancel={onCancel}
              userLevel={userLevel}
            />
          ) : (
            <CorridaForm
              editingCorrida={editingCorrida}
              onSubmit={onFormSubmit}
              onCancel={onCancel}
              isFillingOS={false}
              userLevel={userLevel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Corrida #{viewingCorrida?.id}</DialogTitle>
          </DialogHeader>
          {viewingCorrida && <CorridaDetails corrida={viewingCorrida} />}
        </DialogContent>
      </Dialog>
    </>
  );
};
