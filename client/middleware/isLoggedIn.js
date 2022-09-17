import axios from 'axios'
import * as env from '../.env.js'

export default async ({ redirect }) => {
    // Check if the user is logged in, redirect if not
    try {
        const response = await axios.get(env.url.api + '/isLoggedIn')
    } catch (err) {
        if (err.response.status === 401) {
            const loginURL = env.url.api + '/auth/google'
            redirect(loginURL)
        }
    }
}