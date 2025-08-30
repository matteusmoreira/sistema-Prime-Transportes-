
import jsPDF from 'jspdf';
import type { VoucherData } from '@/hooks/useVoucher';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';

// Converte imagem (SVG/PNG/JPG) pública em DataURL PNG para inserir no jsPDF
async function imageToPngDataUrl(path: string, widthPx: number, heightPx: number): Promise<string> {
  try {
    const res = await fetch(path);
    if (!res.ok) return '';
    const contentType = res.headers.get('content-type') || '';

    // Função auxiliar para rasterizar preservando aspecto dentro de uma caixa widthPx x heightPx
    const rasterize = async (img: HTMLImageElement) => {
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const iw = (img as any).naturalWidth || img.width;
      const ih = (img as any).naturalHeight || img.height;
      const scale = Math.min(widthPx / iw, heightPx / ih);
      const dw = Math.max(1, Math.round(iw * scale));
      const dh = Math.max(1, Math.round(ih * scale));
      const dx = Math.floor((widthPx - dw) / 2);
      const dy = Math.floor((heightPx - dh) / 2);
      ctx.drawImage(img, dx, dy, dw, dh);
      return canvas.toDataURL('image/png');
    };

    if (contentType.includes('svg') || path.toLowerCase().endsWith('.svg')) {
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;
      const data = await rasterize(img);
      URL.revokeObjectURL(url);
      return data;
    }

    // PNG/JPG/JPEG
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    const data = await rasterize(img);
    URL.revokeObjectURL(url);
    return data;
  } catch {
    return '';
  }
}

// Mantido por compatibilidade (usa a versão genérica acima)
async function svgToPngDataUrl(path: string, widthPx: number, heightPx: number): Promise<string> {
  return imageToPngDataUrl(path, widthPx, heightPx);
}

// Helper para normalizar a lista de passageiros
function parsePassengers(passageiros: string): string[] {
  if (!passageiros) return [];
  return passageiros
    .split(/[;\,\n]+|\s{2,}/g)
    .flatMap(p => p.split(','))
    .map(n => n.trim())
    .filter(Boolean);
}

function drawBorder(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
}

async function drawHeader(doc: jsPDF): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  // Tenta usar a nova imagem; suporta nomes comuns no diretório public
  const candidates = [
    '/prime-header.png',
    '/prime-header.svg',
    '/prime-logo.png',
    '/prime-logo.svg',
  ];
  let logoData = '';
  for (const p of candidates) {
    // resolução maior para suportar 55mm sem pixelizar
    logoData = await imageToPngDataUrl(p, 600, 600);
    if (logoData) break;
  }

  const headerTopY = 18; // topo do bloco de cabeçalho
  let headerBottomY = 32; // fallback caso não tenha imagem

  try {
    if (logoData) {
      // Exibição quadrada no PDF (mm) conforme solicitado: 55x55mm
      const logoW = 55; // mm
      const logoH = 55; // mm
      const x = (pageWidth - logoW) / 2;
      const y = headerTopY;
      doc.addImage(logoData, 'PNG', x, y, logoW, logoH);
      headerBottomY = y + logoH;
    } else {
      // Fallback apenas para texto
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const textY = 26;
      doc.text('Prime Transporte Inteligente', pageWidth / 2, textY, { align: 'center' });
      headerBottomY = textY + 6;
    }
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const textY = 26;
    doc.text('Prime Transporte Inteligente', pageWidth / 2, textY, { align: 'center' });
    headerBottomY = textY + 6;
  }

  // Linha fina decorativa
  doc.setLineWidth(0.4);
  doc.line(25, 15, pageWidth - 25, 15);

  return headerBottomY;
}

function addField(doc: jsPDF, label: string, value: string, xLabel: number, xValue: number, y: number, valueColor?: [number, number, number]) {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`${label}:`, xLabel, y);
  doc.setFont('helvetica', 'normal');
  if (valueColor) {
    doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
  } else {
    doc.setTextColor(0, 0, 0);
  }
  doc.text(value || '-', xValue, y);
  // reset
  doc.setTextColor(0, 0, 0);
}

export const generateVoucherPDF = async (voucher: VoucherData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Página 1 - Informações da Mensagem
  const headerBottomY1 = await drawHeader(doc);
  drawBorder(doc);

  // Espaço após cabeçalho (título + margem)
  let y = headerBottomY1 + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INFORMAÇÕES DA MENSAGEM:', pageWidth / 2, y, { align: 'center' });

  y += 12;
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFontSize(10);
  const xLabel = 30;
  const xValue = 85;

  // Campos principais
  addField(doc, 'Nº O.S', voucher.numeroOS || voucher.id.toString().padStart(4, '0'), xLabel, xValue, y, [200, 0, 0]); y += 8;
  addField(doc, 'HORA O.S', voucher.horaInicio || '-', xLabel, xValue, y); y += 8;
  addField(doc, 'HORA SAÍDA', voucher.horaInicio || '-', xLabel, xValue, y); y += 8;
  addField(doc, 'HORA CHEGADA', voucher.horaFim || '-', xLabel, xValue, y); y += 8;
  addField(doc, 'DATA', formatDateDDMMYYYY(voucher.dataServico), xLabel, xValue, y); y += 8;
  addField(doc, 'KM INICIO', voucher.kmInicial != null ? String(voucher.kmInicial) : '-', xLabel, xValue, y); y += 8;
  addField(doc, 'KM FINAL', voucher.kmFinal != null ? String(voucher.kmFinal) : '-', xLabel, xValue, y); y += 8;
  addField(doc, 'EMPRESA', voucher.empresa, xLabel, xValue, y); y += 8;
  addField(doc, 'CENTRO DE CUSTO', voucher.centroCusto, xLabel, xValue, y); y += 8;
  addField(doc, 'PROJETO', voucher.projeto || '-', xLabel, xValue, y); y += 8;
  addField(doc, 'ORIGEM', voucher.origem, xLabel, xValue, y); y += 8;
  addField(doc, 'DESTINO', voucher.destino, xLabel, xValue, y); y += 8;
  addField(doc, 'DESTINO EXTRA', voucher.destinoExtra || '-', xLabel, xValue, y); y += 8;
  addField(doc, 'MOTIVO DA VIAGEM', voucher.motivo || '-', xLabel, xValue, y); y += 8;
  addField(doc, 'PEDÁGIO', voucher.pedagio > 0 ? formatCurrency(voucher.pedagio) : 'R$ 0,00', xLabel, xValue, y); y += 8;
  addField(doc, 'ESTACIONAMENTO', voucher.estacionamento > 0 ? formatCurrency(voucher.estacionamento) : 'R$ 0,00', xLabel, xValue, y); y += 8;
  addField(doc, 'HOSPEDAGEM', voucher.hospedagem > 0 ? formatCurrency(voucher.hospedagem) : 'R$ 0,00', xLabel, xValue, y); y += 8;
  addField(doc, 'MOTORISTA', voucher.motorista, xLabel, xValue, y); y += 8;
  // NOME PASSAGEIRO - em linha única separada por vírgulas (com quebra automática)
  const passengerArr = parsePassengers(voucher.passageiros || '');
  doc.setFont('helvetica', 'bold');
  doc.text('NOME PASSAGEIRO:', xLabel, y);
  doc.setFont('helvetica', 'normal');
  if (passengerArr.length === 0) {
    doc.text('-', xValue, y);
    y += 8;
  } else {
    const passengersInline = passengerArr.join(', ');
    const maxWidth = pageWidth - margin - xValue;
    const wrappedPassengers = doc.splitTextToSize(passengersInline, maxWidth);
    doc.text(wrappedPassengers, xValue, y);
    y += 8 * wrappedPassengers.length;
  }
  addField(doc, 'OBSERVAÇÃO DO MOTORISTA', '', xLabel, xValue, y); y += 8;

  const valorTotal = voucher.valor + voucher.pedagio + voucher.estacionamento + voucher.hospedagem;

  // Valor total em destaque (vermelho) posicionado à direita e abaixo do último campo, sem sobrepor textos
  const pageHeight = doc.internal.pageSize.getHeight();
  const valorY = Math.min(pageHeight - 30, y + 12);
  const valorLabelX = pageWidth - margin - 60;
  const valorValueX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VALOR:', valorLabelX, valorY, { align: 'right' });
  doc.setTextColor(200, 0, 0);
  doc.text(`${formatCurrency(valorTotal)}`, valorValueX, valorY, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Página 2 - Recibo
  doc.addPage();
  const headerBottomY2 = await drawHeader(doc);
  drawBorder(doc);

  let y2 = headerBottomY2 + 16; // um pouco abaixo da logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RECIBO', pageWidth / 2, y2, { align: 'center' });
  y2 += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const dataServicoBR = formatDateDDMMYYYY(voucher.dataServico);
  const totalBR = formatCurrency(valorTotal);

  const data = new Date(voucher.dataServico);
  const dia = data.getDate();
  const mesExtenso = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data);
  const ano = data.getFullYear();

  const passageirosInline = parsePassengers(voucher.passageiros || '').join(', ');
  const reciboTexto = `Declaramos ter prestado atendimento de Transporte ao sr(a). ${passageirosInline} inscrito no CPF nº: ; realizado pela PRIME TRANSPORTE no dia ${dataServicoBR} com as seguintes especificações: Iniciando o atendimento às ${voucher.horaInicio || ''} horas sendo finalizado às ${voucher.horaFim || ''} horas, tendo como trajeto: ${voucher.origem} x ${voucher.destino}${voucher.destinoExtra ? ' x ' + voucher.destinoExtra : ''} x tendo um pedagio de ${formatCurrency(voucher.pedagio)} sendo atendido pelo motorista: ${voucher.motorista}. Sendo de ${totalBR} o valor total do serviço prestado a ser faturado pela contratante ${voucher.empresa}. Rio das Ostras, ${dia} ${mesExtenso} ${ano}`;

  const wrapped = doc.splitTextToSize(reciboTexto, pageWidth - margin * 2);
  doc.text(wrapped, margin, y2 + 8);

  // Rodapé: Nome, Assinatura abaixo do nome, depois cargo e empresa
  const pageHeightRec = doc.internal.pageSize.getHeight();
  const bottomMargin = 20; // manter acima da borda inferior (10mm) com folga
  const nameToSignGap = 6;
  const afterSignGap = 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  // calcula Y base garantindo que o último texto não ultrapasse o limite
  const companyGap = 8; // distância entre "CEO" e empresa
  const signH = 65; // mm (solicitado)
  const baseFooterY = pageHeightRec - (bottomMargin + nameToSignGap + signH + afterSignGap + companyGap);

  doc.text('VALDIR BRUNO ALMEIDA DE SIQUEIRA', pageWidth / 2, baseFooterY, { align: 'center' });

  // Assinatura 65x65mm abaixo do nome
  try {
    let signData = await imageToPngDataUrl('/signature.png', 600, 600);
    if (!signData) {
      signData = await imageToPngDataUrl('/signature.svg', 600, 600);
    }
    if (signData) {
      const signW = 65; // mm
      const signX = (pageWidth - signW) / 2;
      const signY = baseFooterY + nameToSignGap;
      doc.addImage(signData, 'PNG', signX, signY, signW, signH);
    }
  } catch {}

  const ceoY = baseFooterY + nameToSignGap + signH + afterSignGap; // abaixo da assinatura
  doc.setFont('helvetica', 'normal');
  doc.text('CEO', pageWidth / 2, ceoY, { align: 'center' });
  doc.text('PRIME TRANSPORTE INTELIGENTE', pageWidth / 2, ceoY + companyGap, { align: 'center' });

  // Nome do arquivo
  const fileName = `voucher_${voucher.id}_${new Date(voucher.dataServico).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
