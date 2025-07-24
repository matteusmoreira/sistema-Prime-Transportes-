
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';

interface CorridaRejectDialogProps {
  corrida: CorridaFinanceiro | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (corrida: CorridaFinanceiro, motivo: string) => void;
}

export const CorridaRejectDialog = ({ 
  corrida, 
  isOpen, 
  onOpenChange, 
  onReject 
}: CorridaRejectDialogProps) => {
  const [motivoReprovacao, setMotivoReprovacao] = useState('');

  const handleReject = () => {
    if (!corrida || !motivoReprovacao.trim()) {
      toast.error('Informe o motivo da reprovação');
      return;
    }

    onReject(corrida, motivoReprovacao);
    setMotivoReprovacao('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setMotivoReprovacao('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reprovar Corrida</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Motivo da Reprovação *</Label>
            <Textarea
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              placeholder="Descreva o motivo da reprovação..."
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
            >
              Reprovar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
