// INSTRUÇÕES PARA TESTAR O SISTEMA DE USUÁRIOS ONLINE
// 1. Abra o navegador na página http://localhost:8080/auth
// 2. Abra o console do navegador (F12 > Console)
// 3. Cole e execute este código:

// Preencher formulário de login automaticamente
function autoLogin() {
  console.log('Iniciando login automático...');
  
  // Aguardar a página carregar
  setTimeout(() => {
    // Preencher email
    const emailInput = document.querySelector('#login-email');
    if (emailInput) {
      emailInput.value = 'admin@prime.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Email preenchido: admin@prime.com');
    } else {
      console.error('Campo de email não encontrado');
    }
    
    // Preencher senha
    const passwordInput = document.querySelector('#login-password');
    if (passwordInput) {
      passwordInput.value = '123456';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Senha preenchida');
    } else {
      console.error('Campo de senha não encontrado');
    }
    
    // Clicar no botão de login
    setTimeout(() => {
      const loginButton = document.querySelector('button[type="submit"]');
      if (loginButton && !loginButton.disabled) {
        loginButton.click();
        console.log('Botão de login clicado');
      } else {
        console.error('Botão de login não encontrado ou desabilitado');
      }
    }, 500);
  }, 1000);
}

// Executar login automático
autoLogin();

// CREDENCIAIS DE TESTE:
// Email: admin@prime.com
// Senha: 123456

// Após o login, você será redirecionado para o dashboard
// O OnlineUsersCard deve aparecer apenas para administradores