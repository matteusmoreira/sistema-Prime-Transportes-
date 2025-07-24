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
  Receipt
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
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userLevel));

  return (
    <div className={cn(
      "bg-white shadow-lg transition-all duration-300 flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-gray-900">Prime Transportes</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 text-gray-500 transition-transform",
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
                      ? "bg-blue-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
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
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Nível de acesso:</span>
            <br />
            <span className="text-blue-600 font-semibold">{userLevel}</span>
          </div>
        </div>
      )}
    </div>
  );
};
