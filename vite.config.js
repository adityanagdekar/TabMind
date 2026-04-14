import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
      // Custom plugin to copy manifest.json to dist/
      {
        name: 'copy-manifest',
        closeBundle() {
          // Create correct manifest for dist folder
          const manifest = {
            manifest_version: 3,
            name: "TabMind",
            version: "1.0",
            description: "Provides Semantic search over your Chrome history",
            permissions: ["history", "storage", "activeTab", "scripting"],
            background: {
              service_worker: "background.js",
              type: "module"
            },
            action: {
              default_popup: "ui/index.html"
            },
            content_scripts: [{
              matches: ["<all_urls>"],
              js: ["content.js"]
            }]
          };

          const fs = require('fs');
          fs.writeFileSync(
            resolve(__dirname, 'dist/manifest.json'),
            JSON.stringify(manifest, null, 2)
          );
          console.log('Copied manifest.json to dist/');
        }
      }
    ],

    build: {
    // Output to dist/ folder
    outDir: 'dist',

    // Minify to compress and obfuscate code
    minify: true,

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
  };
});
