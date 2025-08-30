
import type { VoucherData } from '@/hooks/useVoucher';
import { generateVoucherPDF } from './pdfGenerator';
import { formatCurrency } from '@/utils/format';

export const sendVoucherEmail = async (voucher: VoucherData) => {
  // Simular envio de email
  // Em um ambiente real, isso seria integrado com um serviço de email
  
  // console.log('Preparando envio de email para voucher:', voucher.id);
  
  // Gerar o PDF primeiro
  await generateVoucherPDF(voucher);
  
  // Simular delay de envio
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Montar linhas do corpo com ocultação de vazios
  const bulletLines: string[] = [];
  bulletLines.push(`• Voucher Nº: ${voucher.id.toString().padStart(6, '0')}`);
  bulletLines.push(`• Data do Serviço: ${new Date(voucher.dataServico).toLocaleDateString('pt-BR')}`);
  if (voucher.empresa) bulletLines.push(`• Empresa: ${voucher.empresa}`);
  if (voucher.motorista) bulletLines.push(`• Motorista: ${voucher.motorista}`);
  if (voucher.origem && voucher.destino) {
    const rota = `${voucher.origem} → ${voucher.destino}${voucher.destinoExtra ? ' → ' + voucher.destinoExtra : ''}`;
    bulletLines.push(`• Rota: ${rota}`);
  }
  const valorTotal = (voucher.valor || 0) + (voucher.pedagio || 0) + (voucher.estacionamento || 0) + (voucher.hospedagem || 0);
  bulletLines.push(`• Valor Total: ${formatCurrency(valorTotal)}`);

  // Dados do email
  const emailData = {
    to: 'financeiro@empresa.com', // Email padrão do financeiro
    subject: `Voucher #${voucher.id.toString().padStart(6, '0')} - ${voucher.empresa}`,
    body: `
      Prezados,

      Segue em anexo o voucher de transporte com os seguintes dados:

      ${bulletLines.join('\n      ')}

      Atenciosamente,
      Sistema Prime Transportes
    `,
    attachments: [`voucher_${voucher.id}_${new Date(voucher.dataServico).toISOString().split('T')[0]}.pdf`]
  };
  
  // console.log('Email seria enviado com os dados:', emailData);
  
  // Em um ambiente real, aqui seria feita a integração com:
  // - SendGrid
  // - AWS SES
  // - Nodemailer
  // - Ou outro serviço de email
  
  return { success: true, message: 'Email enviado com sucesso!' };
};
