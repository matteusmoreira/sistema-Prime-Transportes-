import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User, Database, Hash } from 'lucide-react';
import { SystemLog } from '@/types/logs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogDetailsProps {
  log: SystemLog;
  onBack: () => void;
}

export const LogDetails: React.FC<LogDetailsProps> = ({ log, onBack }) => {
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEntityDisplayName = (entity: string) => {
    const map: Record<string, string> = {
      empresas: 'Empresas',
      solicitantes: 'Solicitantes',
      motoristas: 'Motoristas',
      corridas: 'Corridas',
      system_logs: 'Logs do Sistema',
    };
    return map[entity] || entity;
  };

  const formatJson = (data: any) => {
    if (!data) return 'N/A';
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Log</h1>
          <p className="text-gray-600">Informações completas da atividade registrada</p>
        </div>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Badge className={getActionBadgeColor(log.action_type)}>{log.action_type}</Badge>
            <span>{getEntityDisplayName(log.entity_type)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID do Log */}
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">ID do Log</p>
                <p className="text-sm text-gray-600 font-mono">{log.id}</p>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Data e Hora</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(log.created_at), 'dd/MM/yyyy \\às HH:mm:ss', { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Usuário */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Usuário</p>
                <p className="text-sm text-gray-600">{log.user_email || 'Sistema'}</p>
              </div>
            </div>

            {/* Entidade */}
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Entidade</p>
                <p className="text-sm text-gray-600">{getEntityDisplayName(log.entity_type)}</p>
              </div>
            </div>

            {/* ID da Entidade */}
            {log.entity_id && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">ID da Entidade</p>
                  <p className="text-sm text-gray-600 font-mono">{log.entity_id}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados Anteriores */}
      {log.old_data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Anteriores</CardTitle>
            <p className="text-sm text-gray-600">Estado dos dados antes da modificação</p>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">{formatJson(log.old_data)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados Novos */}
      {log.new_data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Novos</CardTitle>
            <p className="text-sm text-gray-600">Estado dos dados após a modificação</p>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">{formatJson(log.new_data)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Timestamp UTC</p>
              <p className="text-gray-600 font-mono">{log.created_at}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Tipo de Ação</p>
              <p className="text-gray-600">{log.action_type}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Entidade</p>
              <p className="text-gray-600 font-mono">{log.entity_type}</p>
            </div>
            {log.ip_address && (
              <div>
                <p className="font-medium text-gray-700">Endereço IP</p>
                <p className="text-gray-600 font-mono">{String(log.ip_address)}</p>
              </div>
            )}
            {log.user_agent && (
              <div className="md:col-span-2">
                <p className="font-medium text-gray-700">User Agent</p>
                <p className="text-gray-600 font-mono break-all">{log.user_agent}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};