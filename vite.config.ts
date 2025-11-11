import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false, // Prevent clearing screen on restart
  logLevel: 'info', // Reduce log verbosity
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src$1'),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5173,
    strictPort: true, // Prevent port changes
    hmr: {
      overlay: true,
      clientPort: 5173,
      protocol: 'ws',
      host: 'localhost', // HMR client connects to localhost
    },
    watch: {
      usePolling: false,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.vite/**',
        '**/*.log',
        '**/logs/**',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/starter-vite-js/**',
        '**/vite-js/**',
        '**/jules-scratch/**',
      ],
      // Add a small delay to prevent rapid restarts
      interval: 100,
      binaryInterval: 300,
    },
    fs: {
      // Restrict files that can be served via Vite dev server
      strict: true,
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@mui/material/GridLegacy'],
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/lab', '@emotion/react', '@emotion/styled'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
});
