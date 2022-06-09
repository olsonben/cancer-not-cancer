<template>
    <div>
        <div class='tabs'>
            <ul>
                <li><nuxt-link to='/admin/images'>Images</nuxt-link></li>
                <li><nuxt-link to='/admin/users'>Users</nuxt-link></li>
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
                `${window.location.origin}/admin/images`
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