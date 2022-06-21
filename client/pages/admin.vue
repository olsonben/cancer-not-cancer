<template>
    <div>
        <div class='tabs'>
            <ul>
                <li><nuxt-link v-if='this.$store.state.user.permissions.uploader' to='/admin/images'>Images</nuxt-link></li>
                <li><nuxt-link v-if='this.$store.state.user.permissions.admin' to='/admin/users'>Users</nuxt-link></li>
            </ul>
        </div>
        <nuxt-child />
    </div>
</template>

<script>
export default {
    beforeMount() {
        if (this.$nuxt.$route.path === '/admin') {
            window.location.replace(
                `${window.location.origin}/admin/${this.$store.state.user.permissions.uploader ? 'images'
                                                    : this.$store.state.user.permissions.admin ? 'users' : '..'}`
            )
        }
    }
}
</script>

<style lang='scss' scoped>
a.nuxt-link-exact-active {
    color: $info;
    border-bottom-color: $info;
}
</style>