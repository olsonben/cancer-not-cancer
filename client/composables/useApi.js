export const useApi = () => {
    const config = useRuntimeConfig()

    return {
        async GET(route, query) {
            try {
                // console.log('route:', route)
                // console.log('query:', query)
                const { data: response, status } = await useFetch(route, {
                    method: 'GET',
                    baseURL: config.public.apiUrl,
                    credentials: 'include',
                    query: query
                })
                // console.log(response)
                return { response, status }
            } catch (error) {
                console.log('GET request failed. Route:', route)
                console.error(error)
            }
        },
        async POST(route, body) {
            try {
                const { data: response, status } = await useFetch(route, {
                    method: 'POST',
                    baseURL: config.public.apiUrl,
                    credentials: 'include'
                })
                return { response, status }
            } catch (error) {
                console.log('POST request failed. Route:', route)
                console.error(error)
            }
        },
    }
}