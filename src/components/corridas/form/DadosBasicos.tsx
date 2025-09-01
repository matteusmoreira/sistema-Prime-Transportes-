
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useSolicitantes } from '@/hooks/useSolicitantes';
import { useMotoristas } from '@/hooks/useMotoristas';
import { useMemo } from 'react';

interface DadosBasicosProps {
  formData: {
    empresa: string;
    empresaId?: string;
    solicitante: string;
    solicitanteId?: string;
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

  // Empresa selecionada - buscar por ID primeiro, depois por nome (compatibilidade)
  const empresaSelecionada = useMemo(() => {
    if (formData.empresaId) {
      // Buscar por ID (novo formato)
      return empresas.find(e => String(e.id) === String(formData.empresaId));
    } else if (formData.empresa) {
      // Buscar por nome (compatibilidade com formato antigo)
      return empresas.find(e => e.nome === formData.empresa);
    }
    return undefined;
  }, [empresas, formData.empresaId, formData.empresa]);

  // Solicitante selecionado - buscar por ID primeiro, depois por nome
  const solicitanteSelecionado = useMemo(() => {
    if (formData.solicitanteId) {
      return solicitantes.find(s => String(s.id) === String(formData.solicitanteId));
    } else if (formData.solicitante) {
      return solicitantes.find(s => s.nome === formData.solicitante);
    }
    return undefined;
  }, [solicitantes, formData.solicitanteId, formData.solicitante]);

  // Solicitantes filtrados pela empresa selecionada
  const solicitantesFiltrados = useMemo(() => {
    if (!empresaSelecionada) return solicitantes;
    return solicitantes.filter(s => s.empresaId === empresaSelecionada.id);
  }, [solicitantes, empresaSelecionada]);

  const handleMotoristaChange = (value: string) => {
    onFormChange('motorista', value);
  };

  const handleEmpresaChange = (empresaId: string) => {
    const empresaEscolhida = empresas.find(e => String(e.id) === empresaId);
    
    if (empresaEscolhida) {
      // Salvar tanto o ID quanto o nome para compatibilidade
      onFormChange('empresaId', empresaId);
      onFormChange('empresa', empresaEscolhida.nome);

      // Resetar solicitante se não pertencer à nova empresa selecionada
      if (solicitanteSelecionado && solicitanteSelecionado.empresaId !== empresaEscolhida.id) {
        onFormChange('solicitante', '');
        onFormChange('solicitanteId', '');
      }
    }
  };

  const handleSolicitanteChange = (solicitanteId: string) => {
    const solicitanteEscolhido = solicitantes.find(s => String(s.id) === solicitanteId);
    
    if (solicitanteEscolhido) {
      // Salvar tanto o ID quanto o nome para compatibilidade
      onFormChange('solicitanteId', solicitanteId);
      onFormChange('solicitante', solicitanteEscolhido.nome);
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Empresa *</Label>
            <Input value={empresaSelecionada?.nome || formData.empresa} readOnly className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Solicitante *</Label>
            <Input value={solicitanteSelecionado?.nome || formData.solicitante} readOnly className="bg-gray-100" />
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
          <Select 
            value={empresaSelecionada ? String(empresaSelecionada.id) : ''} 
            onValueChange={handleEmpresaChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map(empresa => (
                <SelectItem key={empresa.id} value={String(empresa.id)}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Solicitante *</Label>
          <Select
            value={solicitanteSelecionado ? String(solicitanteSelecionado.id) : ''}
            onValueChange={handleSolicitanteChange}
            disabled={!empresaSelecionada && empresas.length > 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={empresaSelecionada ? 'Selecione um solicitante' : 'Selecione uma empresa primeiro'} />
            </SelectTrigger>
            <SelectContent>
              {solicitantesFiltrados.length > 0 ? (
                solicitantesFiltrados.map(solicitante => (
                  <SelectItem key={solicitante.id} value={String(solicitante.id)}>
                    {solicitante.nome}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-solicitante" disabled>
                  Nenhum solicitante encontrado para a empresa
                </SelectItem>
              )}
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
