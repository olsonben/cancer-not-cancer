<template>
    <div>
        <!-- I intended this to be a routing page for various forms of sign in -->
        <!-- It may be better ot just route straight to the google login -->
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