<script setup>
import { useUserStore } from '~/store/user'
useHead({
    title: 'Logout'
})

if (import.meta.client) {
    const user = useUserStore()
    if (user.isLoggedIn) {
        user.logout()
    }
}
</script>

<template>
    <div class="content section">
        You have been logged out.
    </div>
</template>