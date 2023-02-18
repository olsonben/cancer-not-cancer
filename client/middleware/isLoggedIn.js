// import axios from 'axios'

// export default async ({ redirect, $config }) => {
//     // Check if the user is logged in, redirect if not
//     try {
//         console.log('middleware(isLoggedIn.js)')
//         const response = await axios.get($config.url.api + '/isLoggedIn')
//     } catch (err) {
//         console.warn('Not logged in.')
//         // if (err.response.status === 401) {
//         //     const loginURL = $config.url.api + '/auth/google'
//         //     redirect(loginURL)
//         // }
//     }
// }