
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, LogIn } from 'lucide-react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-blue-600 p-3 rounded-full inline-block mb-4">
            <Truck className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show welcome page with login button
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full">
                <Truck className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prime Transportes</h1>
            <p className="text-gray-600 mb-6">Sistema de Gestão de Transportes</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated, show dashboard
  return (
    <Dashboard 
      userLevel={profile.role} 
      onLogout={signOut} 
      userEmail={profile.email}
      userName={profile.nome}
    />
  );
};

export default Index;
