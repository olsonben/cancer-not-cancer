// Maybe used in the future to capture authentication errors. Similar to isLoggedIn.
// export default ({$axios, store, redirect}) => {
//     $axios.onError((error) => {
//         const statusCode = parseInt(error.response && error.response.status)
//         if (statusCode === 401 || statusCode === 403) {
//             console.log('Unauthorized! Make sure you are logged in.')
//         }
//     })
// }