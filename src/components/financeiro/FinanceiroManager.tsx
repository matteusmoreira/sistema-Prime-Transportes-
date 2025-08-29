
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useFinanceiro, type CorridaFinanceiro } from '@/hooks/useFinanceiro';
import { FinanceiroStats } from './FinanceiroStats';
import { FinanceiroTable } from './FinanceiroTable';
import { CorridaEditDialog } from './CorridaEditDialog';
import { CorridaViewDialog } from './CorridaViewDialog';
import { CorridaRejectDialog } from './CorridaRejectDialog';


export const FinanceiroManager = () => {
  const { corridas, updateStatus, updatePaymentStatus, updateMedicaoNotaFiscalStatus, approveCorrida, rejectCorrida, getStats, updateCorrida } = useFinanceiro();
  const [selectedCorrida, setSelectedCorrida] = useState<CorridaFinanceiro | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [documentsUpdateTrigger, setDocumentsUpdateTrigger] = useState(0);

  const stats = getStats();

  const handleView = (corrida: CorridaFinanceiro) => {
    setSelectedCorrida(corrida);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (corrida: CorridaFinanceiro) => {
    // Abertura do diálogo de edição de corrida
     
    setSelectedCorrida(corrida);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (dadosBasicos: any, documentos: any) => {
     if (!selectedCorrida) return;
     
    // Salvando alterações no financeiro
     
    try {
      await updateCorrida(selectedCorrida.id, dadosBasicos, documentos);
      
      setIsEditDialogOpen(false);
      
      // Força recarregamento de documentos e dados se a corrida ainda estiver sendo visualizada
      if (isViewDialogOpen) {
        setDocumentsUpdateTrigger(prev => prev + 1);
      }
      
      // Atualizar a corrida selecionada com os novos dados para a visualização
      setSelectedCorrida(prev => prev ? {
       ...prev,
       ...dadosBasicos,
       // Converter/espelhar campos principais atualizados
       empresa: dadosBasicos.empresa,
       motorista: dadosBasicos.motorista,
       dataServico: dadosBasicos.dataServico,
       origem: dadosBasicos.origem,
       destino: dadosBasicos.destino,
       destinoExtra: dadosBasicos.destinoExtra,
       kmTotal: dadosBasicos.kmTotal,
       valor: dadosBasicos.valor,
       valorMotorista: dadosBasicos.valorMotorista,
       pedagio: dadosBasicos.pedagio,
       estacionamento: dadosBasicos.estacionamento,
       hospedagem: dadosBasicos.hospedagem,
       passageiros: dadosBasicos.passageiros,
       centroCusto: dadosBasicos.centroCusto,
       numeroOS: dadosBasicos.numeroOS,
       observacoes: dadosBasicos.observacoes,
       projeto: dadosBasicos.projeto,
       motivo: dadosBasicos.motivo,
       // Novos campos OS/Financeiro
       veiculo: dadosBasicos.veiculo,
       tipoAbrangencia: dadosBasicos.tipoAbrangencia,
       horaInicio: dadosBasicos.horaInicio,
       horaFim: dadosBasicos.horaFim,
       kmInicial: dadosBasicos.kmInicial,
       kmFinal: dadosBasicos.kmFinal,
       solicitante: dadosBasicos.solicitante
     } : null);
     
   } catch (error) {
     console.error('❌ Erro no handleSave:', error);
     
     // Tratar diferentes tipos de erro
     if (error && typeof error === 'object' && 'message' in error) {
       const err = error as any;
       if (err.message?.includes('row-level security') || err.message?.includes('permission denied')) {
         toast.error('Erro de permissão: Verifique se você tem autorização para editar corridas');
       }
     }
   }
   
    // Fim do fluxo de salvar
  };

  const processarDocumentos = async (corridaId: number, documentos: any[]) => {
    // Iniciando processamento de documentos
     
    if (!documentos || documentos.length === 0) {
      return;
    }

    const sucessos: string[] = [];
    const erros: string[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      for (const documento of documentos) {
        if (!documento.arquivo) {
          continue;
        }

        try {
          // 1. Upload do arquivo para o storage
          const fileExtension = documento.arquivo.name.split('.').pop();
          const fileName = `${corridaId}/${documento.nome.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExtension}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('corrida-documentos')
            .upload(fileName, documento.arquivo);

          if (uploadError) {
            console.error('❌ Erro no upload do arquivo:', uploadError);
            erros.push(`${documento.nome}: ${uploadError.message}`);
            continue;
          }

          // 2. Salvar metadata no banco
          const { error: dbError } = await supabase
            .from('corrida_documentos')
            .insert({
              corrida_id: corridaId,
              nome: documento.nome,
              descricao: documento.descricao,
              url: uploadData.path
            });

          if (dbError) {
            console.error('❌ Erro ao salvar no banco:', dbError);
            erros.push(`${documento.nome}: ${dbError.message}`);
            // Tentar limpar o arquivo do storage em caso de erro
            await supabase.storage.from('corrida-documentos').remove([uploadData.path]);
            continue;
          }

          sucessos.push(documento.nome);
          
        } catch (docError) {
          console.error('❌ Erro no processamento do documento:', documento.nome, docError);
          erros.push(`${documento.nome}: Erro inesperado`);
        }
      }

      // Mostrar feedback
      if (sucessos.length > 0) {
        toast.success(`${sucessos.length} comprovante(s) anexado(s) com sucesso!`);
      }
      if (erros.length > 0) {
        toast.error(`Erro em ${erros.length} comprovante(s). Verifique os logs.`);
      }
      
      // Incrementar o trigger para recarregar documentos
      setDocumentsUpdateTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('❌ Erro geral no processamento de documentos:', error);
      toast.error('Erro inesperado no processamento de documentos');
    }
  };

  const handleApprove = (corrida: CorridaFinanceiro) => {
    approveCorrida(corrida);
  };

  const handleReject = (corrida: CorridaFinanceiro) => {
    setSelectedCorrida(corrida);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = (corrida: CorridaFinanceiro, motivo: string) => {
    rejectCorrida(corrida, motivo);
  };

  const handleStatusChange = (corridaId: number, status: CorridaFinanceiro['status']) => {
    updateStatus(corridaId, status);
  };

  const handlePaymentStatusChange = (corridaId: number, statusPagamento: CorridaFinanceiro['statusPagamento']) => {
    updatePaymentStatus(corridaId, statusPagamento);
  };

  const handleMedicaoNotaFiscalChange = (corridaId: number, medicaoNotaFiscal: CorridaFinanceiro['medicaoNotaFiscal']) => {
    updateMedicaoNotaFiscalStatus(corridaId, medicaoNotaFiscal);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Painel Financeiro</h2>
      </div>


      <FinanceiroStats {...stats} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Corridas para Conferência</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceiroTable
            corridas={corridas}
            onView={handleView}
            onEdit={handleEdit}
            onApprove={handleApprove}
            onReject={handleReject}
            onStatusChange={handleStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
            onMedicaoNotaFiscalChange={handleMedicaoNotaFiscalChange}
          />
        </CardContent>
      </Card>

      <CorridaViewDialog
        corrida={selectedCorrida}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        documentsUpdateTrigger={documentsUpdateTrigger}
      />

      <CorridaEditDialog
        corrida={selectedCorrida}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />

      <CorridaRejectDialog
        corrida={selectedCorrida}
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onReject={handleRejectConfirm}
      />
    </div>
  );
};
