
// Utilitário para limpar todos os dados do localStorage
export const clearAllData = () => {
  // Limpar dados específicos do sistema
  localStorage.removeItem('empresas');
  localStorage.removeItem('solicitantes');
  localStorage.removeItem('motoristas');
  localStorage.removeItem('corridas');
  localStorage.removeItem('alertas');
  localStorage.removeItem('alertasLidos');
  
  console.log('Todos os dados do sistema foram limpos do localStorage');
};

// Executar limpeza imediatamente quando este arquivo for carregado
clearAllData();
