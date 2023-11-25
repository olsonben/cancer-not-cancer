<template>
    <div class="content section">
        You have been logged out.
    </div>
</template>

<script>
import { useUserStore } from '~/store/user'

export default {
    // Automatically logout when coming to this page
    created() {
        const user = useUserStore()
        if (user.isLoggedIn) {
            user.logout()
        }
    }
}
</script>