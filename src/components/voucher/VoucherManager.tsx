
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { useVoucher } from '@/hooks/useVoucher';
import { VoucherStats } from './VoucherStats';
import { VoucherFilters } from './VoucherFilters';
import { VoucherTable } from './VoucherTable';

export const VoucherManager = () => {
  const { voucherData, filterByDateRange, getStats } = useVoucher();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const filteredData = filterByDateRange(startDate, endDate);
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
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Vouchers Disponíveis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoucherTable vouchers={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
};
