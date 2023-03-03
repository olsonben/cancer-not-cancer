<template>
    <div>
        <div class='tabs'>
            <ul>
                <!-- Tabs visible based on permissions -->
                <li><nuxt-link v-if='this.$store.state.user.permissions.uploader' to='/admin/images'>Images</nuxt-link></li>
                <li><nuxt-link v-if='this.$store.state.user.permissions.admin' to='/admin/users'>Users</nuxt-link></li>
            </ul>
        </div>
        <nuxt-child class='nuxt-child'/>
    </div>
</template>

<script>
export default {
    // This is more a layout for admin subpages
    mounted() {
        if (["/admin", "/admin/"].includes(this.$nuxt.$route.path)) {
            this.$router.push('/')
        }
    }
}
</script>

<style lang='scss' scoped>
a.nuxt-link-exact-active {
    color: $info;
    border-bottom-color: $info;
}
/* move .section up to avoid oddly large whitespace */
.tabs, section.section {
    margin-top: calc(-1 * $block-margin);
}
</style>