
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Filter, Calendar, Building2, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Relatorio {
  id: number;
  tipo: string;
  nome: string;
  periodo: string;
  geradoEm: string;
  geradoPor: string;
  status: 'Gerado' | 'Processando' | 'Erro';
  tamanho: string;
}

interface DadosRelatorio {
  totalCorridas: number;
  corridasAprovadas: number;
  corridasReprovadas: number;
  valorTotal: number;
  empresasAtendidas: number;
  motoristasAtivos: number;
  kmRodados: number;
}

export const RelatoriosManager = () => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);

  const [filtros, setFiltros] = useState({
    tipoRelatorio: '',
    dataInicio: '',
    dataFim: '',
    empresa: '',
    motorista: ''
  });

  const [dadosRelatorio] = useState<DadosRelatorio>({
    totalCorridas: 0,
    corridasAprovadas: 0,
    corridasReprovadas: 0,
    valorTotal: 0,
    empresasAtendidas: 0,
    motoristasAtivos: 0,
    kmRodados: 0
  });

  const empresas = ['Todas'];
  const motoristas = ['Todos'];

  const handleGerarRelatorio = (tipo: 'corridas' | 'financeiro' | 'motoristas') => {
    if (!filtros.dataInicio || !filtros.dataFim) {
      toast.error('Selecione o período para gerar o relatório');
      return;
    }

    const novoRelatorio: Relatorio = {
      id: relatorios.length + 1,
      tipo: tipo === 'corridas' ? 'Corridas' : tipo === 'financeiro' ? 'Financeiro' : 'Motoristas',
      nome: `Relatório de ${tipo === 'corridas' ? 'Corridas' : tipo === 'financeiro' ? 'Financeiro' : 'Motoristas'} - ${new Date().toLocaleDateString('pt-BR')}`,
      periodo: `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`,
      geradoEm: new Date().toISOString(),
      geradoPor: 'Admin System',
      status: 'Processando',
      tamanho: '-'
    };

    setRelatorios([novoRelatorio, ...relatorios]);
    toast.success('Relatório sendo gerado...');

    // Simular processamento
    setTimeout(() => {
      setRelatorios(prev => prev.map(r => 
        r.id === novoRelatorio.id 
          ? { ...r, status: 'Gerado' as const, tamanho: `${(Math.random() * 3 + 1).toFixed(1)} MB` }
          : r
      ));
      toast.success('Relatório gerado com sucesso!');
    }, 3000);
  };

  const handleDownload = (relatorio: Relatorio, formato: 'excel' | 'pdf') => {
    if (relatorio.status !== 'Gerado') {
      toast.error('Relatório ainda não está disponível para download');
      return;
    }
    
    toast.success(`Download do relatório em ${formato.toUpperCase()} iniciado`);
    // Aqui seria implementada a lógica real de download
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      'Gerado': 'default',
      'Processando': 'secondary',
      'Erro': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
      </div>

      {/* Dashboard de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Total Corridas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{dadosRelatorio.totalCorridas}</p>
            <p className="text-sm text-gray-600">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-500" />
              <span>Empresas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{dadosRelatorio.empresasAtendidas}</p>
            <p className="text-sm text-gray-600">Atendidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span>Motoristas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{dadosRelatorio.motoristasAtivos}</p>
            <p className="text-sm text-gray-600">Ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span>Valor Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">R$ {dadosRelatorio.valorTotal.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros para Relatórios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={filtros.empresa} onValueChange={(value) => setFiltros(prev => ({ ...prev, empresa: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Motorista</Label>
              <Select value={filtros.motorista} onValueChange={(value) => setFiltros(prev => ({ ...prev, motorista: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent>
                  {motoristas.map((motorista) => (
                    <SelectItem key={motorista} value={motorista}>{motorista}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geração de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Relatório de Corridas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Relatório completo de todas as corridas realizadas no período selecionado.
            </p>
            <Button 
              className="w-full" 
              onClick={() => handleGerarRelatorio('corridas')}
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Relatório Financeiro</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Relatório detalhado de faturamento, aprovações e reprovações.
            </p>
            <Button 
              className="w-full" 
              onClick={() => handleGerarRelatorio('financeiro')}
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Relatório de Motoristas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Relatório de performance e atividades dos motoristas.
            </p>
            <Button 
              className="w-full" 
              onClick={() => handleGerarRelatorio('motoristas')}
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          {relatorios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum relatório gerado ainda.</p>
              <p className="text-sm">Selecione um período e gere seu primeiro relatório.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Gerado em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorios.map((relatorio) => (
                  <TableRow key={relatorio.id}>
                    <TableCell>
                      <Badge variant="outline">{relatorio.tipo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{relatorio.nome}</TableCell>
                    <TableCell>{relatorio.periodo}</TableCell>
                    <TableCell>{new Date(relatorio.geradoEm).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{getStatusBadge(relatorio.status)}</TableCell>
                    <TableCell>{relatorio.tamanho}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(relatorio, 'excel')}
                          disabled={relatorio.status !== 'Gerado'}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Excel
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(relatorio, 'pdf')}
                          disabled={relatorio.status !== 'Gerado'}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
