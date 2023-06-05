export default ({ app }, inject) => {
    const common = {
        getLoginURL() {
            const isLogout = app.router.currentRoute.name == 'logout'
            const loginParams = new URLSearchParams({
                'ref_path': !isLogout ? app.router.currentRoute.fullPath : '/'
            })
            const loginURL = new URL(`${app.$axios.defaults.baseURL}/auth/google?${loginParams}`)
            return loginURL.href
        }
    }
    inject('common', common)
}