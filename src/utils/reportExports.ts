
import jsPDF from 'jspdf';
import type { Corrida } from '@/types/corridas';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';

export const exportCorridasToCSV = (corridas: Corrida[], fileName = 'relatorio.csv') => {
  const headers = [
    'ID','Data','Empresa','Motorista','Origem','Destino','Status','KM Total','Valor'
  ];
  const rows = corridas.map(c => [
    c.id,
    formatDateDDMMYYYY((c as any).dataServico || c.data),
    c.empresa,
    c.motorista || '',
    c.origem,
    c.destino,
    c.status,
    String(c.kmTotal ?? ''),
    String((Number(c.valor) || 0) + (Number(c.pedagio)||0) + (Number(c.estacionamento)||0) + (Number(c.hospedagem)||0))
  ]);

  const csv = [headers, ...rows]
    .map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCorridasToPDF = async (
  corridas: Corrida[],
  opts: { titulo?: string; periodo?: string; filtros?: any; fileName?: string } = {}
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;
  let y = 18;

  doc.setFont('helvetica','bold');
  doc.setFontSize(16);
  doc.text(opts.titulo || 'RELATÓRIO DE CORRIDAS', pageWidth/2, y, { align: 'center' });
  y += 8;
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  if (opts.periodo) {
    doc.text(`Período: ${opts.periodo}`, pageWidth/2, y, { align: 'center' });
    y += 6;
  }

  // Cabeçalhos
  y += 6;
  const headers = ['ID','Data','Empresa','Motorista','Origem','Destino','Status','KM','Valor'];
  doc.setFont('helvetica','bold');
  doc.setFontSize(9);
  let x = margin;
  const colWidths = [12, 22, 30, 28, 28, 28, 20, 12, 18];
  headers.forEach((h, i) => {
    doc.text(h, x, y);
    x += colWidths[i];
  });
  y += 4;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont('helvetica','normal');
  const addRow = (cols: string[]) => {
    let xPos = margin;
    cols.forEach((txt, i) => {
      const cellWidth = colWidths[i];
      // Truncar texto para caber na coluna
      const maxChars = Math.floor(cellWidth / 2.5);
      const t = txt.length > maxChars ? txt.slice(0, maxChars - 1) + '…' : txt;
      doc.text(t, xPos, y);
      xPos += cellWidth;
    });
    y += 5;
    if (y > doc.internal.pageSize.height - 14) {
      doc.addPage();
      y = 18;
    }
  };

  const sumValor = (c: Corrida) => (Number(c.valor) || 0) + (Number(c.pedagio)||0) + (Number(c.estacionamento)||0) + (Number(c.hospedagem)||0);

  corridas.forEach(c => {
    addRow([
      String(c.id),
      formatDateDDMMYYYY((c as any).dataServico || c.data),
      c.empresa,
      c.motorista || '',
      c.origem,
      c.destino,
      c.status,
      String(c.kmTotal ?? ''),
      `${formatCurrency(sumValor(c))}`
    ]);
  });

  // Rodapé com totais
  const totalValor = corridas.reduce((s,c)=> s + sumValor(c), 0);
  const totalKm = corridas.reduce((s,c)=> s + (Number(c.kmTotal)||0), 0);
  y += 4;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('helvetica','bold');
  doc.text(`Total de corridas: ${corridas.length}  |  KM: ${totalKm}  |  Valor: ${formatCurrency(totalValor)}` , margin, y);

  doc.save(opts.fileName || 'relatorio.pdf');
};
