
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EmpresasManager } from '@/components/empresas/EmpresasManager';
import { SolicitantesManager } from '@/components/solicitantes/SolicitantesManager';
import { MotoristaManager } from '@/components/motoristas/MotoristaManager';
import { MeusDocumentos } from '@/components/motoristas/MeusDocumentos';
import { CorridasManager } from '@/components/corridas/CorridasManager';
import { FinanceiroManager } from '@/components/financeiro/FinanceiroManager';
import { VoucherManager } from '@/components/voucher/VoucherManager';
import { AlertasManager } from '@/components/alertas/AlertasManager';
import { NotificacoesMotorista } from '@/components/alertas/NotificacoesMotorista';
import { RelatoriosManager } from '@/components/relatorios/RelatoriosManager';
import { ConfiguracoesManager } from '@/components/configuracoes/ConfiguracoesManager';
import { MinhaContaManager } from './MinhaContaManager';
import { DashboardHome } from './DashboardHome';
// import { CadastroManager } from './CadastroManager';

interface DashboardProps {
  userLevel: string;
  onLogout: () => void;
  userEmail?: string;
  userName?: string;
}

export const Dashboard = ({ userLevel, onLogout, userEmail, userName }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Debug: verificar o userLevel


  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <DashboardHome userLevel={userLevel} userEmail={userEmail} />;
      case 'empresas':
        return <EmpresasManager />;
      case 'solicitantes':
        return <SolicitantesManager />;
      case 'motoristas':
        return <MotoristaManager />;
      // case 'cadastro':
      //   return <CadastroManager />;
      case 'meus-documentos':
        return <MeusDocumentos motoristaEmail={userEmail || ''} />;
      case 'corridas':
        return <CorridasManager userLevel={userLevel} userEmail={userEmail} />;
      case 'financeiro':
        return <FinanceiroManager />;
      case 'voucher':
        return <VoucherManager />;
      case 'alertas':
        return userLevel === 'Motorista' 
          ? <NotificacoesMotorista motoristaEmail={userEmail || ''} />
          : <AlertasManager />;
      case 'relatorios':
        return <RelatoriosManager />;
      case 'configuracoes':
        return <ConfiguracoesManager />;
      case 'minha-conta':
        return <MinhaContaManager />;
      default:
        return <DashboardHome userLevel={userLevel} userEmail={userEmail} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar 
        userLevel={userLevel}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          userLevel={userLevel}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userEmail={userEmail}
          userName={userName}
        />
        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
