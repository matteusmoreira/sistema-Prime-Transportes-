import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';
import { removeSecondsFromTime } from '@/utils/timeFormatter';

interface CorridaEditDialogProps {
  corrida: CorridaFinanceiro | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (corridaId: number, formData: any) => void;
}

export const CorridaEditDialog = ({ 
  corrida, 
  isOpen, 
  onOpenChange, 
  onSave 
}: CorridaEditDialogProps) => {
  const [formData, setFormData] = useState({
    empresa: '',
    motorista: '',
    dataServico: '',
    origem: '',
    destino: '',
    destinoExtra: '',
    centroCusto: '',
    numeroOS: '',
    kmTotal: '',
    valor: '',
    valorMotorista: '',
    pedagio: '',
    estacionamento: '',
    hospedagem: '',
    passageiros: '',
    observacoes: '',
    projeto: '',
    motivo: '',
    horaInicio: '',
    horaFim: '',
    kmInicial: '',
    kmFinal: '',
    solicitante: ''
  });

  const [comprovantes, setComprovantes] = useState({
    pedagio: null as File | null,
    estacionamento: null as File | null,
    hospedagem: null as File | null
  });

  // Atualizar o formulário sempre que a corrida mudar ou o diálogo abrir
  useEffect(() => {
    console.log('=== USEEFFECT CORRIDA EDIT DIALOG ===');
    console.log('Corrida recebida:', corrida);
    console.log('Dialog está aberto:', isOpen);
    
    if (corrida && isOpen) {
      console.log('Atualizando dados do formulário com corrida:', corrida);
      setFormData({
        empresa: corrida.empresa || '',
        motorista: corrida.motorista || '',
        dataServico: corrida.dataServico || '',
        origem: corrida.origem || '',
        destino: corrida.destino || '',
        destinoExtra: corrida.destinoExtra || '',
        centroCusto: corrida.centroCusto || '',
        numeroOS: corrida.numeroOS || '',
        kmTotal: corrida.kmTotal?.toString() || '',
        valor: corrida.valor?.toString() || '',
        valorMotorista: corrida.valorMotorista?.toString() || '',
        pedagio: corrida.pedagio?.toString() || '',
        estacionamento: corrida.estacionamento?.toString() || '',
        hospedagem: corrida.hospedagem?.toString() || '',
        passageiros: corrida.passageiros || '',
        observacoes: corrida.observacoes || '',
        projeto: corrida.projeto || '',
        motivo: corrida.motivo || '',
        horaInicio: removeSecondsFromTime(corrida.horaInicio || ''),
        horaFim: removeSecondsFromTime(corrida.horaFim || ''),
        kmInicial: corrida.kmInicial?.toString() || '',
        kmFinal: corrida.kmFinal?.toString() || '',
        solicitante: corrida.solicitante || ''
      });
      console.log('Form data após atualização:', formData);
    }
    console.log('=== FIM USEEFFECT CORRIDA EDIT DIALOG ===');
  }, [corrida, isOpen]);

  // Limpar comprovantes quando o diálogo fechar
  useEffect(() => {
    if (!isOpen) {
      setComprovantes({
        pedagio: null,
        estacionamento: null,
        hospedagem: null
      });
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: string) => {
    console.log(`Atualizando campo ${field} com valor:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (tipo: 'pedagio' | 'estacionamento' | 'hospedagem', file: File | null) => {
    setComprovantes(prev => ({ ...prev, [tipo]: file }));
  };

  const handleSave = async () => {
    try {
      if (!corrida) {
        console.error('ERRO: Nenhuma corrida selecionada para salvar');
        toast.error('Erro: Nenhuma corrida selecionada');
        return;
      }
      
      console.log('=== FORMULÁRIO CORRIDA EDIT ===');
      console.log('Dados brutos do formulário:', formData);
      
      const updatedData = {
        ...formData,
        kmTotal: parseInt(formData.kmTotal) || 0,
        valor: parseFloat(formData.valor) || 0,
        valorMotorista: parseFloat(formData.valorMotorista) || 0,
        pedagio: parseFloat(formData.pedagio) || 0,
        estacionamento: parseFloat(formData.estacionamento) || 0,
        hospedagem: parseFloat(formData.hospedagem) || 0,
        kmInicial: parseInt(formData.kmInicial) || 0,
        kmFinal: parseInt(formData.kmFinal) || 0
      };

      console.log('Dados processados para enviar:', updatedData);
      console.log('ID da corrida a ser atualizada:', corrida.id);
      console.log('=== CHAMANDO ONSAVE ===');
      
      await onSave(corrida.id, updatedData);
      
      console.log('=== FECHANDO DIALOG ===');
      onOpenChange(false);
      console.log('=== FIM FORMULÁRIO CORRIDA EDIT ===');
    } catch (error) {
      console.error('=== ERRO NO HANDLE SAVE ===');
      console.error('Error:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
      toast.error('Erro ao salvar alterações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      console.error('=== FIM ERRO NO HANDLE SAVE ===');
    }
  };

  if (!corrida) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Corrida - Conferência Financeira</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input 
                    value={formData.empresa} 
                    onChange={e => updateFormData('empresa', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motorista</Label>
                  <Input 
                    value={formData.motorista} 
                    onChange={e => updateFormData('motorista', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Solicitante</Label>
                  <Input 
                    value={formData.solicitante} 
                    onChange={e => updateFormData('solicitante', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data do Serviço</Label>
                  <Input 
                    type="date"
                    value={formData.dataServico} 
                    onChange={e => updateFormData('dataServico', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Centro de Custo</Label>
                  <Input 
                    value={formData.centroCusto} 
                    onChange={e => updateFormData('centroCusto', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>N° da O.S</Label>
                  <Input 
                    value={formData.numeroOS} 
                    onChange={e => updateFormData('numeroOS', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Projeto</Label>
                  <Input 
                    value={formData.projeto} 
                    onChange={e => updateFormData('projeto', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horário e Quilometragem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora Início</Label>
                  <Input 
                    type="time"
                    value={formData.horaInicio} 
                    onChange={e => updateFormData('horaInicio', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim</Label>
                  <Input 
                    type="time"
                    value={formData.horaFim} 
                    onChange={e => updateFormData('horaFim', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>KM Inicial</Label>
                  <Input 
                    type="number"
                    value={formData.kmInicial} 
                    onChange={e => updateFormData('kmInicial', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KM Final</Label>
                  <Input 
                    type="number"
                    value={formData.kmFinal} 
                    onChange={e => updateFormData('kmFinal', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KM Total</Label>
                  <Input 
                    type="number"
                    value={formData.kmTotal} 
                    onChange={e => updateFormData('kmTotal', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Input 
                    value={formData.origem} 
                    onChange={e => updateFormData('origem', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destino</Label>
                  <Input 
                    value={formData.destino} 
                    onChange={e => updateFormData('destino', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Destino Extra</Label>
                <Input 
                  value={formData.destinoExtra} 
                  onChange={e => updateFormData('destinoExtra', e.target.value)}
                  placeholder="Paradas adicionais durante a viagem"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.valor} 
                    onChange={e => updateFormData('valor', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor a Receber (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.valorMotorista} 
                    onChange={e => updateFormData('valorMotorista', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custos Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pedágio (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.pedagio} 
                    onChange={e => updateFormData('pedagio', e.target.value)}
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('pedagio', e.target.files?.[0] || null)}
                      className="hidden"
                      id="pedagio-file-edit"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('pedagio-file-edit')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Anexar Comprovante
                    </Button>
                    {comprovantes.pedagio && (
                      <p className="text-sm text-green-600 mt-1">
                        <FileText className="h-4 w-4 inline mr-1" />
                        {comprovantes.pedagio.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Estacionamento (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.estacionamento} 
                    onChange={e => updateFormData('estacionamento', e.target.value)}
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('estacionamento', e.target.files?.[0] || null)}
                      className="hidden"
                      id="estacionamento-file-edit"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('estacionamento-file-edit')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Anexar Comprovante
                    </Button>
                    {comprovantes.estacionamento && (
                      <p className="text-sm text-green-600 mt-1">
                        <FileText className="h-4 w-4 inline mr-1" />
                        {comprovantes.estacionamento.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Hospedagem (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.hospedagem} 
                    onChange={e => updateFormData('hospedagem', e.target.value)}
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('hospedagem', e.target.files?.[0] || null)}
                      className="hidden"
                      id="hospedagem-file-edit"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('hospedagem-file-edit')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Anexar Comprovante
                    </Button>
                    {comprovantes.hospedagem && (
                      <p className="text-sm text-green-600 mt-1">
                        <FileText className="h-4 w-4 inline mr-1" />
                        {comprovantes.hospedagem.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Passageiros</Label>
                <Textarea 
                  value={formData.passageiros} 
                  onChange={e => updateFormData('passageiros', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea 
                  value={formData.motivo} 
                  onChange={e => updateFormData('motivo', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea 
                  value={formData.observacoes} 
                  onChange={e => updateFormData('observacoes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
