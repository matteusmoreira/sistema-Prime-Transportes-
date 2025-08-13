
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
    console.log('=== CLICOU PARA EDITAR CORRIDA ===');
    console.log('Corrida selecionada para edição:', corrida);
    console.log('ID da corrida:', corrida.id);
    console.log('Status da corrida:', corrida.status);
    console.log('=== FIM CLICOU PARA EDITAR ===');
    
    setSelectedCorrida(corrida);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (corridaId: number, formData: any) => {
    console.log('=== HANDLE SAVE FINANCEIRO MANAGER ===');
    console.log('Corridor ID recebido:', corridaId);
    console.log('Form data recebido:', formData);
    console.log('Tipos dos campos:', Object.keys(formData).map(key => ({ key, type: typeof formData[key], value: formData[key] })));
    
    // Separar documentos dos outros dados
    const { documentos, ...dadosBasicos } = formData;
    console.log('Documentos recebidos:', documentos);
    console.log('Dados básicos:', dadosBasicos);
    
    try {
      // Primeiro atualizar os dados básicos da corrida
      console.log('=== ATUALIZANDO DADOS BÁSICOS ===');
      await updateCorrida(corridaId, dadosBasicos);
      
      // Se há documentos, processá-los
      if (documentos && documentos.length > 0) {
        console.log('=== PROCESSANDO DOCUMENTOS ===');
        await processarDocumentos(corridaId, documentos);
      }
      
      setIsEditDialogOpen(false);
      
      // Força recarregamento de documentos se a corrida ainda estiver sendo visualizada
      if (selectedCorrida && selectedCorrida.id === corridaId && isViewDialogOpen) {
        setDocumentsUpdateTrigger(prev => prev + 1);
      }
      
      console.log('=== FIM HANDLE SAVE FINANCEIRO MANAGER (SUCESSO) ===');
    } catch (error) {
      console.error('Erro no handleSave:', error);
      console.error('=== FIM HANDLE SAVE FINANCEIRO MANAGER (ERRO) ===');
      // Não fecha o dialog se houver erro para o usuário poder tentar novamente
    }
  };

  const processarDocumentos = async (corridaId: number, documentos: any[]) => {
    console.log('📄 INICIANDO PROCESSAMENTO DE DOCUMENTOS');
    console.log('Corrida ID:', corridaId);
    console.log('Documentos recebidos:', documentos);
    
    if (!documentos || documentos.length === 0) {
      console.log('📄 Nenhum documento para processar');
      return;
    }

    const sucessos: string[] = [];
    const erros: string[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      for (const documento of documentos) {
        if (!documento.arquivo) {
          console.log('⚠️ Documento sem arquivo, pulando:', documento.nome);
          continue;
        }

        console.log('📤 Fazendo upload do documento:', documento.nome);
        
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

          console.log('✅ Arquivo enviado com sucesso:', uploadData.path);

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

          console.log('✅ Documento salvo com sucesso no banco:', documento.nome);
          sucessos.push(documento.nome);
          
        } catch (docError) {
          console.error('❌ Erro no processamento do documento:', documento.nome, docError);
          erros.push(`${documento.nome}: Erro inesperado`);
        }
      }

      console.log('📄 PROCESSAMENTO DE DOCUMENTOS CONCLUÍDO');
      console.log('✅ Sucessos:', sucessos);
      console.log('❌ Erros:', erros);
      
      // Mostrar feedback
      if (sucessos.length > 0) {
        toast.success(`${sucessos.length} comprovante(s) anexado(s) com sucesso!`);
      }
      if (erros.length > 0) {
        toast.error(`Erro em ${erros.length} comprovante(s). Verifique os logs.`);
      }
      
      // Incrementar o trigger para recarregar documentos
      setDocumentsUpdateTrigger(prev => prev + 1);
      console.log('🔄 Trigger de atualização incrementado para forçar reload');
      
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
