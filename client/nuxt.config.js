const base = new URL(process.env.PUBLIC_PATH).pathname
// const api = process.env.API_URL.replace(/\/+$/, '')

export default {
  globalName: 'pathapp',
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  telemetry: false,

  publicRuntimeConfig: {
    uploadSizeLimit: process.env.UPLOAD_SIZE_LIMIT,
    // url: {
    //   api: process.env.API_URL,
    // }
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
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'msapplication-TileColor', content: '#5d6770' },
      { name: 'theme-color', content: '#5d6770' }
    ],
    link: [
      // Favicon
      { rel: 'icon', type: 'image/svg+xml', href: base + 'logo.svg' },
      { rel: 'mask-icon', href: base + 'safari-pinned-tab.svg', color: '#9f262c' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: base + 'apple-touch-icon.png' },
      { rel:'icon', type:'image/png', sizes:'32x32', href: base + 'favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: base + 'favicon-16x16.png' },
      { rel: 'manifest', href: base + 'site.webmanifest' }
    ],
    noscript: [{
      innerHTML: "\<img src=\"https://client.milmed.ai/b/js/?idsite=1&amp;rec=1\" style=\"border: 0\" alt=\"\" />"
      // < img referrerpolicy="no-referrer-when-downgrade" src="https://client.milmed.ai/b/?idsite=1&amp;rec=1" style="border:0" alt="" />
    }],
    __dangerouslyDisableSanitizers: ['noscript'] //stop sanitizing img above
    // { src: '/customscript.js' } // customscript.js located in "static/" directory
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
    '~/plugins/common.js',
    '~/plugins/draggable.js'
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
    ['nuxt-matomo', { matomoUrl: 'https://client.milmed.ai/b/', siteId: 1, trackerUrl: 'https://client.milmed.ai/b/js/', scriptUrl: 'https://client.milmed.ai/b/js/',cookies: false}],
  ],
  axios: {
    baseURL: process.env.API_URL,
    credentials: true,
    https: (process.env.PROTOCOL == 'https'),
    debug: false,
  },

  // Globally accessible style resources
  // e.g. variables declared in scss files here are globally available
  styleResources: {
    scss: [
      './assets/scss/colors.scss',
      './assets/scss/variables.scss'
    ]
  },

  // // Customization for vue-router: https://nuxtjs.org/docs/configuration-glossary/configuration-router
  router: {
    base: base,
    // Middleware runs on every page
    middleware: [
      'auth',
      'authError'
    ]
  },
  
  // Server side rendering :: removes the server
  // Must be false for axios requests in middleware
  ssr: false,

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    publicPath: '/cncclient/',
    devtools: false,
  }
}