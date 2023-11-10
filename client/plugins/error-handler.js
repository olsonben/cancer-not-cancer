export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
        // handle error
        
    }

    // TODO: update the code for production error handling. Currently just logging
    // so it is easier to debug uncaught errors. For production, it would be nice
    // to redirect to an central error page or something similar.
    // also
    nuxtApp.hook('vue:error', (error, instance, info) => {
        // handle error
        console.log('::Error Handler::')
        console.log(error)
        console.log('instance__')
        console.log(instance)
        console.log('info___')
        console.log(info)
    })
})