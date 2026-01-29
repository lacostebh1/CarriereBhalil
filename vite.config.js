import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        clientLogin: 'src/pages/client/login.html',
        clientDashboard: 'src/pages/client/dashboard.html',
        adminLogin: 'src/pages/admin/login.html',
        adminDashboard: 'src/pages/admin/dashboard.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
