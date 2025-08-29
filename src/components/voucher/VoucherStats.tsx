
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, DollarSign, Building, Users } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface VoucherStatsProps {
  totalVouchers: number;
  totalValue: number;
  uniqueEmpresas: number;
  uniqueMotoristas: number;
}

export const VoucherStats = ({ 
  totalVouchers, 
  totalValue, 
  uniqueEmpresas, 
  uniqueMotoristas 
}: VoucherStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Vouchers</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVouchers}</div>
          <p className="text-xs text-muted-foreground">
            Vouchers disponíveis
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Valor total dos vouchers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueEmpresas}</div>
          <p className="text-xs text-muted-foreground">
            Empresas diferentes
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueMotoristas}</div>
          <p className="text-xs text-muted-foreground">
            Motoristas diferentes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
