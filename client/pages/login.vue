<script setup>
useHead({
    title: 'Login'
})
</script>

<template>
    <div class="section">
        <div class="box has-text-centered">
            <div class="block">
                <a class="button" :href='getLoginUrl()'>Login with Google</a>
            </div>
        </div>
    </div>
</template>