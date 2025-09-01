
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useMotoristas } from '@/hooks/useMotoristas';
import { supabase } from '@/integrations/supabase/client';
import { formatTimeToAmPm } from '@/utils/timeFormatter';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';

interface WhatsAppButtonProps {
  corrida: any; // Vamos receber toda a corrida para pegar todos os dados
}

export const WhatsAppButton = ({ corrida }: WhatsAppButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { motoristas } = useMotoristas();
  
  // Criar mensagem formatada com todos os dados da corrida
  const createFormattedMessage = () => {
    const dataBase = corrida.dataServico || corrida.data;
    const dataFormatada = dataBase ? formatDateDDMMYYYY(dataBase) : '';
    const horaInicio = formatTimeToAmPm(corrida.horaInicio || corrida.horaSaida || '');

    // Normaliza a lista de passageiros (aceita quebra de linha ou vírgula) e gera em linha separados por vírgulas
    const passageirosInline = (corrida.passageiros || '')
      .split(/\r?\n|,/)
      .map((p: string) => p.trim())
      .filter(Boolean)
      .join(', ');

    const lines: string[] = [];
    if (corrida.motorista) lines.push(`MOTORISTA: ${corrida.motorista}`);
    if (corrida.empresa) lines.push(`CLIENTE: ${corrida.empresa}`);
    if (corrida.centroCusto) lines.push(`Centro de Custo: ${corrida.centroCusto}`);
    if (dataFormatada) lines.push(`DATA: ${dataFormatada}`);
    if (horaInicio) lines.push(`HORA: ${horaInicio}`);
    if (corrida.origem) lines.push(`ORIGEM: ${corrida.origem}`);
    if (corrida.destino) lines.push(`DESTINO: ${corrida.destino}`);
    if (corrida.destinoExtra) lines.push(`DESTINOEXTRA: ${corrida.destinoExtra}`);
    if (passageirosInline) lines.push(`PASSAGEIROS: ${passageirosInline}`);

    return lines.join('\n');
  };

  // Atualizar mensagem sempre que a corrida mudar
  useEffect(() => {
    setMessage(createFormattedMessage());
  }, [corrida]);

  // Buscar telefone do motorista e formatar com código do país
  useEffect(() => {
    const motoristaData = motoristas.find(m => m.nome === corrida.motorista);
    
    if (motoristaData && motoristaData.telefone) {
      // Remove caracteres não numéricos e adiciona 55 na frente
      const numbersOnly = motoristaData.telefone.replace(/\D/g, '');
      const formattedPhone = `55${numbersOnly}`;
      setPhoneNumber(formattedPhone);
    }
  }, [corrida.motorista, motoristas]);


  const sendWhatsAppMessage = async () => {
    if (!phoneNumber || !message) {
      toast.error('Preencha o número e a mensagem');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          message: message
        }
      });

      if (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        toast.error('Erro ao enviar mensagem. Verifique as configurações.');
        return;
      }

      if (data?.success) {
        toast.success('Mensagem enviada com sucesso!');
        setIsDialogOpen(false);
      } else {
        toast.error(`Erro ao enviar mensagem: ${data?.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast.error('Erro ao enviar mensagem. Verifique sua conexão e configurações.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumberDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('55') && numbers.length >= 13) {
      const withoutCountryCode = numbers.substring(2);
      const match = withoutCountryCode.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) {
        return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return value;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
          <MessageCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar WhatsApp para {corrida.motorista}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Número do WhatsApp *</Label>
            <Input
              value={formatPhoneNumberDisplay(phoneNumber)}
              onChange={(e) => {
                const numbersOnly = e.target.value.replace(/\D/g, '');
                setPhoneNumber(numbersOnly.startsWith('55') ? numbersOnly : `55${numbersOnly}`);
              }}
              placeholder="+55 (11) 99999-9999"
              maxLength={19}
            />
          </div>
          <div>
            <Label>Mensagem *</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Digite sua mensagem aqui..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={sendWhatsAppMessage}
              disabled={isLoading || !phoneNumber || !message}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? 'Enviando...' : 'Enviar'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
