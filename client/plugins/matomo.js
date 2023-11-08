import VuewMatomo from 'vue-matomo'
import { defineNuxtPlugin } from 'nuxt/app'

// ['nuxt-matomo', { matomoUrl: 'https://client.milmed.ai/b/', siteId: 1, trackerUrl: 'https://client.milmed.ai/b/js/', scriptUrl: 'https://client.milmed.ai/b/js/', cookies: false }],

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VuewMatomo, {
        host: 'https://client.milmed.ai/b/',
        siteId: 1,
        trackerUrl: 'https://client.milmed.ai/b/js/',
        trackerScriptUrl: 'https://client.milmed.ai/b/js/',

        // Enables automatically registering pageviews on the router
        router: nuxtApp.$router,
        enableLinkTracking: false,
        disableCookies: true,

        // Other defaults
        // requireConsent: false,
        // trackInitialView: true,
        // requireCookieConsent: false,
    })
})