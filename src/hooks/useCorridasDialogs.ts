
import { useState } from 'react';
import { Corrida } from '@/types/corridas';

export const useCorridasDialogs = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCorrida, setEditingCorrida] = useState<Corrida | null>(null);
  const [fillingOS, setFillingOS] = useState<Corrida | null>(null);
  const [viewingCorrida, setViewingCorrida] = useState<Corrida | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const resetForm = () => {
    setEditingCorrida(null);
    setFillingOS(null);
  };

  const openEditDialog = (corrida: Corrida) => {
    console.log('=== OPEN EDIT DIALOG ===');
    console.log('Corrida recebida para edição:', corrida);
    console.log('ID da corrida:', corrida.id);
    console.log('Estado atual - editingCorrida:', editingCorrida);
    console.log('Estado atual - isDialogOpen:', isDialogOpen);
    
    try {
      setEditingCorrida(corrida);
      console.log('setEditingCorrida chamado com sucesso');
      
      setIsDialogOpen(true);
      console.log('setIsDialogOpen(true) chamado com sucesso');
      
      console.log('=== OPEN EDIT DIALOG FINALIZADO ===');
    } catch (error) {
      console.error('=== ERRO NO OPEN EDIT DIALOG ===', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    }
  };

  const openOSDialog = (corrida: Corrida) => {
    setFillingOS(corrida);
    setIsDialogOpen(true);
  };

  const openViewDialog = (corrida: Corrida) => {
    setViewingCorrida(corrida);
    setIsViewDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return {
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
  };
};
