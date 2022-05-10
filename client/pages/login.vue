<template>
<section class="section">
    {{ this.$auth.loggedIn }}
    <button @click="auth('google')">Sign in with Google</button>
  </section>
</template>

<script>
export default {
    methods: {
        auth(method) {
            this.$auth.loginWith(method);
        }
    }
}
</script>