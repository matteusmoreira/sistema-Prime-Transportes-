import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { EnhancedMotoristaSignup } from '@/components/auth/EnhancedMotoristaSignup';

type UserRole = Database['public']['Enums']['user_role'];

export const Auth = () => {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showEnhancedSignup, setShowEnhancedSignup] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupNome, setSignupNome] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('Motorista');
  
  // Reset password form
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast.error(`Erro no login: ${error.message}`);
    } else {
      toast.success('Login realizado com sucesso!');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupNome, signupRole);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Usuário já cadastrado. Tente fazer login.');
      } else {
        toast.error(`Erro no cadastro: ${error.message}`);
      }
    } else {
      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      setActiveTab('signin');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(resetEmail);

    if (error) {
      toast.error(`Erro ao enviar email: ${error.message}`);
    } else {
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className={`w-full ${showEnhancedSignup ? 'max-w-4xl' : 'max-w-md'}`}>
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Motorista</TabsTrigger>
              <TabsTrigger value="reset">Recuperar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Senha
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
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
            </TabsContent>
            
            <TabsContent value="signup">
              {!showEnhancedSignup ? (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Cadastro de Motorista</h3>
                    <p className="text-gray-600">
                      Complete o cadastro com seus documentos e informações do veículo
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => setShowEnhancedSignup(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Truck className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">Iniciar Cadastro</div>
                          <div className="text-sm text-blue-100">
                            Cadastro completo como motorista
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Você precisará dos seguintes documentos:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>CNH (Carteira de Motorista)</li>
                          <li>CPF e RG</li>
                          <li>Comprovante de endereço</li>
                          <li>Fotos do veículo</li>
                          <li>Documentos do veículo (CRLV)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EnhancedMotoristaSignup
                  onSuccess={() => {
                    setShowEnhancedSignup(false);
                    setActiveTab('signin');
                  }}
                  onBack={() => setShowEnhancedSignup(false)}
                />
              )}
            </TabsContent>
            
            
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;