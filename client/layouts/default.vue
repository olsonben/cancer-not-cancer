<template>
    <div>
        <NavBar />
        <nuxt />
    </div>
</template>

<script>
import axios from 'axios'
import { setCookie, getCookie } from 'tiny-cookie'
import * as env from '../.env.js'
import CryptoJS from 'crypto-js'

export default {
    data() {
        return {

        }
    },

    beforeMount() {
        let cookie = getCookie('isLoggedIn')
        if (cookie !== 'true') {
            axios.get(env.url.api + '/isLoggedIn')
                .then(res => {
                    this.$store.commit('login')
                })
                .catch(err => {
                    if ([401, 403].includes(error.response.status)) window.location.replace(`${env.url.base}/login`)
                    console.error(error);
                })
        }
    }
}
</script>