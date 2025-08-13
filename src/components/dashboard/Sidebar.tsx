import { cn } from '@/lib/utils';
import { 
  Home, 
  Building2, 
  Users, 
  Car, 
  Route, 
  Calculator, 
  FileText,
  ChevronLeft,
  Truck,
  Bell,
  Receipt,
  Settings
} from 'lucide-react';

interface SidebarProps {
  userLevel: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ 
  userLevel, 
  activeSection, 
  onSectionChange, 
  isOpen, 
  onToggle 
}: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home, roles: ['Administrador', 'Administração', 'Financeiro', 'Motorista'] },
    { id: 'empresas', label: 'Empresas', icon: Building2, roles: ['Administrador', 'Administração'] },
    { id: 'solicitantes', label: 'Solicitantes', icon: Users, roles: ['Administrador', 'Administração'] },
    { id: 'motoristas', label: 'Motoristas', icon: Car, roles: ['Administrador', 'Administração'] },
    { id: 'cadastro', label: 'Cadastro', icon: Users, roles: ['Administrador'] },
    { id: 'corridas', label: 'Corridas', icon: Route, roles: ['Administrador', 'Administração', 'Motorista'] },
    { id: 'financeiro', label: 'Financeiro', icon: Calculator, roles: ['Administrador', 'Financeiro'] },
    { id: 'voucher', label: 'Voucher', icon: Receipt, roles: ['Administrador', 'Financeiro'] },
    { id: 'alertas', label: 'Alertas', icon: Bell, roles: ['Administrador', 'Administração', 'Motorista'] },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, roles: ['Administrador', 'Administração', 'Financeiro'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['Administrador'] },
    { id: 'minha-conta', label: 'Minha Conta', icon: Users, roles: ['Motorista'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userLevel));

  return (
    <div className={cn(
      "bg-sidebar-background shadow-lg transition-all duration-300 flex flex-col border-r border-sidebar-border",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <div className="bg-sidebar-primary p-2 rounded-lg">
                <Truck className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-sidebar-foreground">Prime Transportes</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 text-sidebar-foreground transition-transform",
              !isOpen && "rotate-180"
            )} />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center p-3 rounded-lg transition-colors text-left",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Level Indicator */}
      {isOpen && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-sm text-sidebar-foreground">
            <span className="font-medium">Nível de acesso:</span>
            <br />
            <span className="text-sidebar-primary font-semibold">{userLevel}</span>
          </div>
        </div>
      )}
    </div>
  );
};
