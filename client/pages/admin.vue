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
    mounted() {
        if (["/admin", "/admin/"].includes(this.$nuxt.$route.path)) {
            window.location.replace('/')
        }
    }
}
</script>

<style lang='scss' scoped>
a.nuxt-link-exact-active {
    color: $info;
    border-bottom-color: $info;
}
.tabs {
    margin-top: -1.5rem;
}
</style>