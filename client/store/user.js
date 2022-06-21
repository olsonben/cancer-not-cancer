import axios from 'axios'
import * as env from '../.env.js'

// State should be a function that returns an object of everything you want to keep track of in the state
// Only setable through mutations; get with this.$store.state[.module].myStateItem
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

// Mutations change the state directly; accessible with this.$store.commit('myMutation'[, params...])
export const mutations = {
    isLoggedIn(state, value) {
        state.isLoggedIn = value
    },
    permissions(state, key, value) {
        state.permissions[key] = value
    },
    permissions(state, value) {
        state.permissions = value
    }
}

// Actions do a thing and can make many changes to the state THROUGH MUTATIONS; accesible with this.$store.dispatch('myAction'[, params...])
export const actions = {
    async onload({ commit, dispatch }) {
        try {
            let response = await axios.get(env.url.api + '/isLoggedIn')
            
            commit('isLoggedIn', true)
            commit('permissions', response.data.database.permissions)
        } catch(error) {
            if (error.response.status === 401) {
                dispatch('logout')

            } else if (error.response.status === 403) {
            } else {
                console.error(error)
            }
        }
    },

    logout({ commit }) {
        commit('isLoggedIn', false)
        commit('permissions', {
            admin: false,
            uploader: false,
            pathologist: false,
            enabled: false  
        })
    }
}