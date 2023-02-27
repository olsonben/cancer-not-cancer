export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  telemetry: false,

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
    title: 'Cancer Not Cancer',
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
    '@nuxtjs/axios',
  ],
  axios: {
    baseURL: `${process.env.PROTOCOL}://${process.env.SUB_DOMAIN_API}${process.env.DOMAIN}/`, // api URL
    credentials: true,
  },

  // Globally accessible style resources
  // e.g. variables declared in scss files here are globally available
  styleResources: {
    scss: [
      './assets/scss/colors.scss',
      './assets/scss/variables.scss'
    ]
  },

  // TODO: can we use this to pre-authenticate users?
  // Note: Why would we want to pre-authenticate users? Seems like it could be a security risk.
  // // Customization for vue-router: https://nuxtjs.org/docs/configuration-glossary/configuration-router
  // router: {
  //   // Middleware runs on every page
  //   middleware: [
  //     'isLoggedIn'
  //   ]
  // },
  
  // Server side rendering :: removes the server
  // Must be false for axios requests in middleware
  ssr: false,

  // Define the workspace of Nuxt
  // https://nuxtjs.org/docs/configuration-glossary/configuration-rootdir
  // rootDir: './testing/',
  // srcDir: '/home/colin/cw-stage/cancer-not-cancer/client',

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    publicPath: 'https://client.milmed.ai/testing/'
  }
}