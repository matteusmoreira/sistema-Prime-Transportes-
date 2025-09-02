import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Route, ChevronDown, ChevronUp, SlidersHorizontal, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { CorridaForm } from './CorridaForm';
import { CorridasTable } from './CorridasTable';
import { CorridasDialogs } from './CorridasDialogs';
import { useCorridasDialogs } from '@/hooks/useCorridasDialogs';
import { useCorridasLogic } from '@/hooks/useCorridasLogic';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMotoristas } from '@/hooks/useMotoristas';
import { CorridasFilters } from './CorridasFilters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { CorridaCard } from './mobile/CorridaCard';

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
    selectMotorista,
    lastUpdated,
    refreshCorridas,
    isRealtimeConnected
  } = useCorridasLogic(userLevel, userEmail);

  // Filtro por mês (existente)
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const corridasPorMes = (selectedMonth === 'all')
    ? corridasFiltradas
    : corridasFiltradas.filter((c: any) => {
        const dateStr = c?.dataServico || c?.data;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        return String(d.getMonth() + 1) === selectedMonth;
      });

  // Novos filtros: Data, Motorista, Nº OS
  const { motoristas } = useMotoristas();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMotorista, setSelectedMotorista] = useState<string>('all');
  const [numeroOS, setNumeroOS] = useState<string>('');

  // Abrir filtros por padrão em telas grandes; colapsar em telas pequenas
  const [filtersOpen, setFiltersOpen] = useState<boolean>(true);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        setFiltersOpen(false);
      }
    } catch (e) {
      // no-op
    }
  }, []);

  const applyDateFilter = (list: any[]) => {
    if (!startDate && !endDate) return list;
    return list.filter((c: any) => {
      const raw = c?.dataServico || c?.data;
      if (!raw) return false;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return false;
      if (startDate) {
        const s = new Date(startDate);
        if (d < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate);
        // incluir o dia final inteiro
        e.setHours(23,59,59,999);
        if (d > e) return false;
      }
      return true;
    });
  };

  const applyMotoristaFilter = (list: any[]) => {
    if (!selectedMotorista || selectedMotorista === 'all') return list;
    return list.filter((c: any) => (c?.motorista || '') === selectedMotorista);
  };

  const applyNumeroOSFilter = (list: any[]) => {
    if (!numeroOS) return list;
    const query = numeroOS.toLowerCase();
    return list.filter((c: any) => String(c?.numeroOS ?? '').toLowerCase().includes(query));
  };

  const corridasFiltradasFinal = applyNumeroOSFilter(
    applyMotoristaFilter(
      applyDateFilter(corridasPorMes)
    )
  );

  const isMobile = useIsMobile();

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
      horaChegada: osData.horaChegada,
      dataServico: osData.data,
      documentos: documentos // Garantir que os documentos sejam passados
    };

    fillOS(fillingOS!.id, corridaData);
    closeDialog();
  };

  const clearAllFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedMotorista('all');
    setNumeroOS('');
  };

  // Função para formatar a última atualização
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes === 1) return '1 minuto atrás';
    if (minutes < 60) return `${minutes} minutos atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hora atrás';
    if (hours < 24) return `${hours} horas atrás`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 dia atrás';
    if (days < 30) return `${days} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
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
        <CardHeader className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center space-x-2">
              <Route className="h-5 w-5" />
              <span>Lista de Corridas ({corridasFiltradasFinal.length})</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mês:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
              {userLevel === 'Motorista' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshCorridas}
                  className="inline-flex items-center gap-2"
                  title="Atualizar corridas"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Atualizar</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen((v) => !v)}
                className="inline-flex items-center gap-2"
                title={filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
                aria-label={filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {userLevel === 'Motorista' && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              {lastUpdated && (
                <div>
                  Última atualização: {formatLastUpdated(lastUpdated)}
                </div>
              )}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isRealtimeConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isRealtimeConnected ? (
                  <><Wifi className="h-3 w-3" /> Tempo Real</>
                ) : (
                  <><WifiOff className="h-3 w-3" /> Polling</>
                )}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent>
              <CorridasFilters
                startDate={startDate}
                endDate={endDate}
                motorista={selectedMotorista}
                numeroOS={numeroOS}
                motoristas={motoristas.map(m => ({ id: m.id, nome: m.nome }))}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onMotoristaChange={setSelectedMotorista}
                onNumeroOSChange={setNumeroOS}
                onClear={clearAllFilters}
                compact
              />
            </CollapsibleContent>
          </Collapsible>
          {/* Tabela */}
          <div className="w-full overflow-x-auto max-h-[70vh] overflow-y-auto rounded-md border">
            {!isMobile ? (
              <CorridasTable
                corridas={corridasFiltradasFinal}
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
            ) : (
              <div className="grid grid-cols-1 gap-3 p-3 max-h-[70vh] overflow-y-auto">
                {corridasFiltradasFinal.length === 0 ? (
                  <div className="mt-8 rounded-xl border bg-card p-6 text-center shadow-sm">
                    <div className="text-base font-semibold text-foreground">Nenhuma corrida encontrada</div>
                    <div className="mt-1 text-sm text-muted-foreground">Tente ajustar os filtros ou a busca.</div>
                  </div>
                ) : (
                  corridasFiltradasFinal.map((c) => (
                    <CorridaCard
                      key={c.id}
                      corrida={c}
                      userLevel={userLevel}
                      onView={openViewDialog}
                      onEdit={handleEditClick}
                      onFillOS={handleFillOSClick}
                    />
                  ))
                )}
              </div>
            )}
          </div>
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


// Remover bloco duplicado no final do arquivo (se existir)
