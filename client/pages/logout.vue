<template>
    <div class="content section">
        You have been logged out.
    </div>
</template>

<script>
import { useUserStore } from '~/store/user'
const userStore = useUserStore()

export default {
    // Automatically logout when coming to this page
    created() {
        userStore.logout()
    }
}
</script>