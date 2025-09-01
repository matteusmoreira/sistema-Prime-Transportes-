
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Empresa } from '@/hooks/useEmpresas';

interface EmpresaTableProps {
  empresas: Empresa[];
  onEdit: (empresa: Empresa) => void;
  onDelete: (id: number) => void;
}

export const EmpresaTable = ({ empresas, onEdit, onDelete }: EmpresaTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          {/* Removido: <TableHead>Centro de custo</TableHead> */}
          <TableHead>CNPJ</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {empresas.map((empresa) => (
          <TableRow key={empresa.id}>
            <TableCell className="font-medium">{empresa.nome}</TableCell>
            {/* Removido: <TableCell>{empresa.centroCusto}</TableCell> */}
            <TableCell>{empresa.cnpj}</TableCell>
            <TableCell>{empresa.telefone}</TableCell>
            <TableCell>{empresa.email}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(empresa)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(empresa.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
