import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmpresas } from '@/hooks/useEmpresas';

interface SolicitanteFormData {
  nome: string;
  empresaId: string;
  email: string;
  telefone: string;
  cargo: string;
}

interface SolicitanteFormProps {
  formData: SolicitanteFormData;
  onInputChange: (field: keyof SolicitanteFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const SolicitanteForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  isEditing 
}: SolicitanteFormProps) => {
  const { empresas } = useEmpresas();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => onInputChange('nome', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa</Label>
        <Select value={formData.empresaId} onValueChange={(value) => onInputChange('empresaId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id.toString()}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          value={formData.telefone}
          onChange={(e) => onInputChange('telefone', e.target.value)}
          placeholder="(00) 00000-0000"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo</Label>
        <Input
          id="cargo"
          value={formData.cargo}
          onChange={(e) => onInputChange('cargo', e.target.value)}
          placeholder="Ex: Gerente, Coordenador..."
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};
