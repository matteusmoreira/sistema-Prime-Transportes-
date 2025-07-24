
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificacoes } from '@/contexts/NotificacoesContext';
import { NotificationsList } from './NotificationsList';

interface NotificationIconProps {
  userEmail?: string;
}

export const NotificationIcon = ({ userEmail }: NotificationIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { obterQuantidadeNaoLidas } = useNotificacoes();
  
  const quantidadeNaoLidas = obterQuantidadeNaoLidas(userEmail);
  const temNotificacoes = quantidadeNaoLidas > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative flex items-center space-x-2"
        >
          <Bell className={`h-4 w-4 ${temNotificacoes ? 'text-red-500' : ''}`} />
          {temNotificacoes && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {quantidadeNaoLidas > 9 ? '9+' : quantidadeNaoLidas}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationsList 
          userEmail={userEmail} 
          onClose={() => setIsOpen(false)} 
        />
      </PopoverContent>
    </Popover>
  );
};
