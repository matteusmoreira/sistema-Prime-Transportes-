
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
    setEditingCorrida(corrida);
    setIsDialogOpen(true);
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
