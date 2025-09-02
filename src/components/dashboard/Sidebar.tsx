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
  Settings,
  Shield
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
    { id: 'corridas', label: 'Corridas', icon: Route, roles: ['Administrador', 'Administração', 'Motorista'] },
    { id: 'financeiro', label: 'Financeiro', icon: Calculator, roles: ['Administrador', 'Financeiro'] },
    { id: 'voucher', label: 'Voucher', icon: Receipt, roles: ['Administrador', 'Financeiro'] },
    { id: 'alertas', label: 'Alertas', icon: Bell, roles: ['Administrador', 'Administração', 'Motorista'] },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, roles: ['Administrador', 'Administração', 'Financeiro'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['Administrador'] },
    { id: 'minha-conta', label: 'Minha Conta', icon: Users, roles: ['Motorista'] },
    { id: 'cadastro', label: 'Cadastro', icon: Users, roles: ['Administrador'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userLevel));
  
  // Removidos logs de debug do sidebar (userLevel e itens filtrados)
  return (
    <div className={cn(
      "bg-sidebar shadow-lg transition-all duration-300 flex flex-col border-r border-sidebar-border z-40 transform",
      "fixed inset-y-0 left-0 lg:static",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      isOpen ? "w-64" : "w-64 lg:w-16"
    )}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-sidebar-primary p-2 rounded-lg">
              <Truck className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            {isOpen && (
              <span className="font-bold text-sidebar-foreground text-sm sm:text-base">Prime Transportes</span>
            )}
          </div>
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
      <nav className="flex-1 p-2 sm:p-4">
        <ul className="space-y-1 sm:space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "flex w-full items-center rounded-md px-2 py-2 sm:px-3 sm:py-2 text-sm sm:text-[0.95rem] transition-colors",
                    isOpen ? "justify-start" : "justify-center",
                    activeSection === item.id
                      ? (!isOpen ? "bg-black text-white" : "bg-sidebar-accent text-sidebar-accent-foreground")
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      isOpen ? "h-5 w-5 sm:h-6 sm:w-6 mr-2" : "h-14 w-14"
                    )}
                    style={!isOpen ? { width: '25px', height: '25px', minWidth: '25px', minHeight: '25px' } : {}}
                  />
                  <span className={cn("truncate", !isOpen && "hidden lg:hidden")}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-2 sm:p-4 border-t border-sidebar-border text-[11px] sm:text-xs text-muted-foreground">
        {isOpen ? (
          <div className="flex items-center gap-1 min-w-0">
            <span className="whitespace-nowrap">Nível de acesso:</span>
            <span className="ml-1 font-medium truncate">{userLevel}</span>
          </div>
        ) : (
          <div className="flex justify-center" title={`Nível de acesso: ${userLevel}`}>
            <Shield 
              className="h-14 w-14" 
              style={{ width: '25px', height: '25px', minWidth: '25px', minHeight: '25px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
