import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserInfo {
  email?: string;
  role?: string;
  isAuthenticated: boolean;
}

export const UserDebugInfo = ({ show = false }: { show?: boolean }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({ isAuthenticated: false });

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          setUserInfo({
            email: user.email,
            role: profile?.role,
            isAuthenticated: true
          });
        } else {
          setUserInfo({ isAuthenticated: false });
        }
      } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        setUserInfo({ isAuthenticated: false });
      }
    };

    getUserInfo();
  }, []);

  if (!show) return null;

  return (
    <Card className="mb-4 border-2 border-yellow-400 bg-yellow-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-800">🐛 Debug - Informações do Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Email: </span>
            <span className="text-gray-700">{userInfo.email || 'Não logado'}</span>
          </div>
          <div>
            <span className="font-medium">Role: </span>
            <Badge 
              variant={
                userInfo.role === 'Administrador' ? 'default' :
                userInfo.role === 'Administração' ? 'secondary' :
                userInfo.role === 'Financeiro' ? 'outline' :
                userInfo.role === 'Motorista' ? 'destructive' :
                'destructive'
              }
            >
              {userInfo.role || 'Sem role'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Pode editar corridas: </span>
            <Badge variant={
              ['Administrador', 'Administração', 'Financeiro'].includes(userInfo.role || '') 
                ? 'default' : 'destructive'
            }>
              {['Administrador', 'Administração', 'Financeiro'].includes(userInfo.role || '') ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Status Auth: </span>
            <Badge variant={userInfo.isAuthenticated ? 'default' : 'destructive'}>
              {userInfo.isAuthenticated ? 'Logado' : 'Não logado'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};