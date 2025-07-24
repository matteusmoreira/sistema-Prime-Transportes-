
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
import { DashboardHome } from './DashboardHome';

interface DashboardProps {
  userLevel: string;
  onLogout: () => void;
  userEmail?: string;
}

export const Dashboard = ({ userLevel, onLogout, userEmail }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      default:
        return <DashboardHome userLevel={userLevel} userEmail={userEmail} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
