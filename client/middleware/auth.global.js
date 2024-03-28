/**
 * You could potentially call this authentication only on the paths that need
 * credentials, but currently this restores any existing session on a page
 * reload. If you didn't call this on every page then userStore.login() should
 * be called else where to establish the user.
 */

import { useUserStore } from "~/store/user"

const pathologistPages = ['pathapp', 'pathapp-task-taskId-imageId']
const investigatorPages = ['admin-images', 'admin-tasks', 'admin-dataview']
const adminPages = ['admin-users']
const publicPages = ['index', 'about', 'issues']

export default defineNuxtRouteMiddleware(async (to, from) => { 
    const userStore = useUserStore()

    // If this is the initial loading of the app, see if the user has a valid session.
    if (!userStore.isLoaded) {
        await userStore.login()
    }
    if (publicPages.includes(to.name)) {
        return
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
        } else if (!userStore.isLoggedIn) {
            // TODO: do this for all the routes
            return navigateTo(getLoginUrl(to.fullPath), { external: true })
        }
    }
    console.log('middleWare pass')
})