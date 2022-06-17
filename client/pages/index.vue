<template>
    <div style='display:block'>
        This is the home

        <button @click='recallMe()'>Recall Me</button>
        {{cookieResponse}}
        {{message}}
    </div>
</template>

<script>
import { getCookie, setCookie } from 'tiny-cookie'
import * as env from '../.env.js'

export default {
    data() {
        return {
            cookieResponse: '',
            message: '',
            favNum: ''
        }
    },

    methods: {
        recallMe() {
            this.cookieResponse = JSON.parse(getCookie('test' + env.url.base + 'data'))
            this.message = this.cookieResponse.message
        }
    }
}
</script>