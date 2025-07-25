
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { Motorista } from '@/hooks/useMotoristas';
import { AdminDocumentosViewer } from '../AdminDocumentosViewer';

interface MotoristaTableProps {
  motoristas: Motorista[];
  onEdit: (motorista: Motorista) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export const MotoristaTable = ({ 
  motoristas, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject 
}: MotoristaTableProps) => {
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);

  const handleViewDocuments = (motorista: Motorista) => {
    setSelectedMotorista(motorista);
    setIsDocumentsDialogOpen(true);
  };
  const getStatusBadge = (status: Motorista['status']) => {
    switch (status) {
      case 'Aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'Reprovado':
        return <Badge className="bg-red-100 text-red-800">Reprovado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Aguardando Aprovação</Badge>;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Documentos</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {motoristas.map((motorista) => (
            <TableRow key={motorista.id}>
              <TableCell className="font-medium">{motorista.nome}</TableCell>
              <TableCell>{motorista.cpf}</TableCell>
              <TableCell>{motorista.telefone}</TableCell>
              <TableCell>{motorista.email}</TableCell>
              <TableCell>{getStatusBadge(motorista.status)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{motorista.documentos.length}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewDocuments(motorista)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(motorista)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {motorista.status === 'Aguardando Aprovação' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onApprove(motorista.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject(motorista.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(motorista.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedMotorista && (
        <AdminDocumentosViewer
          motorista={selectedMotorista}
          open={isDocumentsDialogOpen}
          onOpenChange={setIsDocumentsDialogOpen}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </>
  );
};
