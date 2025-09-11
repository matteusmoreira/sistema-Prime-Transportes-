
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { Corrida, DocumentoUpload } from '@/types/corridas';
import { useEmpresas } from '@/hooks/useEmpresas';
import { OSBasicFields } from './OSBasicFields';
import { OSCostFields } from './OSCostFields';
import { formatTimeToAmPm, removeSecondsFromTime } from '@/utils/timeFormatter';
import { formatDateDDMMYYYY } from '@/utils/format';
interface OSFormProps {
  corrida: Corrida;
  onSubmit: (formData: any, documentos: DocumentoUpload[]) => void;
  onCancel: () => void;
  userLevel?: string;
}
export const OSForm = ({
  corrida,
  onSubmit,
  onCancel,
  userLevel = 'Administrador'
}: OSFormProps) => {
  const { empresas } = useEmpresas();

  const [formData, setFormData] = useState({
    horaOS: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    numeroOS: corrida.numeroOS || '',
    horaSaida: removeSecondsFromTime(corrida.horaSaida || corrida.horaInicio || ''),
    horaChegada: '',
    data: corrida.dataServico || corrida.data || (() => { const t = new Date(); const y = t.getFullYear(); const m = String(t.getMonth()+1).padStart(2,'0'); const d = String(t.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; })(),
    kmInicio: corrida.kmInicial?.toString() || '',
    kmFinal: corrida.kmFinal?.toString() || '',
    empresa: corrida.empresa,
    centroCusto: corrida.centroCusto || '',
    origem: corrida.origem,
    destino: corrida.destino,
    destinoExtra: corrida.destinoExtra || '',
    pedagio: corrida.pedagio?.toString() || '',
    estacionamento: corrida.estacionamento?.toString() || '',
    hospedagem: corrida.hospedagem?.toString() || '',
    passageiros: corrida.passageiros || '',
    observacoes: corrida.observacoes || ''
  });
  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([]);
  const [comprovantes, setComprovantes] = useState({
    pedagio: null as File | null,
    // Adicionado comprovante para pedágio
    estacionamento: null as File | null,
    hospedagem: null as File | null
  });
  // Função para determinar se o campo deve ser exibido para motoristas
  const shouldShowField = (fieldName: string): boolean => {
    if (userLevel !== 'Motorista') return true;
    
    const hiddenFields = ['solicitante', 'projeto', 'motivo', 'tipoAbrangencia'];
    return !hiddenFields.includes(fieldName);
  };

  const isMotorista = userLevel === 'Motorista';

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleFileUpload = (tipo: 'pedagio' | 'estacionamento' | 'hospedagem', file: File | null) => {
    setComprovantes(prev => ({
      ...prev,
      [tipo]: file
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kmInicial = parseInt(formData.kmInicio) || 0;
    const kmFinal = parseInt(formData.kmFinal) || 0;
    const kmTotal = kmFinal - kmInicial;
    const osData = {
      ...formData,
      kmInicial,
      kmFinal,
      kmTotal,
      pedagio: parseFloat(formData.pedagio) || 0,
      estacionamento: parseFloat(formData.estacionamento) || 0,
      hospedagem: parseFloat(formData.hospedagem) || 0,
      documentos: [
        ...documentos,
        ...Object.entries(comprovantes)
          .filter(([_, file]) => file !== null)
          .map(([tipo, file]) => {
            const labelMap: Record<string, string> = {
              pedagio: 'Pedágio',
              estacionamento: 'Estacionamento',
              hospedagem: 'Hospedagem',
            };
            const display = labelMap[tipo] || tipo;
            return {
              id: `${tipo}-${Date.now()}`,
              nome: `Comprovante ${display}`,
              descricao: `Comprovante de ${display}`,
              arquivo: file as File,
            } as DocumentoUpload;
          }),
      ],
    };
    onSubmit(osData, osData.documentos);
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preenchimento de Ordem de Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <OSBasicFields formData={formData} updateFormData={updateFormData} />

          {/* Dados fixos vindos do admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input value={formData.empresa} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Centro de Custo *</Label>
              <Input 
                value={formData.centroCusto} 
                onChange={(e) => updateFormData('centroCusto', e.target.value)}
                readOnly={isMotorista}
                className={isMotorista ? 'bg-gray-100' : ''}
                placeholder={isMotorista ? '' : 'Digite o centro de custo'}
              />
            </div>
          </div>

          {/* Dados adicionais cadastrados pelo administrador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shouldShowField('solicitante') && (
              <div className="space-y-2">
                <Label>Solicitante</Label>
                <Input value={corrida.solicitante || 'Não informado'} readOnly className="bg-gray-100" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Input value={corrida.veiculo || 'Não informado'} readOnly className="bg-gray-100" />
            </div>
          </div>

          {(shouldShowField('projeto') || shouldShowField('motivo')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shouldShowField('projeto') && (
                <div className="space-y-2">
                  <Label>Projeto</Label>
                  <Input value={corrida.projeto || 'Não informado'} readOnly className="bg-gray-100" />
                </div>
              )}
              {shouldShowField('motivo') && (
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Input value={corrida.motivo || 'Não informado'} readOnly className="bg-gray-100" />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Serviço</Label>
              <Input value={(corrida.dataServico || corrida.data) ? formatDateDDMMYYYY(corrida.dataServico || corrida.data) : ''} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Hora Início</Label>
              <Input value={formatTime24h(corrida.horaInicio || corrida.horaSaida || '')} readOnly className="bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shouldShowField('tipoAbrangencia') && (
              <div className="space-y-2">
                <Label>Tipo de Abrangência</Label>
                <Input value={corrida.tipoAbrangencia || 'Não informado'} readOnly className="bg-gray-100" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Nº da Ordem de Serviço</Label>
              <Input value={corrida.numeroOS || 'Será gerado automaticamente'} readOnly className="bg-gray-100" />
            </div>
          </div>

          {/* Origem e Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Input 
                value={formData.origem} 
                onChange={e => updateFormData('origem', e.target.value)}
                readOnly={!isMotorista}
                className={!isMotorista ? 'bg-gray-100' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Destino</Label>
              <Input 
                value={formData.destino} 
                onChange={e => updateFormData('destino', e.target.value)}
                readOnly={!isMotorista}
                className={!isMotorista ? 'bg-gray-100' : ''}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Destino Extra</Label>
            <Input value={formData.destinoExtra} onChange={e => updateFormData('destinoExtra', e.target.value)} placeholder="Paradas adicionais durante a viagem" />
          </div>

          {/* Custos com campo de pedágio atualizado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pedágio (R$)</Label>
              <Input type="number" step="0.01" value={formData.pedagio} onChange={e => updateFormData('pedagio', e.target.value)} placeholder="0.00" />
              <div className="mt-2">
                <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload('pedagio', e.target.files?.[0] || null)} className="hidden" id="pedagio-file" />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pedagio-file')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar Comprovante
                </Button>
                {comprovantes.pedagio && <p className="text-sm text-green-600 mt-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {comprovantes.pedagio.name}
                  </p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Estacionamento (R$)</Label>
              <Input type="number" step="0.01" value={formData.estacionamento} onChange={e => updateFormData('estacionamento', e.target.value)} placeholder="0.00" />
              <div className="mt-2">
                <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload('estacionamento', e.target.files?.[0] || null)} className="hidden" id="estacionamento-file" />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('estacionamento-file')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar Comprovante
                </Button>
                {comprovantes.estacionamento && <p className="text-sm text-green-600 mt-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {comprovantes.estacionamento.name}
                  </p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Hospedagem (R$)</Label>
              <Input type="number" step="0.01" value={formData.hospedagem} onChange={e => updateFormData('hospedagem', e.target.value)} placeholder="0.00" />
              <div className="mt-2">
                <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload('hospedagem', e.target.files?.[0] || null)} className="hidden" id="hospedagem-file" />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('hospedagem-file')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar Comprovante
                </Button>
                {comprovantes.hospedagem && <p className="text-sm text-green-600 mt-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {comprovantes.hospedagem.name}
                  </p>}
              </div>
            </div>
          </div>

          {/* Passageiros - dados vindos do admin */}
          <div className="space-y-2">
            <Label>Passageiros</Label>
            <Textarea 
              value={formData.passageiros} 
              readOnly 
              className="bg-gray-100" 
              rows={6} 
              placeholder={formData.passageiros ? "" : "Nenhum passageiro informado"} 
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={formData.observacoes} onChange={e => updateFormData('observacoes', e.target.value)} rows={3} placeholder="Observações adicionais sobre a viagem" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Enviar OS para Financeiro
        </Button>
      </div>
    </form>;
};
