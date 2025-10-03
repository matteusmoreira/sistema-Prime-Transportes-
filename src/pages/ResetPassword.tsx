import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>("loading");
  const [message, setMessage] = useState<string>('Validando link de recuperação...');

  useEffect(() => {
    // Tokens podem vir em query (?access_token=) ou no hash (#access_token=)
    const hash = window.location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);

    const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (error) {
            console.error('Erro ao setar sessão de recuperação:', error);
            setMessage('Link inválido ou expirado. Solicite uma nova recuperação.');
            setStatus('error');
          } else {
            console.log('Sessão de recuperação criada:', data?.session?.user?.email);
            setMessage('Link validado. Defina sua nova senha abaixo.');
            setStatus('ready');
          }
        });
    } else {
      // Fallback: aguarda curto período para deep link do Supabase processar
      const timer = setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setMessage('Link validado. Defina sua nova senha abaixo.');
          setStatus('ready');
        } else {
          setMessage('Link inválido ou expirado. Solicite uma nova recuperação.');
          setStatus('error');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {message}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Recuperação de senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ChangePasswordForm />
    </div>
  );
};

export default ResetPassword;