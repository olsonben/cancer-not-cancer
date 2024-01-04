/**
 * You could potentially call this authentication only on the paths that need
 * credentials, but currently this restores any existing session on a page
 * reload. If you didn't call this on every page then userStore.login() should
 * be called else where to establish the user.
 */

import { useUserStore } from "~/store/user"

const pathologistPages = ['pathapp']
const investigatorPages = ['admin-images', 'admin-tasks', 'admin-dataview']
const adminPages = ['admin-users']

// TODO: this breaks relogging in on the logout page.
export default defineNuxtRouteMiddleware(async (to, from) => { 
    const userStore = useUserStore()

    // If this is the initial loading of the app, see if the user has a valid session.
    if (!userStore.isLoaded) {
        await userStore.login()
    }

    // Redirect if authentication doesn't match route.
    if (pathologistPages.includes(to.name)) {
        if (userStore.isLoggedIn && !userStore.isPathologist) {
            return navigateTo('/')
        }
    } else if (investigatorPages.includes(to.name)) {
        if (userStore.isLoggedIn && !userStore.isUploader) {
            return navigateTo('/')
        }
    } else if (adminPages.includes(to.name)) {
        if (userStore.isLoggedIn && !userStore.isAdmin) {
            return navigateTo('/')
        }
    }
})