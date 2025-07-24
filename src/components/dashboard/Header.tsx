
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { NotificationIcon } from '@/components/notifications/NotificationIcon';

interface HeaderProps {
  userLevel: string;
  onLogout: () => void;
  onToggleSidebar: () => void;
  userEmail?: string;
}

export const Header = ({ userLevel, onLogout, onToggleSidebar, userEmail }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema Prime Transportes
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Bem-vindo, <span className="font-semibold">{userLevel}</span>
            {userEmail && <div className="text-xs text-gray-500">{userEmail}</div>}
          </div>
          
          {/* Ícone de notificações - visível apenas para Administradores e Financeiro */}
          {(userLevel === 'Administrador' || userLevel === 'Financeiro') && (
            <NotificationIcon userEmail={userEmail} />
          )}
          
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
