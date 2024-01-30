import { defineStore } from "pinia"

export const useUserStore = defineStore('user', () => {
    const api = useApi()

    // STATE (not exported (private))
    // =======
    const loggedIn = ref(false)
    const admin = ref(false)
    const uploader = ref(false)
    const pathologist = ref(false)
    const enabled = ref(false)
    const initLogin = ref(false)

    // GETTERS
    // =======
    const isLoggedIn = computed(() => loggedIn.value)
    const isAdmin = computed(() => admin.value && enabled.value)
    const isUploader = computed(() => uploader.value && enabled.value)
    const isPathologist = computed(() => pathologist.value && enabled.value)
    const isLoaded = computed(() => initLogin.value)

    // ACTIONS
    // =======
    // Check with the api if the user is logged in and update permissions accordingly.
    async function login() {
        try {
            const { response, status } = await api.GET('/isLoggedIn')

            // response.value will be false if not logged in
            if (response.value) {
                console.log('Enabling User')
                const user = response.value

                loggedIn.value = true
                admin.value = user.permissions.admin
                uploader.value = user.permissions.uploader
                pathologist.value = user.permissions.pathologist
                enabled.value = user.permissions.enabled
            } else {
                // Not logged in
                resetUser()
            }

            initLogin.value = true
        } catch (error) {
            console.log('Error with user login')
            console.error(error)
        }
    }

    // Register a logout
    async function logout() {
        try {
            const { response, status } = await api.POST('/auth/logout')

            if (status.value === 'success') {
                resetUser()
            }
        } catch (error) {
            console.log('Error with user logout')
            console.error(error)
        }
    }

    // HELPER
    function resetUser() {
        loggedIn.value = false
        admin.value = false
        uploader.value = false
        pathologist.value = false
        enabled.value = false
    }

    return { isLoaded, isLoggedIn, isAdmin, isUploader, isPathologist, login, logout }
})

