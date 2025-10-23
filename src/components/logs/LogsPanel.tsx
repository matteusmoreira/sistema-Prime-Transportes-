import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollText, Search, Filter, ChevronLeft, ChevronRight, Calendar, User, Database, Settings, AlertTriangle, Eye } from 'lucide-react';
import { LogsManagement } from './LogsManagement';
import { useLogs } from '@/contexts/LogsContext';
import { useIsAdmin } from '@/hooks/useLogs';
import { SystemLog } from '@/types/logs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogsPanelProps {
  onLogSelect?: (log: SystemLog) => void;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ onLogSelect }) => {
  const { logs, loading, filters, setFilters, fetchLogs, clearAllLogs } = useLogs();
  const isAdmin = useIsAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtrar logs baseado nos filtros e termo de busca
  const filteredLogs = logs.filter(log => {
    const textBlob = [
      log.action_type,
      log.entity_type,
      log.user_email || '',
      JSON.stringify(log.new_data || {}),
      JSON.stringify(log.old_data || {})
    ].join(' ').toLowerCase();

    const matchesSearch = !searchTerm || textBlob.includes(searchTerm.toLowerCase());

    const matchesAction = !filters.action_type || log.action_type === filters.action_type;
    const matchesTable = !filters.entity_type || log.entity_type === filters.entity_type;
    const matchesUser = !filters.user_email || log.user_email === filters.user_email;

    const matchesDateFrom = !filters.date_from || 
      new Date(log.created_at) >= new Date(filters.date_from);
    const matchesDateTo = !filters.date_to || 
      new Date(log.created_at) <= new Date(filters.date_to);

    return matchesSearch && matchesAction && matchesTable && matchesUser && 
           matchesDateFrom && matchesDateTo;
  });

  // Paginação
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Garante que a página atual esteja sempre dentro do intervalo válido após mudanças nos filtros/pesquisa
  useEffect(() => {
    if (currentPage > totalPages || (totalPages === 0 && currentPage !== 1)) {
      const nextPage = Math.max(1, totalPages);
      console.debug('[LogsPanel] Ajustando página devido a mudança nos filtros/pesquisa', { currentPage, totalPages, nextPage });
      setCurrentPage(nextPage);
    }
  }, [totalPages, currentPage]);

  // Sempre voltar para a primeira página quando filtros ou termo de busca mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filters.action_type,
    filters.entity_type,
    filters.user_email,
    filters.date_from,
    filters.date_to,
  ]);

  const handleClearAllLogs = async () => {
    if (!isAdmin()) {
      toast.error('Acesso negado. Apenas administradores podem excluir logs.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir TODOS os logs? Esta ação não pode ser desfeita.')) {
      try {
        await clearAllLogs();
        await fetchLogs();
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro ao excluir logs:', error);
      }
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames: Record<string, string> = {
      'empresas': 'Empresas',
      'solicitantes': 'Solicitantes',
      'motoristas': 'Motoristas',
      'corridas': 'Corridas',
      'relatorios': 'Relatórios',
      'system_logs': 'Logs do Sistema'
    };
    return tableNames[tableName] || tableName;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ScrollText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logs do Sistema</h1>
            <p className="text-gray-600">Monitore todas as atividades do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Database className="h-4 w-4" />
          <span>{filteredLogs.length} registros</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Visualizar Logs</TabsTrigger>
          <TabsTrigger value="management">Gerenciar Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-6">

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por ação, tabela, usuário ou detalhes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros avançados */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                value={filters.action_type ?? '__ALL__'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    action_type: (value as string) === '__ALL__' ? undefined : (value as any),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criar</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Excluir</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.entity_type ?? '__ALL__'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    entity_type: (value as string) === '__ALL__' ? undefined : (value as any),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">Todas as entidades</SelectItem>
                  <SelectItem value="empresas">Empresas</SelectItem>
                  <SelectItem value="solicitantes">Solicitantes</SelectItem>
                  <SelectItem value="motoristas">Motoristas</SelectItem>
                  <SelectItem value="corridas">Corridas</SelectItem>
                  <SelectItem value="relatorios">Relatórios</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Data inicial"
                value={filters.date_from || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
              />

              <Input
                type="date"
                placeholder="Data final"
                value={filters.date_to || ''}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Logs de Atividades</span>
            <Badge variant="secondary">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'registro' : 'registros'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum log encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onLogSelect?.(log)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionBadgeColor(log.action_type)}>
                        {log.action_type}
                      </Badge>
                      <span className="font-medium">{getTableDisplayName(log.entity_type)}</span>
                      {log.entity_id && (
                        <span className="text-sm text-gray-500">ID: {log.entity_id}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      {onLogSelect && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Usuário:</strong> {log.user_email || 'Sistema'}</p>
                    {log.new_data && (
                      <p className="truncate"><strong>Novo:</strong> {JSON.stringify(log.new_data)}</p>
                    )}
                    {log.old_data && (
                      <p className="truncate"><strong>Anterior:</strong> {JSON.stringify(log.old_data)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="management">
          <LogsManagement onRefresh={fetchLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};