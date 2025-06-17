import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
    },
  },
  optimizeDeps: {
    include: ['shared-types'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core dependencies
          vendor: ['react', 'react-dom'],
          // Router
          router: ['react-router-dom'],
          // UI library dependencies
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'lucide-react',
          ],
          // Utilities
          utils: ['axios', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          // Animation library (large dependency)
          animations: ['framer-motion'],
        },
      },
    },
    // Increase chunk size warning limit to 1MB to reduce noise
    chunkSizeWarningLimit: 1000,
  },
});
