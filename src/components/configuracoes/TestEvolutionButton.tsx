import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const TestEvolutionButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Iniciando teste de conexão...');
      
      const { data, error } = await supabase.functions.invoke('test-evolution-connection');

      if (error) {
        console.error('❌ Erro na função:', error);
        toast.error('Erro ao testar conexão com Evolution API');
        setTestResult('error');
        return;
      }

      console.log('📄 Resultado do teste:', data);

      if (data?.success) {
        toast.success('✅ Conexão com Evolution API funcionando!');
        setTestResult('success');
      } else {
        toast.error(`❌ Erro na conexão: ${data?.message || 'Erro desconhecido'}`);
        setTestResult('error');
      }
    } catch (error) {
      console.error('💥 Erro ao testar conexão:', error);
      toast.error('Erro ao testar conexão com Evolution API');
      setTestResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (testResult === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (testResult === 'error') return <XCircle className="h-4 w-4 text-red-600" />;
    return <TestTube className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (testResult === 'success') return 'default';
    if (testResult === 'error') return 'destructive';
    return 'outline';
  };

  return (
    <Button 
      onClick={testConnection}
      disabled={isLoading}
      variant={getButtonVariant()}
      className="flex items-center space-x-2"
    >
      {getButtonIcon()}
      <span>
        {isLoading ? 'Testando...' : 'Testar Conexão Evolution API'}
      </span>
    </Button>
  );
};