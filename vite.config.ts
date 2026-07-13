import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ged2excalidraw/',
  server: {
    port: 3000,
  },
});
