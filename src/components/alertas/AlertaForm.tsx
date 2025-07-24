
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useAlertas, type Alerta } from '@/contexts/AlertasContext';
import { useMotoristas } from '@/hooks/useMotoristas';

interface AlertaFormProps {
  editingAlerta?: Alerta | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormData {
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  destinatarios: 'todos' | 'motoristas' | 'especifico';
  motoristaEspecifico: string;
  dataExpiracao: string;
  ativo: boolean;
  urgente: boolean;
  criadoPor: string;
}

export const AlertaForm = ({ editingAlerta, onCancel, onSuccess }: AlertaFormProps) => {
  const { criarAlerta, atualizarAlerta } = useAlertas();
  const { motoristas } = useMotoristas();
  
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    mensagem: '',
    tipo: 'info',
    destinatarios: 'todos',
    motoristaEspecifico: '',
    dataExpiracao: '',
    ativo: true,
    urgente: false,
    criadoPor: 'Admin'
  });

  useEffect(() => {
    if (editingAlerta) {
      setFormData({
        titulo: editingAlerta.titulo,
        mensagem: editingAlerta.mensagem,
        tipo: editingAlerta.tipo,
        destinatarios: editingAlerta.destinatarios,
        motoristaEspecifico: editingAlerta.motoristaEspecifico || '',
        dataExpiracao: editingAlerta.dataExpiracao ? editingAlerta.dataExpiracao.split('T')[0] : '',
        ativo: editingAlerta.ativo,
        urgente: editingAlerta.urgente,
        criadoPor: editingAlerta.criadoPor
      });
    }
  }, [editingAlerta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alertaData = {
      ...formData,
      dataExpiracao: formData.dataExpiracao ? new Date(formData.dataExpiracao).toISOString() : undefined
    };

    if (editingAlerta) {
      atualizarAlerta(editingAlerta.id, alertaData);
    } else {
      criarAlerta(alertaData);
    }
    
    onSuccess();
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Manutenção programada"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo do Alerta</Label>
              <Select value={formData.tipo} onValueChange={(value: 'info' | 'warning' | 'error' | 'success') => handleChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro/Problema</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem}
              onChange={(e) => handleChange('mensagem', e.target.value)}
              placeholder="Digite a mensagem do alerta..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="destinatarios">Destinatários</Label>
              <Select value={formData.destinatarios} onValueChange={(value: 'todos' | 'motoristas' | 'especifico') => handleChange('destinatarios', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  <SelectItem value="motoristas">Apenas motoristas</SelectItem>
                  <SelectItem value="especifico">Motorista específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.destinatarios === 'especifico' && (
              <div>
                <Label htmlFor="motoristaEspecifico">Motorista</Label>
                <Select value={formData.motoristaEspecifico} onValueChange={(value) => handleChange('motoristaEspecifico', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {motoristas.map((motorista) => (
                      <SelectItem key={motorista.email} value={motorista.email}>
                        {motorista.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="dataExpiracao">Data de Expiração (Opcional)</Label>
            <Input
              id="dataExpiracao"
              type="date"
              value={formData.dataExpiracao}
              onChange={(e) => handleChange('dataExpiracao', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleChange('ativo', checked)}
              />
              <Label htmlFor="ativo">Alerta ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="urgente"
                checked={formData.urgente}
                onCheckedChange={(checked) => handleChange('urgente', checked)}
              />
              <Label htmlFor="urgente">Alerta urgente</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingAlerta ? 'Atualizar' : 'Criar'} Alerta
        </Button>
      </div>
    </form>
  );
};
