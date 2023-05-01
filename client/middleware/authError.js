// Maybe used in the future to capture authentication errors. Similar to isLoggedIn.
export default ({$axios, store, redirect}) => {
    console.log('authError init')
    $axios.onError((error) => {
        console.log('auth on error')
        const statusCode = parseInt(error.response && error.response.status)
        if (statusCode === 401 || statusCode === 403) {
            console.log('authError middleware 401/403')

        }
    })
}