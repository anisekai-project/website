// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: {enabled: true},

  ssr: false,

  app: {
    head: {
      title: 'Anisekai',
      script: [
        {src: '/lib/shaka/shaka-player.compiled.js'},
        {src: '/lib/subtitles-octopus/subtitles-octopus.js'}
      ]
    }
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/icon',
    '@nuxtjs/google-fonts',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiUrl: '',
      loginUrl: ''
    }
  },

  vite: {
    server: {
      proxy: {
        '/api/v3': {
          target: 'http://192.168.1.20:8080',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/v3/, '/api/v3')
        }
      }
    }
  },

  css: [
    '@/assets/styles/theme.scss'
  ],

  googleFonts: {
    families: {
      'Nokora': true,
      'Azeret Mono': true
    }
  },

  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Anisekai',
      short_name: 'Anisekai',
      theme_color: '#E93363',
      lang: 'fr',
      display: 'standalone',
      icons: [
        {src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png'},
        {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png'},
        {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png'},
        {src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}
      ],
    },
    workbox: {
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },
    devOptions: {
      enabled: false,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/]
    },
    registerWebManifestInRouteRules: true,
    client: {
      periodicSyncForUpdates: 3600,
      installPrompt: true,
    },
  },
})
