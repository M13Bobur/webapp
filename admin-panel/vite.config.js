import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 5174,
      host: true,
      allowedHosts: [
        'localhost',
        '.localhost',
        '.ngrok-free.app',
        '.ngrok.io',
        ...(env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim()) : []),
      ],
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
