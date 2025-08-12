
import jsPDF from 'jspdf';
import type { VoucherData } from '@/hooks/useVoucher';

export const generateVoucherPDF = async (voucher: VoucherData) => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;
  
  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('VOUCHER DE TRANSPORTE', pageWidth / 2, yPosition, { align: 'center' });
  
  // Gerado em abaixo do título
  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 12;
  
  // Linha horizontal
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 20;
  
  // Informações da empresa
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Prime Transportes', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CNPJ: 55.727.209/0001-43', margin, yPosition);
  
  yPosition += 20;
  
  // Dados do voucher
  const addField = (label: string, value: string | number) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 40, yPosition);
    yPosition += 8;
  };
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO SERVIÇO', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  addField('Voucher Nº', voucher.id.toString().padStart(6, '0'));
  addField('Data do Serviço', new Date(voucher.dataServico).toLocaleDateString('pt-BR'));
  addField('Empresa', voucher.empresa);
  addField('Motorista', voucher.motorista);
  if (voucher.veiculo) {
    addField('Veículo', voucher.veiculo);
  }
  addField('Centro de Custo', voucher.centroCusto);
  
  if (voucher.numeroOS) {
    addField('Número OS', voucher.numeroOS);
  }
  
  if (voucher.solicitante) {
    addField('Solicitante', voucher.solicitante);
  }
  
  if (voucher.projeto) {
    addField('Projeto', voucher.projeto);
  }
  
  if (voucher.motivo) {
    addField('Motivo', voucher.motivo);
  }
  
  yPosition += 10;
  
  // Itinerário
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ITINERÁRIO', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  addField('Origem', voucher.origem);
  addField('Destino', voucher.destino);
  
  if (voucher.destinoExtra) {
    addField('Destino Extra', voucher.destinoExtra);
  }
  
  if (voucher.passageiros) {
    addField('Passageiros', voucher.passageiros);
  }
  
  yPosition += 10;
  
  // Dados do veículo/trajeto
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO TRAJETO', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  if (voucher.horaInicio) {
    addField('Hora Início', voucher.horaInicio);
  }
  
  if (voucher.horaFim) {
    addField('Hora Fim', voucher.horaFim);
  }
  
  if (voucher.kmInicial) {
    addField('KM Inicial', voucher.kmInicial.toString());
  }
  
  if (voucher.kmFinal) {
    addField('KM Final', voucher.kmFinal.toString());
  }
  
  addField('KM Total', `${voucher.kmTotal} km`);
  
  if (voucher.tipoAbrangencia) {
    addField('Tipo de Abrangência', voucher.tipoAbrangencia);
  }
  
  yPosition += 10;
  
  // Custos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOS', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  addField('Valor Principal', `R$ ${voucher.valor.toFixed(2)}`);
  
  if (voucher.pedagio > 0) {
    addField('Pedágio', `R$ ${voucher.pedagio.toFixed(2)}`);
  }
  
  if (voucher.estacionamento > 0) {
    addField('Estacionamento', `R$ ${voucher.estacionamento.toFixed(2)}`);
  }
  
  if (voucher.hospedagem > 0) {
    addField('Hospedagem', `R$ ${voucher.hospedagem.toFixed(2)}`);
  }
  
  const valorTotal = voucher.valor + voucher.pedagio + voucher.estacionamento + voucher.hospedagem;
  
  yPosition += 5;
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'bold');
  addField('VALOR TOTAL', `R$ ${valorTotal.toFixed(2)}`);
  
  
  
  // Salvar o PDF
  const fileName = `voucher_${voucher.id}_${new Date(voucher.dataServico).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
