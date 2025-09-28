import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      clientPort: 5000
    },
    allowedHosts: [
      'd86a3f66ab56.ngrok-free.app',
      '61429d11697a.ngrok-free.app',
      '.ngrok-free.app', // Allow any ngrok subdomain
      'localhost'
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})