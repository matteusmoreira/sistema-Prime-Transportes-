
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface FinanceiroStatsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalValue: number;
}

export const FinanceiroStats = ({ 
  pendingCount, 
  approvedCount, 
  rejectedCount, 
  totalValue 
}: FinanceiroStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-orange-500" />
            <span>Aguardando Conferência</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          <p className="text-sm text-gray-600">Corridas pendentes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Aprovadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-sm text-gray-600">Este mês</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span>Reprovadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          <p className="text-sm text-gray-600">Este mês</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Valor Total</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-gray-600">Aprovado este mês</p>
        </CardContent>
      </Card>
    </div>
  );
};
