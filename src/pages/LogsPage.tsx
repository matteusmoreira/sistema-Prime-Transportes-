import React, { useState } from 'react';
import { LogsPanel } from '@/components/logs/LogsPanel';
import { LogDetails } from '@/components/logs/LogDetails';
import { LogsProvider } from '@/contexts/LogsContext';
import { SystemLog } from '@/types/logs';
import { useIsAdmin } from '@/hooks/useLogs';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';

const LogsPageContent: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const isAdmin = useIsAdmin();

  // Verificar se o usuário é administrador
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 mb-4">
              Esta página é restrita apenas para administradores do sistema.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertTriangle className="h-4 w-4" />
              <span>Entre em contato com um administrador se precisar de acesso.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {selectedLog ? (
        <LogDetails 
          log={selectedLog} 
          onBack={() => setSelectedLog(null)} 
        />
      ) : (
        <LogsPanel 
          onLogSelect={setSelectedLog} 
        />
      )}
    </div>
  );
};

export const LogsPage: React.FC = () => {
  return (
    <LogsProvider>
      <LogsPageContent />
    </LogsProvider>
  );
};