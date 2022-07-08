// Function to automatically load the user permissions + isLoggedIn
export default function ({ store }) {
    // Middleware doesn't need the `this.$` to access `store`
    store.dispatch('user/onload')
}