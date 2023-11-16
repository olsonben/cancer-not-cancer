<template>
    <div class="section">
        <div class="box has-text-centered">
            <div class="block">
                <a class="button" :href='loginLink'>Login with Google</a>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            loginLink: this.$axios.defaults.baseURL + "/auth/google"
        }
    }
}

</script>