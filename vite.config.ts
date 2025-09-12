import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: undefined // usamos o manifest nativo em public/manifest.webmanifest
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Remover logs de debug no build de produção, mantendo console.error/warn
  esbuild: mode === 'production' ? {
    pure: [
      'console.log',
      'console.debug',
      'console.trace'
    ],
    drop: ['debugger']
  } : undefined,
  define: {
    'import.meta.env.VITE_VERBOSE_LOGS': JSON.stringify(process.env.VITE_VERBOSE_LOGS || 'false')
  }
}));
