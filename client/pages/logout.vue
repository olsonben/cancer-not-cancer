<template>
    <div>
        Bye!
    </div>
</template>

<script>
import axios from 'axios'
import * as env from '../.env.js'
import { setCookie } from 'tiny-cookie'

export default {
    created() {
        axios.get(env.url.api + '/auth/logout')
            .then(res => {
                this.$store.commit('logout')
            })
            .catch(err => {
                console.error(err)
            })
    }
}
</script>