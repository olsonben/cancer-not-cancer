// import { defineNuxtConfig } from "nuxt3"
import { defineNuxtConfig } from "nuxt/config"

const base = new URL(process.env.PUBLIC_PATH).pathname
// const api = process.env.API_URL.replace(/\/+$/, '')

export default defineNuxtConfig({
  // Note: You can no longer change the global context __NUXT__ as in Nuxt2.
  // Some work arounds can be found here: https://github.com/nuxt/nuxt/issues/18870
  app: {
    rootId: 'pathapp',
    baseURL: base,
    buildAssetsDir: 'cncclient/',
  },

  runtimeConfig: {
    // private config here
    
    // public config here (could live in 'app:')
    public: {
      uploadSizeLimit: process.env.UPLOAD_SIZE_LIMIT,
      apiUrl: process.env.API_URL,
    }
  },

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
  css: ["@/assets/scss/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/scss/variables.scss"; @import "@/assets/scss/colors.scss";',
        }
      }
    }
  },
  // Plugins to run before rendering page: https://nuxt.com/docs/guide/directory-structure/plugins
  // TODO: Update readme about uBlockOrigin breaking the site because of matomo (also test further).
  plugins: [
    '~/plugins/error-handler.js',
    { src: '~/plugins/matomo.js', ssr: false },
    '~/plugins/draggable.js'
  ],

  // Auto import components: https://nuxt.com/docs/guide/directory-structure/components#component-names
  // Under `/components`
  // components: true,
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  // Modules: https://nuxt.com/docs/guide/concepts/modules
  modules: [
    '@pinia/nuxt',
  ],

  // // Customization for vue-router: https://nuxtjs.org/docs/configuration-glossary/configuration-router
  // router: {
    // Middleware runs on every page
    // middleware: [
    //   'auth',
    //   'authError'
    // ]
  // },
  
  // Server side rendering :: removes the server
  // Must be false for axios requests in middleware
  ssr: false,

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // publicPath: '/cncclient/',
    // devtools: false,
    // analyze: {
    //   analyzerMode: 'static'
    // },
    html: {
      minify: {
        minifyJS: false
      }
    }
  },
  sourcemap: true,
  devtools: { enabled: true }

})