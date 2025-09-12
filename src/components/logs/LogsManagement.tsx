import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Calendar, Database, AlertTriangle } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { toast } from 'sonner';

interface LogsManagementProps {
  onRefresh?: () => void;
}

export const LogsManagement: React.FC<LogsManagementProps> = ({ onRefresh }) => {
  const { clearAllLogs, clearLogsByPeriod } = useLogs();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [customDays, setCustomDays] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      await clearAllLogs();
      toast.success('Todos os logs foram excluídos com sucesso!');
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao excluir todos os logs:', error);
      toast.error('Erro ao excluir logs. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearByPeriod = async () => {
    if (!selectedPeriod && !customDays) {
      toast.error('Selecione um período ou informe o número de dias.');
      return;
    }

    setIsLoading(true);
    try {
      let days: number;
      
      if (selectedPeriod) {
        days = parseInt(selectedPeriod);
      } else {
        days = parseInt(customDays);
        if (isNaN(days) || days <= 0) {
          toast.error('Informe um número válido de dias.');
          return;
        }
      }

      await clearLogsByPeriod(days);
      toast.success(`Logs anteriores a ${days} dias foram excluídos com sucesso!`);
      onRefresh?.();
      setSelectedPeriod('');
      setCustomDays('');
    } catch (error) {
      console.error('Erro ao excluir logs por período:', error);
      toast.error('Erro ao excluir logs. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciamento de Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exclusão por Período */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Excluir Logs por Período</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period-select">Período Pré-definido</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger id="period-select">
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="60">Últimos 60 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="180">Últimos 6 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-days">Ou informe os dias</Label>
              <Input
                id="custom-days"
                type="number"
                placeholder="Ex: 45"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full md:w-auto"
                disabled={(!selectedPeriod && !customDays) || isLoading}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Excluir por Período
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirmar Exclusão por Período
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá excluir permanentemente todos os logs anteriores a{' '}
                  <strong>
                    {selectedPeriod ? `${selectedPeriod} dias` : `${customDays} dias`}
                  </strong>.
                  <br /><br />
                  Esta operação não pode ser desfeita. Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearByPeriod}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-200" />

        {/* Exclusão Total */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Exclusão Total</h3>
          <p className="text-sm text-gray-600">
            Remove todos os logs do sistema permanentemente. Use com extrema cautela.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full md:w-auto"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Todos os Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirmar Exclusão Total
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>ATENÇÃO:</strong> Esta ação irá excluir permanentemente TODOS os logs do sistema.
                  <br /><br />
                  Todos os registros de atividades, auditoria e histórico serão perdidos.
                  <br /><br />
                  Esta operação é <strong>IRREVERSÍVEL</strong>. Tem certeza que deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sim, Excluir Tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};