import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { Users } from 'lucide-react';

interface Props {
  onlyAdmins?: boolean;
}

export const OnlineUsersCard = ({ onlyAdmins = false }: Props) => {
  const { users, isConnected } = useOnlineUsers({ trackSelf: false });

  const filtered = users.filter(u => {
    if (!onlyAdmins) return true;
    return (u.role === 'Administrador' || u.role === 'Administração');
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" /> Usuários Online
        </CardTitle>
        <Badge variant={isConnected ? 'default' : 'secondary'} className={isConnected ? 'bg-green-100 text-green-700 border border-green-300' : ''}>
          {isConnected ? 'Tempo real' : 'Reconectando...'}
        </Badge>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum usuário online.</div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(u => (
              <li key={u.id} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" aria-label="online" />
                <span className="text-sm text-gray-800">{u.email || 'Sem email'}</span>
                {u.role && (
                  <span className="ml-auto text-xs text-muted-foreground">{u.role}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}