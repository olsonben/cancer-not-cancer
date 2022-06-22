<template>
    <div>
        <a :href='api + "/auth/google"'>Login with Google</a>
    </div>
</template>

<script>
import * as env from '../.env.js'
export default {
    data() {
        return {
            api: env.url.api
        }
    }
}

</script>