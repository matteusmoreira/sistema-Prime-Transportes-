import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AuthDebug = () => {
  const { user, profile, loading, session } = useAuth();
  

  
  return (
    <Card className="mb-4 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Debug - Estado de Autenticação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</div>
          <div><strong>User Email:</strong> {user?.email || 'Não logado'}</div>
          <div><strong>Profile:</strong> {profile ? JSON.stringify(profile) : 'Nenhum'}</div>
          <div><strong>Session:</strong> {session ? 'Ativa' : 'Inativa'}</div>
        </div>
      </CardContent>
    </Card>
  );
};