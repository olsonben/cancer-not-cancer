/**
 * Store for the state of the user using Vuex
 * These are all automatically accessible to any Vue page thanks to nuxt
 * https://vuex.vuejs.org/
 * https://nuxtjs.org/docs/directory-structure/store/
 */
import axios from 'axios'
import * as env from '../.env.js'

// State should be a function that returns an object of everything you want to keep track of in the state
/**
 * Setter: see `mutations`
 * Getter: this.$store.state.user.value 
 *      (e.g. isLoggedIn is at this.$store.state.user.isLoggedIn)
 */
export const state = () => ({
    isLoggedIn: false,
    permissions: {
        admin: false,
        uploader: false,
        pathologist: false,
        enabled: false
    }
})

// For special types of getters (eg. a list without a certain item)
export const getters = {}

/**
 * Used to set the state
 * Accessisble with: `this.$store.commit('user/mutation'[, params...])
 *      e.g. Set the `isLoggedIn` state to `true` with 
 *              this.$store.commit('user/isLoggedIn', true)
 */
export const mutations = {
    isLoggedIn(state, value) {
        state.isLoggedIn = value
    },
    // Permissions mutable either by key or as a whole
    permissions(state, key, value) {
        state.permissions[key] = value
    },
    permissions(state, value) {
        state.permissions = value
    }
}

// Actions do a thing and can make many changes to the state THROUGH MUTATIONS; accesible with this.$store.dispatch('myAction'[, params...])
/**
 * Actions do a thing (more than just setting state). Think of them as wrappers for mutations.
 * Accessible with: this.$store.dispatch('user/action'[, params])
 *      e.g. To call `onload` use the following:
 *              this.$store.dispatch('user/onload')
 * Actions are automatically fed a `context` object
 * `context` includes all the normal store options (context.state, .getters, .commit, .dispatch)
 * We use deconstruction to reduce boilerplate code
 */
export const actions = {
    // Get permissions and isLoggedIn on loading the site (called in ~middleware/onload.js)
    async onload({ commit, dispatch }) {
        try {
            let response = await axios.get(env.url.api + '/isLoggedIn')
            
            // Since `context` only references this module and submodules, the 'user/' identifier should not be used
            commit('isLoggedIn', true)
            commit('permissions', response.data.permissions)
        } catch(error) {
            if (error.response.status === 401) {
                dispatch('logout')

            } else if (error.response.status === 403) {
            } else {
                console.error(error)
            }
        }
    },

    // Register a logout
    async logout({ commit }) {
        try {
            const response = await axios.get(env.url.api + '/auth/logout')

            commit('isLoggedIn', false)
            commit('permissions', {
                admin: false,
                uploader: false,
                pathologist: false,
                enabled: false  
            })

        } catch (error) {
            console.error(err)

        }
    }
}