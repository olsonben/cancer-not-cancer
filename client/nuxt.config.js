export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  publicRuntimeConfig: {
    url: {
      base: process.env.DOMAIN,
      api: `${process.env.PROTOCOL}://${process.env.SUB_DOMAIN_API}${process.env.DOMAIN}`,
      client: `${process.env.PROTOCOL}://${process.env.SUB_DOMAIN_CLIENT}${process.env.DOMAIN}`
    }
  },
  privateRuntimeConfig: {},

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'client',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      // Small logo for the tab
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }
    ]
  },

  watchers: {
    webpack: {
      // Don't watch node_modules (idk why this isn't default)
      ignored: /node_modules/
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~assets/css/main.css'
  ],

  // Automatically restart the whole server when main.css changes
  watch: [
    '~assets/css/main.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  // Under `/components`
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/style-resources'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],

  // Globally accessible style resources
  // e.g. variables declared in scss files here are globally available
  styleResources: {
    scss: [
      './assets/scss/colors.scss',
      './assets/scss/variables.scss'
    ]
  },

  // Customization for vue-router: https://nuxtjs.org/docs/configuration-glossary/configuration-router
  router: {
    // Middleware runs on every page
    // TODO: can we use this to pre-authenticate users?
    middleware: [
      'isLoggedIn'
    ]
  },
  
  // Server side rendering :: removes the server
  // Must be false for axios requests in middleware
  ssr: false,

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}