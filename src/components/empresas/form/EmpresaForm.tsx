
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EmpresaFormData {
  nome: string;
  localidade: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  observacoes: string;
  centroCusto: string;
}

interface EmpresaFormProps {
  formData: EmpresaFormData;
  onInputChange: (field: keyof EmpresaFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const EmpresaForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  isEditing 
}: EmpresaFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário submetido com dados:', formData);
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Empresa</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => {
              console.log('Nome alterado:', e.target.value);
              onInputChange('nome', e.target.value);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="localidade">Localidade</Label>
          <Input
            id="localidade"
            value={formData.localidade}
            onChange={(e) => onInputChange('localidade', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => onInputChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
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
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => onInputChange('endereco', e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="centroCusto">Centro de Custo</Label>
        <Textarea
          id="centroCusto"
          value={formData.centroCusto}
          onChange={(e) => onInputChange('centroCusto', e.target.value)}
          rows={3}
          placeholder="Digite o centro de custo da empresa (opcional)"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => onInputChange('observacoes', e.target.value)}
          rows={3}
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
