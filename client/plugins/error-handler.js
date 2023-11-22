export default defineNuxtPlugin((nuxtApp) => {
    // nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    //     // handle error
        
    // }

    // TODO: update the code for production error handling.
    nuxtApp.hook('vue:error', (error, instance, info) => {
        // handle error - report to monitoring service
        // console.error(error)
        // console.log(instance)
        // console.log(info)
    })
})