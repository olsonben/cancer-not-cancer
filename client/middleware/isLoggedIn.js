import axios from 'axios'

export default async ({ redirect, $config }) => {
    // Check if the user is logged in, redirect if not
    try {
        const response = await axios.get($config.url.api + '/isLoggedIn')
    } catch (err) {
        if (err.response.status === 401) {
            const loginURL = $config.url.api + '/auth/google'
            redirect(loginURL)
        }
    }
}