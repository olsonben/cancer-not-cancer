<template>
    <div class="content section">
        You have been logged out.
    </div>
</template>

<script>
export default {
    // Automatically logout when coming to this page
    created() {
        this.$store.dispatch('user/logout')
    }
}
</script>