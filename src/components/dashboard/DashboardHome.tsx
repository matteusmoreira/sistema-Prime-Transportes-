
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Car, Route, Calculator, TrendingUp, CheckCircle, Clock, FileText } from 'lucide-react';
import { useEmpresas } from '@/contexts/EmpresasContext';
import { useSolicitantes } from '@/hooks/useSolicitantes';
import { useMotoristas } from '@/hooks/useMotoristas';
import { useCorridas } from '@/contexts/CorridasContext';
import { useState } from 'react';
import { HistoricoMotoristaDialog } from './HistoricoMotoristaDialog';
import { CorridasDialogs } from '@/components/corridas/CorridasDialogs';
import { useCorridasDialogs } from '@/hooks/useCorridasDialogs';
import { useCorridasLogic } from '@/hooks/useCorridasLogic';

interface DashboardHomeProps {
  userLevel: string;
  userEmail?: string;
}

export const DashboardHome = ({
  userLevel,
  userEmail
}: DashboardHomeProps) => {
  const { empresas, loading: empresasLoading } = useEmpresas();
  const { solicitantes } = useSolicitantes();
  const { motoristas } = useMotoristas();
  const { corridas } = useCorridas();
  const [showHistorico, setShowHistorico] = useState(false);
  
  // Usar o hook de diálogos de corridas para funcionalidades de OS
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingCorrida,
    fillingOS,
    viewingCorrida,
    isViewDialogOpen,
    setIsViewDialogOpen,
    openOSDialog,
    openViewDialog,
    closeDialog
  } = useCorridasDialogs();

  // Integrar lógica de corridas
  const corridasLogic = useCorridasLogic(userLevel, userEmail);

  const handleFormSubmit = (formData: any, documentos: any) => {
    // Este será usado apenas para edições, não aplicável aqui
    console.log('Form submit:', formData);
  };

  const handleOSSubmit = (osData: any, documentos: any) => {
    console.log('=== HANDLE OS SUBMIT ===');
    console.log('OS Data recebido:', osData);
    console.log('Documentos recebidos:', documentos);
    
    if (fillingOS) {
      const corridaData = corridasLogic.processFormData(osData, documentos);
      console.log('Dados processados para fillOS:', corridaData);
      corridasLogic.fillOS(fillingOS.id, corridaData);
    }
    
    closeDialog();
  };

  const handleFillOS = (corrida: any) => {
    openOSDialog(corrida);
  };

  const handleView = (corrida: any) => {
    openViewDialog(corrida);
  };

  const handleCancel = () => {
    closeDialog();
  };

  // Se ainda está carregando dados essenciais, mostrar loading
  if (empresasLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-pulse text-gray-600">Carregando dados...</div>
        </div>
      </div>
    );
  }

  // Buscar motorista logado se for motorista
  const motoristaLogado = userLevel === 'Motorista' && userEmail 
    ? motoristas.find((m: any) => m.email === userEmail)
    : null;

  // Filtrar corridas do motorista se for motorista
  const corridasDoMotorista = userLevel === 'Motorista' && motoristaLogado
    ? corridas.filter(c => c.motorista === motoristaLogado.nome)
    : corridas;

  // Calcular estatísticas baseadas no nível do usuário
  const stats = {
    empresas: empresas.length,
    solicitantes: solicitantes.length,
    motoristas: motoristas.filter(m => m.status === 'Aprovado').length,
    corridas: userLevel === 'Motorista' ? corridasDoMotorista.length : corridas.length,
    corridasHoje: (userLevel === 'Motorista' ? corridasDoMotorista : corridas).filter(c => {
      const hoje = new Date().toISOString().split('T')[0];
      return c.data === hoje || c.dataServico === hoje;
    }).length,
    valorTotal: (userLevel === 'Motorista' ? corridasDoMotorista : corridas)
      .filter(c => c.status === 'Aprovada')
      .reduce((total, c) => total + (userLevel === 'Motorista' ? (c.valorMotorista || 0) : (c.valor || 0)), 0)
  };

  // Calcular corridas efetuadas para motoristas (apenas Concluída e No Show)
  const corridasEfetuadas = userLevel === 'Motorista' 
    ? corridasDoMotorista.filter(c => c.status === 'Concluída' || c.status === 'No Show').length
    : 0;

  // Calcular corridas pendentes para motoristas
  const corridasPendentes = userLevel === 'Motorista'
    ? corridasDoMotorista.filter(c => c.status === 'Aguardando OS' || c.status === 'Aguardando Conferência').length
    : 0;
  
  return <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Bem-vindo ao sistema Prime Transportes - {userLevel}
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(userLevel === 'Administrador' || userLevel === 'Administração') && <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.empresas}</div>
                <p className="text-xs text-muted-foreground">
                  Empresas cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.solicitantes}</div>
                <p className="text-xs text-muted-foreground">
                  Solicitantes ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.motoristas}</div>
                <p className="text-xs text-muted-foreground">
                  Motoristas aprovados
                </p>
              </CardContent>
            </Card>
          </>}

        <Card 
          className={userLevel === 'Motorista' ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
          onClick={userLevel === 'Motorista' ? () => setShowHistorico(true) : undefined}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corridas Total</CardTitle>
            <div className="flex items-center gap-1">
              <Route className="h-4 w-4 text-muted-foreground" />
              {userLevel === 'Motorista' && <FileText className="h-3 w-3 text-blue-500" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.corridas}</div>
            <p className="text-xs text-muted-foreground">
              {userLevel === 'Motorista' ? 'Clique para ver histórico' : 'Corridas realizadas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corridas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.corridasHoje}</div>
            <p className="text-xs text-muted-foreground">
              Corridas de hoje
            </p>
          </CardContent>
        </Card>

        {userLevel === 'Motorista' && <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corridas Efetuadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corridasEfetuadas}</div>
              <p className="text-xs text-muted-foreground">
                Concluídas e No Show
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corridas Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corridasPendentes}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando ação
              </p>
            </CardContent>
          </Card>
        </>}

        {(userLevel === 'Administrador' || userLevel === 'Financeiro') && <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Faturamento total
              </p>
            </CardContent>
          </Card>}
      </div>

      {/* Diálogo de Histórico para Motoristas */}
      {userLevel === 'Motorista' && userEmail && (
        <>
          <HistoricoMotoristaDialog
            open={showHistorico}
            onOpenChange={setShowHistorico}
            corridas={corridas}
            motoristaEmail={userEmail}
            motoristas={motoristas}
            onFillOS={handleFillOS}
            onViewCorrida={handleView}
          />
          
          {/* Diálogos de Corridas para funcionalidades de OS */}
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
            onCancel={handleCancel}
          />
        </>
      )}
    </div>;
};
