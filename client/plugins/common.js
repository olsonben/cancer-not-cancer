export default ({ app }, inject) => {
    const apiURL = app.$axios.defaults.baseURL.replace(/\/+$/, '')

    const common = {
        getLoginURL() {
            const isLogout = app.router.currentRoute.name == 'logout'
            const loginParams = new URLSearchParams({
                'ref_path': !isLogout ? app.router.currentRoute.fullPath : '/'
            })
            const loginURL = new URL(`${apiURL}/auth/google?${loginParams}`)
            return loginURL.href
        }
    }
    inject('common', common)
}