
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CorridasProvider } from "@/contexts/CorridasContext";
import { AlertasProvider } from "@/contexts/AlertasContext";
import { EmpresasProvider } from "@/contexts/EmpresasContext";
import { NotificacoesProvider } from "@/contexts/NotificacoesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnlineUsersProvider } from "@/contexts/OnlineUsersContext";
import { LogsProvider } from "@/contexts/LogsContext";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { LogsPage } from "./pages/LogsPage";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PresenceTracker } from "@/components/realtime/PresenceTracker";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const AppContent = () => {
  useNotificationListener();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/logs" element={<LogsPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LogsProvider>
            <OnlineUsersProvider>
              <EmpresasProvider>
              <CorridasProvider>
                <AlertasProvider>
                  <NotificacoesProvider>
                    <ErrorBoundary>
                      <Toaster />
                      <Sonner />
                      <PresenceTracker />
                      <AppContent />
                    </ErrorBoundary>
                  </NotificacoesProvider>
                </AlertasProvider>
              </CorridasProvider>
              </EmpresasProvider>
            </OnlineUsersProvider>
          </LogsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
