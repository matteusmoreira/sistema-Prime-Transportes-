
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormProps {
  onLogin: (userLevel: string, email?: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de login - em produção conectaria com backend
    setTimeout(() => {
      if (email && password) {
        // Simulação de níveis de usuário baseado no email
        let userLevel = 'Motorista';
        if (email.includes('admin')) userLevel = 'Administrador';
        else if (email.includes('adm')) userLevel = 'Administração';
        else if (email.includes('financeiro')) userLevel = 'Financeiro';
        
        onLogin(userLevel, email);
        toast.success(`Login realizado como ${userLevel}`);
      } else {
        toast.error('Email e senha são obrigatórios');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Prime Transportes</CardTitle>
          <CardDescription>
            Sistema de Gestão de Transportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            <p className="text-center font-medium mb-2">Usuários de teste:</p>
            <div className="space-y-1 text-xs">
              <p>• admin@prime.com (Administrador)</p>
              <p>• adm@prime.com (Administração)</p>
              <p>• financeiro@prime.com (Financeiro)</p>
              <p>• motorista@prime.com (Motorista)</p>
              <p className="text-center mt-2 font-medium">Senha: qualquer senha</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
