import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://teamtaskmanagerethara-fnhmeedjd7dfd0h4.westindia-01.azurewebsites.net/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
