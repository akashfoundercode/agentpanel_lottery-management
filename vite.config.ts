import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiBaseUrl = env.VITE_API_BASE_URL || '/api/v1';
  const apiOrigin = apiBaseUrl.startsWith('http')
    ? new URL(apiBaseUrl).origin
    : undefined;

  return {
    plugins: [react()],
    server: {
      proxy: apiOrigin ? {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
        },
      } : undefined,
    },
  };
});