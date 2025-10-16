
import type { Corrida } from '@/types/corridas';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';

export const exportCorridasToCSV = (corridas: Corrida[], fileName = 'relatorio.csv') => {
  const headers = [
    'ID',
    'Data',
    'Empresa',
    'Motorista',
    'Origem',
    'Destino',
    'Status',
    'KM Total',
    'Valor Base',
    'Pedágio',
    'Estacionamento',
    'Hospedagem',
    'Outros Custos',
    'Valor Total'
  ];
  
  const rows = corridas.map(c => {
    const valorBase = Number(c.valor) || 0;
    const pedagio = Number(c.pedagio) || 0;
    const estacionamento = Number(c.estacionamento) || 0;
    const hospedagem = Number(c.hospedagem) || 0;
    const outrosCustos = Number(c.outros) || 0;
    const valorTotal = valorBase + pedagio + estacionamento + hospedagem + outrosCustos;
    
    return [
      c.id,
      formatDateDDMMYYYY((c as any).dataServico || c.data),
      c.empresa,
      c.motorista || '',
      c.origem,
      c.destino,
      c.status,
      String(c.kmTotal ?? ''),
      formatCurrency(valorBase),
      formatCurrency(pedagio),
      formatCurrency(estacionamento),
      formatCurrency(hospedagem),
      formatCurrency(outrosCustos),
      formatCurrency(valorTotal)
    ];
  });

  const csv = [headers, ...rows]
    .map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v).join(','))
    .join('\n');

  // Adicionar BOM para UTF-8 para melhor compatibilidade com Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // Alterar extensão para .xls para melhor compatibilidade
  const xlsFileName = fileName.replace('.csv', '.xls');
  link.setAttribute('download', xlsFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
