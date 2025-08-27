import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Corrida } from '@/types/corridas';
import { CheckCircle, Clock, AlertCircle, User, FileText, Calculator } from 'lucide-react';

interface WorkflowStatusProps {
  corrida: Corrida;
  userLevel: string;
}

export const WorkflowStatus = ({ corrida, userLevel }: WorkflowStatusProps) => {
  const getWorkflowStep = () => {
    switch (corrida.status) {
      case 'Selecionar Motorista':
        return { step: 1, label: 'Aguardando Seleção do Motorista', icon: User, color: 'orange' };
      case 'Aguardando OS':
        return { step: 2, label: 'Aguardando Preenchimento da OS', icon: FileText, color: 'blue' };
      case 'Aguardando Conferência':
        return { step: 3, label: 'Aguardando Conferência do Financeiro', icon: Calculator, color: 'purple' };
      case 'Aprovada':
        return { step: 4, label: 'Aprovada e Finalizada', icon: CheckCircle, color: 'green' };
      case 'Rejeitada':
      case 'Revisar':
        return { step: 0, label: 'Requer Revisão', icon: AlertCircle, color: 'red' };
      default:
        return { step: 1, label: corrida.status, icon: Clock, color: 'gray' };
    }
  };

  const workflow = getWorkflowStep();
  const Icon = workflow.icon;

  const canEdit = () => {
    switch (userLevel) {
      case 'Administrador':
      case 'Administração':
        return true; // Admin pode editar tudo
      case 'Financeiro':
        return ['Aguardando Conferência', 'Em Análise', 'Aprovada', 'Rejeitada', 'Revisar'].includes(corrida.status);
      case 'Motorista':
        return corrida.status === 'Aguardando OS' && corrida.motorista === userLevel;
      default:
        return false;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 text-${workflow.color}-500`} />
          <CardTitle className="text-lg">{workflow.label}</CardTitle>
        </div>
        <CardDescription>
          Status da corrida #{corrida.id} no fluxo de trabalho
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {corrida.preenchidoPorMotorista && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                OS Preenchida pelo Motorista
              </Badge>
            </div>
          )}
          
          {canEdit() && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600">
                ✓ Você pode editar esta corrida
              </Badge>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <strong>Fluxo normal:</strong> Cadastro → Seleção Motorista → Preenchimento OS → Conferência Financeiro → Aprovação
          </div>
        </div>
      </CardContent>
    </Card>
  );
};