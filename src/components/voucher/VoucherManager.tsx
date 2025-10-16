
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { useVoucher } from '@/hooks/useVoucher';
import { VoucherStats } from './VoucherStats';
import { VoucherFilters } from './VoucherFilters';
import { VoucherTable } from './VoucherTable';

export const VoucherManager = () => {
  const { voucherData, empresas, filterData, getStats } = useVoucher();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState('all');
  const [passageirosFilter, setPassageirosFilter] = useState('');
  
  const filteredData = filterData(startDate, endDate, selectedEmpresa, passageirosFilter);
  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Sistema de Vouchers</h2>
      </div>

      <VoucherStats {...stats} />

      <VoucherFilters
        startDate={startDate}
        endDate={endDate}
        selectedEmpresa={selectedEmpresa}
        passageirosFilter={passageirosFilter}
        empresas={empresas}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onEmpresaChange={setSelectedEmpresa}
        onPassageirosChange={setPassageirosFilter}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Vouchers Disponíveis ({filteredData.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoucherTable vouchers={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
};
