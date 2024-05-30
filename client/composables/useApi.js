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

    const handleAuthErrors = (error) => {
        const statusCode = error.value.statusCode
        if (statusCode === 401 || statusCode === 403) {
            console.log('Unauthorized! Make sure you are logged in. Redirecting to login...')
            navigateTo(getLoginUrl(), { external: true })
        }
    }

    return {
        async GET(route, query, key = null, headers = null, watch = null) {
            try {
                let allHeaders = headers ? headers : {}

                if (import.meta.server) {
                    const cookie = useCookie('sessionId').value
                    if (cookie) {
                        allHeaders.cookie = `sessionId=${encodeURIComponent(cookie)}`
                    }
                }

                const { data, status, error, refresh } = await useFetch(route, {
                    method: 'GET',
                    baseURL: config.public.apiUrl,
                    credentials: 'include',
                    watch: watch || false, // Don't re-fetch on query change
                    query: query,
                    headers: allHeaders,
                    ...(key ? { key: key } : {})
                })

                // TODO: test for auth errors and confirm behavior upon api calls that are unauthed.
                if (status.value === "success") {
                    return { data, status, error, refresh }
                } else {
                    handleAuthErrors(error)
                    return { data, status, error, refresh }
                }
            } catch (err) {
                console.log(err)
            }
        },
        async POST(route, body, key = null, headers = null) {
            try {
                const response = await $fetch(route, {
                    method: 'POST',
                    baseURL: config.public.apiUrl,
                    credentials: 'include',
                    body: body,
                    ...(headers ? { headers: headers } : {})
                })
                return response   
            } catch (error) {
                if (error.statusCode === 401 || error.statusCode === 403) {
                    console.log('Unauthorized! Make sure you are logged in.')
                } else {
                    console.error(error);
                }
            }
        },
        async $fetch(route, query, key = null, headers = null) {
            try {
                let allHeaders = headers ? headers : {}

                const response = await $fetch(route, {
                    method: 'GET',
                    baseURL: config.public.apiUrl,
                    credentials: 'include',
                    query: query,
                    headers: allHeaders
                })
                return response
            } catch (error) {
                if (error.statusCode === 401 || error.statusCode === 403) {
                    console.log('Unauthorized! Make sure you are logged in.')
                } else {
                    console.error(error);
                }
            }
        }
    }
}