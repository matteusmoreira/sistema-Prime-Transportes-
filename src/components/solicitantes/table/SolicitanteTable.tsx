
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Solicitante } from '@/hooks/useSolicitantes';

interface SolicitanteTableProps {
  solicitantes: Solicitante[];
  onEdit: (solicitante: Solicitante) => void;
  onDelete: (id: number) => void;
}

export const SolicitanteTable = ({ solicitantes, onEdit, onDelete }: SolicitanteTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solicitantes.map((solicitante) => (
          <TableRow key={solicitante.id}>
            <TableCell className="font-medium">{solicitante.nome}</TableCell>
            <TableCell>{solicitante.empresaNome}</TableCell>
            <TableCell>{solicitante.email}</TableCell>
            <TableCell>{solicitante.telefone}</TableCell>
            <TableCell>{solicitante.cargo}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(solicitante)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(solicitante.id)}
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
