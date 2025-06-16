import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
        registerType: 'autoUpdate',
        manifest: {
        name: 'eLLM',
        short_name: 'eLLM',
        description: 'eLLM',
        theme_color: '#ffffff',
        icons: [
            {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
            },
            {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
            }
        ],
        display: 'fullscreen', // or 'standalone' for minimal browser UI
        orientation: 'portrait'
        }
    })
    ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @use "@styles/_variables.scss" as *;
        `,
        includePaths: [path.resolve(__dirname, './src/styles')]
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    https: {
      key: fs.readFileSync(path.join(__dirname, 'certificates/dev.local-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certificates/dev.local.pem'))
    }
  }
})
