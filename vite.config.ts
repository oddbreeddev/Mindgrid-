import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Explicitly define the API_KEY for the client side. 
    // Vite will replace 'process.env.API_KEY' with the actual value during build.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Global shim for libraries expecting 'global'
    'global': 'window',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  }
});