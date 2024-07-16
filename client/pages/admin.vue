<script setup>
import { mapState } from "pinia";
import { useUserStore } from "../store/user"
const route = useRoute()
const userStore = useUserStore()

const isAdmin = computed(() => userStore.isAdmin)
const isUploader = computed(() => userStore.isUploader)

onMounted(() => {
    if (["/admin", "/admin/"].includes(route.path)) {
        const router = useRouter()
        router.push('/')
    }
})
</script>

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

<style lang='scss' scoped>
a.nuxt-link-exact-active {
    color: $info;
    font-weight: bold;
    border-bottom-color: $info;
}
</style>