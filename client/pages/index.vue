<script setup>
import { useUserStore } from "~/store/user";
const isLoggedIn = useUserStore().isLoggedIn

useHead({
    title: 'Home'
})
</script>

<template>
    <div class='content section'>
        <h1>Welcome to Cancer Not Cancer</h1>

        <div class="buttons">
            <!-- TODO: temp navigation to task-0, remove when no longer needed. -->
            <NuxtLink v-if="!isLoggedIn" :to='getLoginUrl("/pathapp/task-0")' class='button is-light'>Log In and Go!</NuxtLink>
        </div>

        <p>Cancer Not Cancer is a platform for labeling digitized biopsy slides as <i>cancer</i> or <i>not cancer</i>.
        </p>

        <p>Swipe left if an image is of cancer, swipe right if it’s of benign tissue (not cancer). Additionally, you can
            leave a comment. A white box at the center of each image indicates the region of interest, and the outer
            area is the receptive field.</p>

        <p>This is a demo instance, and the data from this instance is not used for any research purposes, so you’re
            free to use it however you’d like.</p>

        <p>Performance tracking and comparisons are coming in the next feature release.</p>
    </div>
</template>