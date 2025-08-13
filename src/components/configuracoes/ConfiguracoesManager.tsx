import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, TestTube } from 'lucide-react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { TestEvolutionButton } from './TestEvolutionButton';

export const ConfiguracoesManager = () => {
  const { configuracoes, loading, saveConfiguracoes, testarConexao } = useConfiguracoes();
  const [formData, setFormData] = useState({
    evolution_api_url: '',
    evolution_instance_id: '',
    evolution_api_key: ''
  });
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    if (configuracoes) {
      setFormData({
        evolution_api_url: configuracoes.evolution_api_url || '',
        evolution_instance_id: configuracoes.evolution_instance_id || '',
        evolution_api_key: configuracoes.evolution_api_key || ''
      });
    }
  }, [configuracoes]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.evolution_api_url || !formData.evolution_instance_id || !formData.evolution_api_key) {
      return;
    }

    await saveConfiguracoes(formData);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    await testarConexao();
    setTestingConnection(false);
  };

  const isFormValid = formData.evolution_api_url && formData.evolution_instance_id && formData.evolution_api_key;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações da Evolution API</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credenciais da Evolution API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evolution_api_url">URL da API</Label>
            <Input
              id="evolution_api_url"
              type="url"
              placeholder="https://api.evolution.com"
              value={formData.evolution_api_url}
              onChange={(e) => handleInputChange('evolution_api_url', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evolution_instance_id">Instance ID</Label>
            <Input
              id="evolution_instance_id"
              placeholder="seu-instance-id"
              value={formData.evolution_instance_id}
              onChange={(e) => handleInputChange('evolution_instance_id', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evolution_api_key">API Key</Label>
            <Input
              id="evolution_api_key"
              type="password"
              placeholder="sua-api-key"
              value={formData.evolution_api_key}
              onChange={(e) => handleInputChange('evolution_api_key', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </Button>

            {configuracoes && (
              <>
                <Button 
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Testar Conexão
                    </>
                  )}
                </Button>
                
                <TestEvolutionButton />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};