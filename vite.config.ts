import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ged2excalidraw/',
  root: 'web',
  build: {
    outDir: '../dist-web',
  },
  server: {
    port: 3000,
  },
});
