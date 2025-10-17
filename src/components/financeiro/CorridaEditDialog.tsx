import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { CorridaFinanceiro } from '@/hooks/useFinanceiro';
import { removeSecondsFromTime } from '@/utils/timeFormatter';
import { DocumentUploader } from '@/components/corridas/DocumentUploader';
import { DocumentosUpload } from '@/components/corridas/form/DocumentosUpload';
import type { DocumentoUpload } from '@/types/corridas';
import { TimeInput24h } from '@/components/common/TimeInput24h';

interface CorridaEditDialogProps {
  corrida: CorridaFinanceiro | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (dadosBasicos: any, documentos: any[]) => void;
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
    veiculo: '',
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
    tipoAbrangencia: '',
    horaInicio: '',
    horaOS: '',
    horaEspera: '',
    valorHoraEspera: '',
    cteNf: '',
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

  const [documentosExtras, setDocumentosExtras] = useState<DocumentoUpload[]>([]);

  // Atualizar o formulário sempre que a corrida mudar ou o diálogo abrir
  useEffect(() => {
    if (corrida && isOpen) {
      setFormData({
        empresa: corrida.empresa || '',
        motorista: corrida.motorista || '',
        veiculo: (corrida as any).veiculo || '',
        dataServico: corrida.dataServico || '',
        origem: corrida.origem || '',
        destino: corrida.destino || '',
        destinoExtra: corrida.destinoExtra || '',
        centroCusto: corrida.centroCusto || '',
        numeroOS: corrida.numeroOS || '',
        kmTotal: (corrida.kmTotal ?? '').toString(),
        valor: (corrida.valor ?? '').toString(),
        valorMotorista: (corrida.valorMotorista ?? '').toString(),
        pedagio: (corrida.pedagio ?? '').toString(),
        estacionamento: (corrida.estacionamento ?? '').toString(),
        hospedagem: (corrida.hospedagem ?? '').toString(),
        passageiros: corrida.passageiros || '',
        observacoes: corrida.observacoes || '',
        projeto: corrida.projeto || '',
        motivo: corrida.motivo || '',
        tipoAbrangencia: (corrida as any).tipoAbrangencia || '',
        horaInicio: removeSecondsFromTime(corrida.horaInicio || ''),
        horaOS: removeSecondsFromTime(corrida.horaOS || ''),
        horaEspera: removeSecondsFromTime(corrida.horaEspera || ''),
        valorHoraEspera: (corrida.valorHoraEspera ?? '').toString(),
        cteNf: corrida.cteNf || '',
        horaFim: removeSecondsFromTime(corrida.horaFim || ''),
        kmInicial: (corrida.kmInicial ?? '').toString(),
        kmFinal: (corrida.kmFinal ?? '').toString(),
        solicitante: corrida.solicitante || ''
      });
    }
  }, [corrida, isOpen]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (tipo: 'pedagio' | 'estacionamento' | 'hospedagem', file: File | null) => {
    setComprovantes(prev => ({ ...prev, [tipo]: file }));
  };

  const handleSave = () => {
    if (!corrida) return;

    // Validação de campos obrigatórios
    const camposObrigatorios = [
      { campo: 'empresa', valor: formData.empresa, nome: 'Empresa' },
      { campo: 'motorista', valor: formData.motorista, nome: 'Motorista' },
      { campo: 'dataServico', valor: formData.dataServico, nome: 'Data do Serviço' },
      { campo: 'origem', valor: formData.origem, nome: 'Origem' },
      { campo: 'destino', valor: formData.destino, nome: 'Destino' }
    ];

    const camposFaltando = camposObrigatorios.filter(item => !item.valor || item.valor.trim() === '');
    
    if (camposFaltando.length > 0) {
      const nomesCampos = camposFaltando.map(item => item.nome).join(', ');
      toast.error(`Os seguintes campos são obrigatórios: ${nomesCampos}`);
      return;
    }

    const parseNumber = (v: string) => {
      if (!v) return 0;
      const num = parseFloat(String(v).replace(',', '.'));
      return isNaN(num) ? 0 : num;
    };

    // Validação de formato de data
    if (formData.dataServico && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dataServico)) {
      toast.error('Data do serviço deve estar no formato YYYY-MM-DD');
      return;
    }

    const dadosBasicos = {
      empresa: formData.empresa.trim(),
      motorista: formData.motorista.trim(),
      veiculo: formData.veiculo?.trim() || '',
      dataServico: formData.dataServico,
      origem: formData.origem.trim(),
      destino: formData.destino.trim(),
      destinoExtra: formData.destinoExtra?.trim() || '',
      centroCusto: formData.centroCusto?.trim() || '',
      numeroOS: formData.numeroOS?.trim() || '',
      kmTotal: parseNumber(formData.kmTotal),
      valor: parseNumber(formData.valor),
      valorMotorista: parseNumber(formData.valorMotorista),
      pedagio: parseNumber(formData.pedagio),
      estacionamento: parseNumber(formData.estacionamento),
      hospedagem: parseNumber(formData.hospedagem),
      passageiros: formData.passageiros?.trim() || '',
      observacoes: formData.observacoes?.trim() || '',
      projeto: formData.projeto?.trim() || '',
      motivo: formData.motivo?.trim() || '',
      tipoAbrangencia: formData.tipoAbrangencia?.trim() || '',
      horaInicio: formData.horaInicio || '',
      horaOS: formData.horaOS || '',
      horaEspera: formData.horaEspera || '',
      valorHoraEspera: parseNumber(formData.valorHoraEspera),
      cteNf: formData.cteNf?.trim() || '',
      horaFim: formData.horaFim || '',
      kmInicial: parseNumber(formData.kmInicial),
      kmFinal: parseNumber(formData.kmFinal),
      solicitante: formData.solicitante?.trim() || '',
      // Campos específicos do financeiro
      preenchidoPorFinanceiro: true,
      dataEdicaoFinanceiro: new Date().toISOString(),
      usuarioEdicaoFinanceiro: 'financeiro' // Pode ser ajustado conforme o contexto do usuário
    };

    // Log de debug dos dados que serão enviados
    console.log('Dados básicos para salvar (CorridaEditDialog):', dadosBasicos);

    const documentos: any[] = [];
    const pushDoc = (nome: string, arquivo: File | null, valor: number) => {
      if (arquivo) {
        documentos.push({
          nome,
          descricao: `${nome} - R$ ${valor?.toFixed ? valor.toFixed(2) : valor}`,
          arquivo
        });
      }
    };

    pushDoc('Pedágio', comprovantes.pedagio, dadosBasicos.pedagio);
    pushDoc('Estacionamento', comprovantes.estacionamento, dadosBasicos.estacionamento);
    pushDoc('Hospedagem', comprovantes.hospedagem, dadosBasicos.hospedagem);

    // Adiciona documentos extras do cadastro
    const documentosComExtras = [
      ...documentos,
      ...documentosExtras.filter(d => !!d.arquivo)
    ];

    console.log('Documentos para salvar:', documentosComExtras);

    try {
      onSave(dadosBasicos, documentosComExtras);
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  if (!corrida) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Corrida - Conferência Financeira</DialogTitle>
          <DialogDescription>
            Edite os dados da corrida para conferência financeira. Todos os campos podem ser modificados conforme necessário.
          </DialogDescription>
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
                  <Label>Veículo</Label>
                  <Input 
                    value={formData.veiculo} 
                    onChange={e => updateFormData('veiculo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Solicitante</Label>
                  <Input 
                    value={formData.solicitante} 
                    onChange={e => updateFormData('solicitante', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data do Serviço</Label>
                  <Input 
                    type="date"
                    value={formData.dataServico} 
                    onChange={e => updateFormData('dataServico', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Centro de Custo</Label>
                  <Input 
                    value={formData.centroCusto} 
                    onChange={e => updateFormData('centroCusto', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label>Tipo de Abrangência</Label>
                  <Input 
                    value={formData.tipoAbrangencia} 
                    onChange={e => updateFormData('tipoAbrangencia', e.target.value)}
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
                  <Label>Hora Saída</Label>
                  <TimeInput24h value={formData.horaInicio} onChange={v => updateFormData('horaInicio', v)} />
                </div>
                <div className="space-y-2">
                  <Label>Hora OS</Label>
                  <TimeInput24h value={formData.horaOS} onChange={v => updateFormData('horaOS', v)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora de Espera</Label>
                  <TimeInput24h value={formData.horaEspera} onChange={v => updateFormData('horaEspera', v)} />
                </div>
                <div className="space-y-2">
                  <Label>Valor Hora de Espera</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valorHoraEspera} 
                    onChange={e => updateFormData('valorHoraEspera', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTE/NF</Label>
                  <Input 
                    type="text"
                    placeholder="Número do CTE ou NF"
                    value={formData.cteNf} 
                    onChange={e => updateFormData('cteNf', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Chegada</Label>
                  <TimeInput24h value={formData.horaFim} onChange={v => updateFormData('horaFim', v)} />
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

          <DocumentUploader
            formData={formData}
            updateFormData={updateFormData}
            comprovantes={comprovantes}
            onFileUpload={handleFileUpload}
            title="Custos e Comprovantes"
          />

          {/* Upload de documentos extras (como no cadastro) */}
          <DocumentosUpload 
            documentos={documentosExtras} 
            onDocumentosChange={setDocumentosExtras} 
          />

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
