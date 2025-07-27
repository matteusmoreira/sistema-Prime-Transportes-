import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Mail } from 'lucide-react';
import { generateVoucherPDF } from '@/utils/pdfGenerator';
import { sendVoucherEmail } from '@/utils/emailSender';
import { toast } from 'sonner';
import type { VoucherData } from '@/hooks/useVoucher';

interface VoucherTableProps {
  vouchers: VoucherData[];
}

export const VoucherTable = ({ vouchers }: VoucherTableProps) => {
  const handleGeneratePDF = async (voucher: VoucherData) => {
    try {
      await generateVoucherPDF(voucher);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const handleSendEmail = async (voucher: VoucherData) => {
    try {
      await sendVoucherEmail(voucher);
      toast.success('Email enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error('Erro ao enviar email');
    }
  };

  if (vouchers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum voucher encontrado para o período selecionado.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Motorista</TableHead>
          <TableHead>Rota</TableHead>
          <TableHead>KM</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Centro de Custo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vouchers.map((voucher) => (
          <TableRow key={voucher.id}>
            <TableCell>{new Date(voucher.dataServico).toLocaleDateString('pt-BR')}</TableCell>
            <TableCell className="font-medium">{voucher.empresa}</TableCell>
            <TableCell>{voucher.motorista}</TableCell>
            <TableCell>{voucher.origem} → {voucher.destino}</TableCell>
            <TableCell>{voucher.kmTotal} km</TableCell>
            <TableCell>R$ {voucher.valor.toFixed(2)}</TableCell>
            <TableCell>{voucher.centroCusto}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleGeneratePDF(voucher)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleSendEmail(voucher)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};