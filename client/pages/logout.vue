<template>
    <div class="content section">
        You have been logged out.
    </div>
</template>

<script setup>
import { useUserStore } from '~/store/user'
useHead({
    title: 'Logout'
})

const user = useUserStore()
if (user.isLoggedIn) {
    user.logout()
}
</script>