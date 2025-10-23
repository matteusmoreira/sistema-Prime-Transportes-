
import type { Corrida } from '@/types/corridas';
import { formatCurrency, formatDateDDMMYYYY } from '@/utils/format';
import * as XLSX from 'xlsx';

export const exportCorridasToCSV = (corridas: Corrida[], fileName = 'relatorio.xlsx') => {
  const headers = [
    'ID',
    'Solicitante',
    'Empresa',
    'Número OS',
    'Data',
    'Data Serviço',
    'Hora Saída',
    'Hora Chegada',
    'Hora Início',
    'Hora OS',
    'Hora Espera',
    'Valor Hora Espera',
    'Passageiros',
    'Motorista',
    'Veículo',
    'Origem',
    'Destino',
    'Destino Extra',
    'Status',
    'KM Inicial',
    'KM Final',
    'KM Total',
    'Centro Custo',
    'Projeto',
    'Motivo',
    'Tipo Abrangência',
    'Distância Percorrida',
    'Valor Base',
    'Pedágio',
    'Estacionamento',
    'Hospedagem',
    'Outros Custos',
    'Reembolsos',
    'Valor Total',
    'CTE/NF',
    'Valor Motorista',
    'Status Pagamento',
    'Medição/Nota Fiscal',
    'Observações',
    'Observações OS',
    'Preenchido Por Motorista',
    'Preenchido Por Financeiro'
  ];
  
  const rows = corridas.map(c => {
    const valorBase = Number(c.valor) || 0;
    const pedagio = Number(c.pedagio) || 0;
    const estacionamento = Number(c.estacionamento) || 0;
    const hospedagem = Number(c.hospedagem) || 0;
    const outrosCustos = Number(c.outros) || 0;
    const reembolsos = Number(c.reembolsos) || 0;
    const valorTotal = valorBase + pedagio + estacionamento + hospedagem + outrosCustos + reembolsos;
    
    return [
      c.id,
      c.solicitante || '',
      c.empresa || '',
      c.numeroOS || '',
      formatDateDDMMYYYY(c.data),
      c.dataServico ? formatDateDDMMYYYY(c.dataServico) : '',
      c.horaSaida || '',
      c.horaChegada || '',
      c.horaInicio || '',
      c.horaOS || '',
      c.horaEspera || '',
      Number(c.valorHoraEspera) || 0,
      c.passageiros || '',
      c.motorista || '',
      c.veiculo || '',
      c.origem || '',
      c.destino || '',
      c.destinoExtra || '',
      c.status || '',
      Number(c.kmInicial) || 0,
      Number(c.kmFinal) || 0,
      Number(c.kmTotal) || 0,
      c.centroCusto || '',
      c.projeto || '',
      c.motivo || '',
      c.tipoAbrangencia || '',
      Number(c.distanciaPercorrida) || 0,
      valorBase,
      pedagio,
      estacionamento,
      hospedagem,
      outrosCustos,
      reembolsos,
      valorTotal,
      c.cteNf || '',
      Number(c.valorMotorista) || 0,
      c.statusPagamento || '',
      c.medicaoNotaFiscal || '',
      c.observacoes || '',
      c.observacoesOS || '',
      c.preenchidoPorMotorista ? 'Sim' : 'Não',
      c.preenchidoPorFinanceiro ? 'Sim' : 'Não'
    ];
  });

  // Criar dados para o Excel
  const worksheetData = [headers, ...rows];
  
  // Criar workbook e worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Configurar formatação das colunas monetárias
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Aplicar formatação de moeda para as colunas de valores monetários
  // Colunas: Valor Hora Espera (11), Valor Base (27), Pedágio (28), Estacionamento (29), 
  // Hospedagem (30), Outros Custos (31), Reembolsos (32), Valor Total (33), Valor Motorista (35)
  const monetaryColumns = [11, 27, 28, 29, 30, 31, 32, 33, 35];
  for (let row = 1; row <= range.e.r; row++) {
    for (const col of monetaryColumns) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = '"R$" #,##0.00';
      }
    }
  }
  
  // Aplicar formatação numérica para colunas de KM e distância
  const numericColumns = [19, 20, 21, 26]; // KM Inicial, KM Final, KM Total, Distância Percorrida
  for (let row = 1; row <= range.e.r; row++) {
    for (const col of numericColumns) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = '#,##0.00';
      }
    }
  }
  
  // Definir larguras das colunas
  worksheet['!cols'] = [
    { wch: 8 },   // ID
    { wch: 20 },  // Solicitante
    { wch: 20 },  // Empresa
    { wch: 12 },  // Número OS
    { wch: 12 },  // Data
    { wch: 12 },  // Data Serviço
    { wch: 10 },  // Hora Saída
    { wch: 10 },  // Hora Chegada
    { wch: 10 },  // Hora Início
    { wch: 10 },  // Hora OS
    { wch: 10 },  // Hora Espera
    { wch: 15 },  // Valor Hora Espera
    { wch: 15 },  // Passageiros
    { wch: 20 },  // Motorista
    { wch: 15 },  // Veículo
    { wch: 25 },  // Origem
    { wch: 25 },  // Destino
    { wch: 20 },  // Destino Extra
    { wch: 12 },  // Status
    { wch: 10 },  // KM Inicial
    { wch: 10 },  // KM Final
    { wch: 10 },  // KM Total
    { wch: 15 },  // Centro Custo
    { wch: 15 },  // Projeto
    { wch: 20 },  // Motivo
    { wch: 15 },  // Tipo Abrangência
    { wch: 12 },  // Distância Percorrida
    { wch: 15 },  // Valor Base
    { wch: 12 },  // Pedágio
    { wch: 15 },  // Estacionamento
    { wch: 12 },  // Hospedagem
    { wch: 15 },  // Outros Custos
    { wch: 12 },  // Reembolsos
    { wch: 15 },  // Valor Total
    { wch: 12 },  // CTE/NF
    { wch: 15 },  // Valor Motorista
    { wch: 15 },  // Status Pagamento
    { wch: 18 },  // Medição/Nota Fiscal
    { wch: 30 },  // Observações
    { wch: 30 },  // Observações OS
    { wch: 20 },  // Preenchido Por Motorista
    { wch: 20 }   // Preenchido Por Financeiro
  ];
  
  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
  
  // Gerar arquivo Excel e fazer download com configurações específicas
  let xlsxFileName = fileName;
  if (!xlsxFileName.endsWith('.xlsx')) {
    xlsxFileName = xlsxFileName.replace(/\.(csv|xls)$/, '') + '.xlsx';
  }
  XLSX.writeFile(workbook, xlsxFileName, { 
    bookType: 'xlsx',
    type: 'binary',
    compression: true
  });
};

export interface PagamentoMotorista {
  nome: string;
  pix: string;
  valorReceber: number;
}

export const exportPagamentosMotoristasToExcel = (
  pagamentos: PagamentoMotorista[],
  fileName = 'relatorio-pagamentos-motoristas.xlsx'
) => {
  const headers = ['Nome do motorista', 'PIX', 'Valor a receber'];
  const rows = pagamentos.map(p => [p.nome, p.pix || '', Number(p.valorReceber) || 0]);

  const worksheetData = [headers, ...rows];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  // Coluna monetária: índice 2 (0-based)
  const monetaryColumns = [2];
  for (let row = 1; row <= range.e.r; row++) {
    for (const col of monetaryColumns) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = '"R$" #,##0.00';
      }
    }
  }

  worksheet['!cols'] = [
    { wch: 25 }, // Nome do motorista
    { wch: 25 }, // PIX
    { wch: 18 }, // Valor a receber
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagamentos Motoristas');

  let xlsxFileName = fileName;
  if (!xlsxFileName.endsWith('.xlsx')) {
    xlsxFileName = xlsxFileName.replace(/\.(csv|xls)$/,'') + '.xlsx';
  }
  XLSX.writeFile(workbook, xlsxFileName, {
    bookType: 'xlsx',
    type: 'binary',
    compression: true,
  });
};
