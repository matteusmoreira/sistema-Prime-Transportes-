
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Car, Route, Calculator, TrendingUp, CheckCircle } from 'lucide-react';
import { useEmpresas } from '@/contexts/EmpresasContext';
import { useSolicitantes } from '@/hooks/useSolicitantes';
import { useMotoristas } from '@/hooks/useMotoristas';
import { useCorridas } from '@/contexts/CorridasContext';

interface DashboardHomeProps {
  userLevel: string;
  userEmail?: string;
}

export const DashboardHome = ({
  userLevel,
  userEmail
}: DashboardHomeProps) => {
  const { empresas } = useEmpresas();
  const { solicitantes } = useSolicitantes();
  const { motoristas } = useMotoristas();
  const { corridas } = useCorridas();

  // Calcular estatísticas reais
  const stats = {
    empresas: empresas.length,
    solicitantes: solicitantes.length,
    motoristas: motoristas.filter(m => m.status === 'Aprovado').length,
    corridas: corridas.length,
    corridasHoje: corridas.filter(c => {
      const hoje = new Date().toISOString().split('T')[0];
      return c.data === hoje || c.dataServico === hoje;
    }).length,
    valorTotal: corridas
      .filter(c => c.status === 'Aprovada')
      .reduce((total, c) => total + (c.valor || 0), 0)
  };

  // Calcular corridas efetuadas para motoristas (apenas Concluída e No Show)
  const corridasEfetuadas = userLevel === 'Motorista' && userEmail 
    ? corridas.filter(c => {
        // Buscar o nome do motorista pelo email
        const motoristas = JSON.parse(localStorage.getItem('motoristas') || '[]');
        const motorista = motoristas.find((m: any) => m.email === userEmail);
        
        return motorista && 
               c.motorista === motorista.nome && 
               (c.status === 'Concluída' || c.status === 'No Show');
      }).length
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corridas Total</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.corridas}</div>
            <p className="text-xs text-muted-foreground">
              Corridas realizadas
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

        {userLevel === 'Motorista' && <Card>
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
          </Card>}
      </div>

      {/* Cards informativos por nível de usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          
          
        </Card>
      </div>
    </div>;
};
