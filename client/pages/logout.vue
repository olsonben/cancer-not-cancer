<template>
    <div>
        Bye!
    </div>
</template>

<script>
import axios from 'axios'
import * as env from '../.env.js'

export default {
    created() {
        axios.get(env.url.api + '/auth/logout')
            .then(res => {
                this.$store.dispatch('user/logout')
            })
            .catch(err => {
                console.error(err)
            })
    }
}
</script>