import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 100 << 16,
        firefox: 95 << 16,
        safari: 15 << 16,
      },
      drafts: {
        nesting: true,
        customMedia: true,
      },
      nonStandard: {
        deepSelectorCombinator: true,
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['tailwindcss'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3001,
  },
})