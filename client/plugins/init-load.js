// Hook for on app load style events (called once!)

import { useUserStore } from "~/store/user"

export default defineNuxtPlugin((nuxtApp) => {
    const userStore = useUserStore()

    // Called when initial vueApp instance is created.
    nuxtApp.hook('app:created', async () => {
        // check if the user is logged in
        await userStore.login()
    })
    
    // Called when Vue app is initialized and mounted in browser.
    // nuxtApp.hook('app:mounted', async () => {
    // })
})