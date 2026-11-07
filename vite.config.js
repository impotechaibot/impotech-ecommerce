import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — dev server + production build for the Impotech store front-end.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
