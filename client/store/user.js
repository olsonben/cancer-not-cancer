import axios from 'axios'
import * as env from '../.env.js'

export const state = () => ({
    isLoggedIn: false,
})

export const getters = {}

export const mutations = {
    isLoggedIn(state, value) {
        state.isLoggedIn = value
    }
}

export const actions = {
    async onload(context) {
        try {
            let response = await axios.get(env.url.api + '/isLoggedIn')
            
            context.commit('isLoggedIn', true)
        } catch (error) {
            if (error.response.status === 401) {
                console.log('Caught 401 error in user/onload')
                context.commit('isLoggedIn', false)
            } else if (error.response.status === 403) {
                console.log('Caught 403 error in user/onload')
            } else {
                console.error(error)
            }
        }
    }
}