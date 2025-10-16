
import { useMemo } from 'react';
import { useCorridas } from '../contexts/CorridasContext';
import { type Corrida } from '../types/corridas';

export interface VoucherData {
  id: number;
  empresa: string;
  motorista: string;
  veiculo?: string;
  dataServico: string;
  origem: string;
  destino: string;
  kmTotal: number;
  valor: number;
  centroCusto: string;
  pedagio: number;
  estacionamento: number;
  hospedagem: number;
  passageiros: string;
  destinoExtra: string;
  numeroOS: string;
  projeto?: string;
  motivo?: string;
  horaInicio?: string;
  horaFim?: string;
  kmInicial?: number;
  kmFinal?: number;
  solicitante?: string;
  tipoAbrangencia?: string;
}

export const useVoucher = () => {
  const { corridas } = useCorridas();

  // Filtrar apenas corridas aprovadas
  const corridasAprovadas = useMemo(() => {
    return corridas.filter(corrida => corrida.status === 'Aprovada');
  }, [corridas]);

  // Converter corridas para formato de voucher (excluindo campos específicos)
  const voucherData: VoucherData[] = useMemo(() => {
    return corridasAprovadas.map(corrida => ({
      id: corrida.id,
      empresa: corrida.empresa,
      motorista: corrida.motorista || '',
      veiculo: corrida.veiculo || '',
      dataServico: corrida.dataServico || corrida.data,
      origem: corrida.origem,
      destino: corrida.destino,
      kmTotal: corrida.kmTotal || 0,
      valor: corrida.valor || 0,
      centroCusto: corrida.centroCusto || '',
      pedagio: corrida.pedagio || 0,
      estacionamento: corrida.estacionamento || 0,
      hospedagem: corrida.hospedagem || 0,
      passageiros: corrida.passageiros || '',
      destinoExtra: corrida.destinoExtra || '',
      numeroOS: corrida.numeroOS || '',
      projeto: corrida.projeto,
      motivo: corrida.motivo,
      horaInicio: corrida.horaInicio || corrida.horaSaida,
      horaFim: corrida.horaChegada,
      kmInicial: corrida.kmInicial,
      kmFinal: corrida.kmFinal,
      solicitante: corrida.solicitante,
      tipoAbrangencia: corrida.tipoAbrangencia
    }));
  }, [corridasAprovadas]);

  // Obter lista única de empresas
  const empresas = useMemo(() => {
    const empresasUnicas = new Set(voucherData.map(v => v.empresa).filter(Boolean));
    return Array.from(empresasUnicas).sort();
  }, [voucherData]);

  const filterByDateRange = (startDate: string, endDate: string): VoucherData[] => {
    if (!startDate || !endDate) return voucherData;

    return voucherData.filter(voucher => {
      const voucherDate = new Date(voucher.dataServico);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return voucherDate >= start && voucherDate <= end;
    });
  };

  // Função para filtrar por empresa
  const filterByEmpresa = (data: VoucherData[], empresa: string): VoucherData[] => {
    if (!empresa || empresa === 'all') return data;
    return data.filter(voucher => voucher.empresa === empresa);
  };

  // Função para filtrar por passageiros (busca fuzzy)
  const filterByPassageiros = (data: VoucherData[], searchTerm: string): VoucherData[] => {
    if (!searchTerm || searchTerm.length < 3) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(voucher => {
      const passageiros = voucher.passageiros.toLowerCase();
      // Busca por palavras similares - divide o termo de busca e os passageiros em palavras
      const searchWords = searchLower.split(/\s+/);
      const passageiroWords = passageiros.split(/[,;:\s]+/);
      
      return searchWords.some(searchWord => 
        passageiroWords.some(passageiroWord => 
          passageiroWord.includes(searchWord) || searchWord.includes(passageiroWord)
        )
      );
    });
  };

  // Função combinada de filtros
  const filterData = (
    startDate: string, 
    endDate: string, 
    empresa: string, 
    passageiros: string
  ): VoucherData[] => {
    let filtered = filterByDateRange(startDate, endDate);
    filtered = filterByEmpresa(filtered, empresa);
    filtered = filterByPassageiros(filtered, passageiros);
    return filtered;
  };

  const getStats = () => {
    const totalVouchers = voucherData.length;
    const totalValue = voucherData.reduce((sum, voucher) => sum + voucher.valor, 0);
    const uniqueEmpresas = new Set(voucherData.map(v => v.empresa)).size;
    const uniqueMotoristas = new Set(voucherData.map(v => v.motorista)).size;

    return {
      totalVouchers,
      totalValue,
      uniqueEmpresas,
      uniqueMotoristas
    };
  };

  return {
    voucherData,
    empresas,
    filterByDateRange,
    filterByEmpresa,
    filterByPassageiros,
    filterData,
    getStats
  };
};
