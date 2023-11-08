export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
        // handle error
        
    }

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