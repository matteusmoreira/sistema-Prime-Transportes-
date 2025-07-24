
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from '@/components/dashboard/Dashboard';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLevel, setUserLevel] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  const handleLogin = (level: string, email?: string) => {
    setIsAuthenticated(true);
    setUserLevel(level);
    setUserEmail(email || '');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserLevel('');
    setUserEmail('');
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard userLevel={userLevel} onLogout={handleLogout} userEmail={userEmail} />;
};

export default Index;
