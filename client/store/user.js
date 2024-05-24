import { defineStore } from "pinia"

// Using a private pinia store for state, helps prevent unwanted state mutation.
// https://masteringpinia.com/blog/how-to-create-private-state-in-stores
const usePrivateUserStore = defineStore('user-private', () => {
    // STATE (private)
    // =======
    const loggedIn = ref(false)
    const admin = ref(false)
    const uploader = ref(false)
    const pathologist = ref(false)
    const enabled = ref(false)
    const initLogin = ref(false)

    return {
        loggedIn,
        admin,
        uploader,
        pathologist,
        enabled,
        initLogin
    }
})

// https://pinia.vuejs.org/core-concepts/#Setup-Stores
export const useUserStore = defineStore('user', () => {
    const config = useRuntimeConfig()

    // STATE
    // =======
    const privateState = usePrivateUserStore()
    
    // GETTERS
    // =======
    const isLoggedIn = computed(() => privateState.loggedIn)
    const isAdmin = computed(() => privateState.admin && privateState.enabled)
    const isUploader = computed(() => privateState.uploader && privateState.enabled)
    const isPathologist = computed(() => privateState.pathologist && privateState.enabled)
    const isLoaded = computed(() => privateState.initLogin)

    // ACTIONS
    // =======
    // Check with the api if the user is logged in and update permissions accordingly.
    async function login() {
        try {
            let allHeaders = {}
            if (process.server) {
                const cookie = useCookie('sessionId').value
                if (cookie) {
                    allHeaders.cookie = `sessionId=${encodeURIComponent(cookie)}`
                }
            }

            const response = await $fetch('/isLoggedIn', {
                baseURL: config.public.apiUrl,
                credentials: 'include',
                headers: allHeaders,
            })

            // response will be false if not logged in
            if (response) {
                const user = response

                privateState.loggedIn = true
                privateState.admin = user.permissions.admin
                privateState.uploader = user.permissions.uploader
                privateState.pathologist = user.permissions.pathologist
                privateState.enabled = user.permissions.enabled
            } else {
                // Not logged in
                resetUser()
            }

            privateState.initLogin = true
        } catch (error) {
            console.log('Error with user login')
            console.log(error)
        }
    }

    // Register a logout
    async function logout() {
        try {
            await $fetch('/auth/logout', {
                method: 'POST',
                baseURL: config.public.apiUrl,
                credentials: 'include'
            })

            resetUser()
        } catch (error) {
            console.log('Error with user logout')
            console.error(error)
        }
    }

    // HELPER
    function resetUser() {
        privateState.loggedIn = false
        privateState.admin = false
        privateState.uploader = false
        privateState.pathologist = false
        privateState.enabled = false
    }

    return {
        isLoaded,
        isLoggedIn,
        isAdmin,
        isUploader, 
        isPathologist, 
        login, 
        logout
    }
})

