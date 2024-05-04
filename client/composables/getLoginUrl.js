// Paths to exclude from redirect on logins
const toExclude = ['logout', 'login']
const regExclude = new RegExp(toExclude.join('|'))

// Generates a relative login url for redirect after login
export const getLoginUrl = (overridePath = null) => {
    const { fullPath } = useRoute()
    const config = useRuntimeConfig()
    const apiUrlNoSlash = config.public.apiUrl.replace(/\/+$/, '')

    let ref_path = '/'
    if (overridePath && !regExclude.test(overridePath)) {
        ref_path = overridePath
    } else if (!regExclude.test(fullPath)) {
        ref_path = fullPath
    }

    const loginParams = new URLSearchParams({
        'ref_path': ref_path
    })

    const loginURL = new URL(`${apiUrlNoSlash}/auth/google?${loginParams}`)
    return loginURL.href
}