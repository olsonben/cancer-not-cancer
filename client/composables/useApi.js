// NOTE: We use the useFetch method as that would allow a future version of the
// site to work with server side rendering. To use a more straight forward
// request api, the $fetch api would allow that and the responses would not be
// references.
// BUT
// According to nuxt, using $fetch without wrapping it in useAsyncData, will
// result in fetching the data twice.
// https://nuxt.com/docs/api/utils/dollarfetch
export const useApi = () => {
    const config = useRuntimeConfig()

    const handleAuthErrors = async (error) => {
        const statusCode = error.value.statusCode
        if (statusCode === 401 || statusCode === 403) {
            console.log('Unauthorized! Make sure you are logged in. Redirecting to login...')
            navigateTo(getLoginUrl(), { external: true })
        }

        // Still throw the error to reject upstream promises
        throw error.value // error is just a ref
    }

    return {
        async GET(route, query, key = null, headers = null) {
            let allHeaders = headers ? headers : {}

            if (process.server) {
                const cookie = useCookie('sessionId').value
                if (cookie) {
                    allHeaders.cookie = `sessionId=${encodeURIComponent(cookie)}`
                }
            }
            
            const { data: response, status, error } = await useFetch(route, {
                method: 'GET',
                baseURL: config.public.apiUrl,
                credentials: 'include',
                // server: false, // Fire on client
                watch: false, // Don't re-fetch on query change
                query: query,
                headers: allHeaders,
                ...(key ? { key: key} : {})
            })

            if (status.value === "success") {
                return { response, status }
            } else {
                await handleAuthErrors(error)
            }
        },
        async POST(route, body, key = null, headers = null) {
            const { data: response, status, error } = await useFetch(route, {
                method: 'POST',
                baseURL: config.public.apiUrl,
                credentials: 'include',
                server: false, // should fire on client
                watch: false, // Don't re-fetch when body data changes
                body: body,
                ...(headers ? { headers: headers } : {}),
                ...(key ? { key: key } : {})
            })
            if (status.value === "success") {
                return { response, status }
            } else {
                await handleAuthErrors(error)
            }
        }
    }
}