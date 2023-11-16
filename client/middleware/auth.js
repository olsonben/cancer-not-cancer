/**
 * You could potentially call this authentication only on the paths that need
 * credentials, but then you would need to make a second call in the navigation
 * bar to check permissions.
 */
export default async ({ redirect, store, route}) => {
    // Permission check
    await store.dispatch('user/login')

    if (route.name == 'pathapp') {
        if (store.getters['user/isLoggedIn'] && !store.getters['user/isPathologist']) {
            redirect('/')
        }
    } else if (route.name == 'admin-images') {
        if (store.getters['user/isLoggedIn'] && !store.getters['user/isUploader']) {
            redirect('/')
        }
    } else if (route.name == 'admin-users') {
        if (store.getters['user/isLoggedIn'] && !store.getters['user/isAdmin']) {
            redirect('/')
        }
    }
}