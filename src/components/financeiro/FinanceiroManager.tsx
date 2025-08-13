
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
    console.log('📎 Processando documentos para corrida:', corridaId);
    let documentosSalvos = 0;
    
    for (const documento of documentos) {
      console.log('📄 Processando documento:', documento.nome, 'Arquivo:', !!documento.arquivo);
      
      if (documento.arquivo) {
        try {
          // Upload do arquivo para o storage
          const sanitizedName = documento.nome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
          const fileName = `${corridaId}_EDIT_${Date.now()}_${sanitizedName}`;
          
          console.log('⬆️ Fazendo upload do arquivo:', fileName);
          
          const { supabase } = await import('@/integrations/supabase/client');
          const { error: uploadError } = await supabase.storage
            .from('corrida-documentos')
            .upload(fileName, documento.arquivo);

          if (uploadError) {
            console.error('❌ Erro ao fazer upload do comprovante:', uploadError);
            toast.error(`Erro ao fazer upload do comprovante ${documento.nome}`);
            continue;
          }

          console.log('✅ Upload realizado com sucesso, salvando registro na tabela...');

          // Salvar registro do documento na tabela
          const { error: docInsertError } = await supabase
            .from('corrida_documentos')
            .insert({
              corrida_id: corridaId,
              nome: documento.nome,
              descricao: documento.descricao || `Comprovante de ${documento.nome}`,
              url: fileName
            });

          if (docInsertError) {
            console.error('❌ Erro ao salvar registro do comprovante:', docInsertError);
            toast.error(`Erro ao salvar registro do comprovante ${documento.nome}`);
            continue;
          }

          documentosSalvos++;
          console.log('✅ Comprovante salvo com sucesso:', documento.nome);
          
        } catch (docError) {
          console.error('❌ Erro ao processar comprovante:', documento.nome, docError);
          toast.error(`Erro ao processar comprovante ${documento.nome}`);
        }
      } else {
        console.log('⚠️ Documento sem arquivo:', documento.nome);
      }
    }
    
    if (documentosSalvos > 0) {
      toast.success(`${documentosSalvos} comprovante(s) salvo(s) com sucesso!`);
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
