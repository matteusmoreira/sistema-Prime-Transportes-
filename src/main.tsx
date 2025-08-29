import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Silenciador de logs:
// - Produção: oculta log/debug/trace
// - Desenvolvimento: oculta log/debug/trace por padrão, a não ser que VITE_VERBOSE_LOGS === 'true'
const noop = () => {};
if (import.meta.env.PROD) {
  console.log = noop;
  console.debug = noop;
  console.trace = noop;
} else if (import.meta.env.DEV && import.meta.env.VITE_VERBOSE_LOGS !== 'true') {
  console.log = noop;
  console.debug = noop;
  console.trace = noop;
}

createRoot(document.getElementById("root")!).render(<App />);
