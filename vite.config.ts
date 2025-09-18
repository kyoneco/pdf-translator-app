import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const base = process.env.BASE_URL ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'pdfjs-dist/worker': 'pdfjs-dist/build/pdf.worker.mjs'
    }
  },
  worker: {
    format: 'es'
  },
  define: {
    __BASE_URL__: JSON.stringify(base)
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
});
