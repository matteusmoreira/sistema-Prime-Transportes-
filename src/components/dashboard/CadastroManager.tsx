import { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type UserRole = Database['public']['Enums']['user_role'];

export const CadastroManager = () => {
  // const { signUp } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupNome, setSignupNome] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('Administração');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar usuário via função edge com email_confirm: true (sem confirmação por e-mail)
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: signupEmail,
          password: signupPassword,
          nome: signupNome,
          role: signupRole,
        },
      });

      if (error) {
        toast.error(error.message || 'Erro ao criar usuário.');
      } else if (!data?.success) {
        toast.error(data?.error || 'Não foi possível criar o usuário.');
      } else {
        toast.success('Usuário criado com sucesso! O acesso foi liberado imediatamente.');
        // Limpar formulário
        setSignupEmail('');
        setSignupPassword('');
        setSignupNome('');
        setSignupRole('Administração');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erro inesperado ao criar usuário.');
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cadastro de Usuários</h1>
        <p className="text-gray-600 mt-1">
          Crie novos usuários para o sistema
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Usuário
          </CardTitle>
          <CardDescription>
            Cadastre um novo usuário no sistema. O acesso é liberado imediatamente (sem confirmação por e-mail).
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-nome" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              <Input
                id="signup-nome"
                type="text"
                placeholder="Nome completo do usuário"
                value={signupNome}
                onChange={(e) => setSignupNome(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="email@empresa.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-role">Tipo de Usuário</Label>
              <Select value={signupRole} onValueChange={(value: UserRole) => setSignupRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administração">Administração</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};