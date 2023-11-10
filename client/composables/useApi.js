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

    return {
        async GET(route, query, key = null) {
            const { data: response, status, error } = await useFetch(route, {
                method: 'GET',
                baseURL: config.public.apiUrl,
                credentials: 'include',
                server: false, // Fire on client
                watch: false, // Don't re-fetch on query change
                query: query,
                ...(key ? { key: key} : {})
            })
            if (error.value) {
                throw error.value
            }
            return { response, status }
        },
        async POST(route, body, key) {
            const { data: response, status, error } = await useFetch(route, {
                method: 'POST',
                baseURL: config.public.apiUrl,
                credentials: 'include',
                server: false, // should fire on client
                watch: false, // Don't re-fetch when body data changes
                body: body,
                ...(key ? { key: key } : {})
            })
            if (error.value) {
                throw error.value
            }
            return { response, status }
        },
    }
}