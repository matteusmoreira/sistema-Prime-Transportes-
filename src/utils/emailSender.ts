
import type { VoucherData } from '@/hooks/useVoucher';
import { generateVoucherPDF } from './pdfGenerator';

export const sendVoucherEmail = async (voucher: VoucherData) => {
  // Simular envio de email
  // Em um ambiente real, isso seria integrado com um serviço de email
  
  console.log('Preparando envio de email para voucher:', voucher.id);
  
  // Gerar o PDF primeiro
  await generateVoucherPDF(voucher);
  
  // Simular delay de envio
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Dados do email
  const emailData = {
    to: 'financeiro@empresa.com', // Email padrão do financeiro
    subject: `Voucher #${voucher.id.toString().padStart(6, '0')} - ${voucher.empresa}`,
    body: `
      Prezados,

      Segue em anexo o voucher de transporte com os seguintes dados:

      • Voucher Nº: ${voucher.id.toString().padStart(6, '0')}
      • Data do Serviço: ${new Date(voucher.dataServico).toLocaleDateString('pt-BR')}
      • Empresa: ${voucher.empresa}
      • Motorista: ${voucher.motorista}
      • Rota: ${voucher.origem} → ${voucher.destino}
      • Valor Total: R$ ${(voucher.valor + voucher.pedagio + voucher.estacionamento + voucher.hospedagem).toFixed(2)}

      Atenciosamente,
      Sistema Prime Transportes
    `,
    attachments: [`voucher_${voucher.id}_${new Date(voucher.dataServico).toISOString().split('T')[0]}.pdf`]
  };
  
  console.log('Email seria enviado com os dados:', emailData);
  
  // Em um ambiente real, aqui seria feita a integração com:
  // - SendGrid
  // - AWS SES
  // - Nodemailer
  // - Ou outro serviço de email
  
  return { success: true, message: 'Email enviado com sucesso!' };
};
