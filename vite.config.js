import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Output to dist/ folder
    outDir: 'dist',

    // Don't minify for easier debugging (optional, you can remove this)
    minify: false,

    rollupOptions: {
      input: {
        // Popup UI
        popup: resolve(__dirname, 'ui/index.html'),

        // Background service worker
        background: resolve(__dirname, 'background.js'),

        // Content script
        content: resolve(__dirname, 'content/index.js'),
      },

      output: {
        entryFileNames: (chunkInfo) => {
          // Keep background.js and content.js at root of dist/
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return '[name].js';
          }
          // Other assets go in assets/
          return 'assets/[name]-[hash].js';
        },

        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Resolve paths
  resolve: {
    alias: {
      '@': resolve(__dirname, 'ui/src'),
    },
  },
});
