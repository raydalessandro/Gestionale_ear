import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Permette accesso da qualsiasi indirizzo IP (rete locale)
    strictPort: true,
    // Forza IPv4 invece di IPv6
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
})
