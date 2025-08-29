
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useSolicitantes } from '@/hooks/useSolicitantes';
import { useMotoristas } from '@/hooks/useMotoristas';

interface DadosBasicosProps {
  formData: {
    empresa: string;
    solicitante: string;
    motorista: string;
    centroCusto: string;
  };
  onFormChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const DadosBasicos = ({ formData, onFormChange, readOnly = false }: DadosBasicosProps) => {
  const { empresas } = useEmpresas();
  const { solicitantes } = useSolicitantes();
  const { motoristas } = useMotoristas();

  // Filtrar apenas motoristas aprovados
  const motoristasAprovados = motoristas.filter(motorista => motorista.status === 'Aprovado');

  // console.log('=== DEBUG DadosBasicos ===');
  // console.log('Motoristas disponíveis:', motoristas);
  // console.log('Motoristas aprovados:', motoristasAprovados);
  // console.log('Motorista selecionado no form:', formData.motorista);
  // console.log('Centro de custo atual:', formData.centroCusto);
  // console.log('=== FIM DEBUG DadosBasicos ===');

  const handleMotoristaChange = (value: string) => {
    // Removido log informativo: motorista selecionado no select
     onFormChange('motorista', value);
  };

  const handleEmpresaChange = (value: string) => {
    // Removido log informativo: empresa selecionada
     onFormChange('empresa', value);
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Empresa *</Label>
            <Input value={formData.empresa} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Solicitante *</Label>
            <Input value={formData.solicitante} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Motorista</Label>
            <Input value={formData.motorista} readOnly className="bg-gray-100" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Centro de Custo *</Label>
          <Input value={formData.centroCusto} readOnly className="bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Empresa *</Label>
          <Select value={formData.empresa} onValueChange={handleEmpresaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map(empresa => (
                <SelectItem key={empresa.id} value={empresa.nome}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Solicitante *</Label>
          <Select value={formData.solicitante} onValueChange={value => onFormChange('solicitante', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um solicitante" />
            </SelectTrigger>
            <SelectContent>
              {solicitantes.map(solicitante => (
                <SelectItem key={solicitante.id} value={solicitante.nome}>
                  {solicitante.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Motorista</Label>
          <Select value={formData.motorista} onValueChange={handleMotoristaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um motorista" />
            </SelectTrigger>
            <SelectContent>
              {motoristasAprovados.length > 0 ? (
                motoristasAprovados.map(motorista => (
                  <SelectItem key={motorista.id} value={motorista.nome}>
                    {motorista.nome}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-motorista" disabled>
                  Nenhum motorista aprovado cadastrado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Centro de Custo *</Label>
        <Input
          value={formData.centroCusto}
          onChange={(e) => onFormChange('centroCusto', e.target.value)}
          placeholder="Digite o centro de custo"
          required
        />
      </div>
    </div>
  );
};
