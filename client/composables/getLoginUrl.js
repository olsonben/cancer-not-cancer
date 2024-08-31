// Paths to exclude from redirect on logins
const toExclude = ['logout', 'login']
const regExclude = new RegExp(toExclude.join('|'))

// Generates a relative login url for redirect after login
export const getLoginUrl = (overridePath = null) => {
    let ref_path = '/'
    if (overridePath && !regExclude.test(overridePath)) {
        ref_path = overridePath
    } else {
        // calling useRoute here prevents it from calling in route middleware
        const { fullPath } = useRoute()    
        if (!regExclude.test(fullPath)) {
            ref_path = fullPath
        }
    }

    const config = useRuntimeConfig()
    const apiUrlNoSlash = config.public.apiUrl.replace(/\/+$/, '')

    const loginParams = new URLSearchParams({
        'ref_path': ref_path
    })

    const loginURL = new URL(`${apiUrlNoSlash}/auth/google?${loginParams}`)
    return loginURL.href
}