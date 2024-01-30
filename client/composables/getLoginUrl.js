// Generates a relative login url for redirect after login
export const getLoginUrl = (overridePath = null) => {
    const route = useRoute()
    const config = useRuntimeConfig()
    const apiUrlNoSlash = config.public.apiUrl.replace(/\/+$/, '')

    const ref_path = overridePath ? overridePath : route.fullPath 

    const isLogoutOrLogin = route.name == 'logout' || route.name == 'login'
    const loginParams = new URLSearchParams({
        'ref_path': !isLogoutOrLogin ? ref_path : '/'
    })
    const loginURL = new URL(`${apiUrlNoSlash}/auth/google?${loginParams}`)
    return loginURL.href
}