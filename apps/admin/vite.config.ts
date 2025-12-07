import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    host: true, // Pozwala na dostęp z zewnątrz kontenera
    allowedHosts: [
      'admin-hacknation.harvide.com',
      'localhost',
      '.localhost',
      '.harvide.com', // Allow all subdomains of harvide.com
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    conditions: ['import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    include: ['better-auth/client', 'better-auth/client/plugins'],
    esbuildOptions: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
  },
  ssr: {
    noExternal: ['better-auth'],
  },
})