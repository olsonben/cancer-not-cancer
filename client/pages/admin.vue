<template>
    <div>
        <div class='tabs'>
            <ul>
                <!-- Tabs visible based on permissions -->
                <li><nuxt-link v-if='isUploader' to='/admin/images'>Images</nuxt-link></li>
                <li><nuxt-link v-if='isAdmin' to='/admin/users'>Users</nuxt-link></li>
                <li><nuxt-link v-if='isUploader' to='/admin/tasks'>Tasks</nuxt-link></li>
                <li><nuxt-link v-if='isUploader' to='/admin/dataview'>Stats</nuxt-link></li>
            </ul>
        </div>
        <NuxtPage/>
    </div>
</template>

<script>
import { mapState } from "pinia";
import { useUserStore } from "../store/user"
const router = useRoute()

export default {
    // This is more a layout for admin subpages
    mounted() {
        // TODO: is this actually doing anything?
        if (["/admin", "/admin/"].includes(router.path)) {
            router.push('/')
        }
    },
    computed: {
        ...mapState(useUserStore, ['isAdmin', 'isUploader'])
    },
}
</script>

<style lang='scss' scoped>
a.nuxt-link-exact-active {
    color: $info;
    font-weight: bold;
    border-bottom-color: $info;
}
</style>