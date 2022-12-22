<template>
    <div>
        You have been logged out.
    </div>
</template>

<script>
import axios from 'axios'
import * as env from '../.env.js'

export default {
    // Automatically logout when coming to this page
    created() {
        this.$store.dispatch('user/logout')
    }
}
</script>