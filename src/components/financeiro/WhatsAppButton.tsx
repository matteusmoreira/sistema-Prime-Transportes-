
import { useState, useEffect, type ReactNode, cloneElement, isValidElement } from 'react';
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
  trigger?: ReactNode; // Conteúdo customizado para acionar o diálogo (ex.: DropdownMenuItem)
}

export const WhatsAppButton = ({ corrida, trigger }: WhatsAppButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { motoristas } = useMotoristas();

  // Função auxiliar para exibir o número formatado no input
  const formatPhoneNumberDisplay = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    if (!numbersOnly) return '';
    const country = numbersOnly.slice(0, 2);
    const rest = numbersOnly.slice(2);
    const ddd = rest.slice(0, 2);
    const first = rest.slice(2, 7);
    const last = rest.slice(7, 11);
    return `+${country} (${ddd}) ${first}${last ? '-' + last : ''}`;
  };

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

  const handleSend = async () => {
    if (!phoneNumber || !message) {
      toast.error('Preencha o número e a mensagem.');
      return;
    }

    setIsLoading(true);
    try {
      // A configuração é buscada pela edge function com service role.
      // Basta enviar número e mensagem.
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { phoneNumber, message },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Mensagem enviada com sucesso!');
        setIsDialogOpen(false);
      } else {
        toast.error(data?.message || 'Erro ao enviar mensagem.');
      }
    } catch (err) {
      console.error('Erro ao enviar WhatsApp:', err);
      toast.error('Erro ao enviar WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {trigger ? (
        // Quando houver um trigger customizado (ex.: DropdownMenuItem), evitamos usar o DialogTrigger
        // para não ocorrer o efeito de abrir e fechar imediatamente ao clicar dentro do Dropdown.
        // Em vez disso, clonamos o elemento e previnimos o onSelect do DropdownMenuItem.
        <>
          {isValidElement(trigger)
            ? cloneElement(trigger as any, {
                onSelect: (e: any) => {
                  // Evita que o DropdownMenu feche o diálogo imediatamente
                  if (e?.preventDefault) e.preventDefault();
                },
                onClick: (e: any) => {
                  if (e?.preventDefault) e.preventDefault();
                  if (e?.stopPropagation) e.stopPropagation();
                  setIsDialogOpen(true);
                  // Preserva um possível onClick original
                  if ((trigger as any).props?.onClick) {
                    (trigger as any).props.onClick(e);
                  }
                },
              })
            : (
              <div
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                {trigger}
              </div>
            )}
        </>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
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
            >
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
              <Send className="mr-2 h-4 w-4" /> {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
