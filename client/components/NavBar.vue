<script setup>
import { useUserStore } from "~/store/user"

// Shorthand to check permissions + isLoggedIn
const isLoggedIn = computed(() => useUserStore().isLoggedIn)
const isAdmin = computed(() => useUserStore().isAdmin)
const isPathologist = computed(() => useUserStore().isPathologist)
const isUploader = computed(() => useUserStore().isUploader)

const showNav = ref(false)
const showAnimation = ref(false)
</script>

<template>
    <!-- This uses bulma's navbar -->
    <nav class="navbar is-primary block" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <!-- Should include the logo, but it was acting weird -->
            <NuxtLink to='/' class="navbar-item logo">
                <img src="~assets/logo.svg" alt="Milmed Logo">
            </NuxtLink>

            <div class="navbar-item is-hidden-desktop is-hidden-widescreen is-hidden-fullhd ml-auto">
                <!-- Logout/Login -->
                <div class="buttons">
                    <client-only>
                        <NuxtLink v-if='isLoggedIn' to='/logout' class='button is-light'>Log Out</NuxtLink>
                        <NuxtLink v-else :to='getLoginUrl()' class='button is-light'>Log In</NuxtLink>
                    </client-only>
                </div>
            </div>

            <!-- Burger menu -->
            <a role="button" class="navbar-burger ml-0" aria-label="menu" aria-expanded="false" data-target="navContent"
                v-on:click="showNav = !showNav; showAnimation = !showAnimation /* Use changes on click */"
                v-bind:class="{ 'is-active' : showAnimation }">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <!-- Navbar body -->
        <div id="navContent" class="navbar-menu" v-bind:class="{ 'is-active' : showNav }">
            <!-- Show when the burger is clicked on mobile -->
            <!-- Links to places -->
            <div class="navbar-start">
                <!-- Home -->
                <NuxtLink to='/' class="navbar-item">
                    Home
                </NuxtLink>

                <client-only>
                    <!-- CancerNotCancer -->
                    <NuxtLink to='/pathapp/' v-if='isPathologist' class="navbar-item">
                        CancerNotCancer
                    </NuxtLink>
                    
                    <!-- Admin -->
                    <NuxtLink v-if='isUploader || isAdmin' class="navbar-item" :to='`/admin/${isUploader ? "images" : "users" }`'>
                    Admin
                    </NuxtLink>
                </client-only>

                <!-- Extra Links: About + Issues -->
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">More</a>

                    <div class="navbar-dropdown">
                        <NuxtLink to='/about' class="navbar-item">About</NuxtLink>
                        <hr class="navbar-divider">
                        <NuxtLink to='/issues' class="navbar-item">Report an issue</NuxtLink>
                    </div>
                </div>
            </div>

            <div class="navbar-end is-hidden-touch">
                <div class="navbar-item">
                    <!-- Logout/Login -->
                    <div class="buttons">
                        <client-only>
                            <NuxtLink v-if='isLoggedIn' to='/logout' class='button is-light'>Log Out</NuxtLink>
                            <NuxtLink v-else :to='getLoginUrl()' class='button is-light'>Log In</NuxtLink>
                        </client-only>
                    </div>
                </div>
            </div>
        </div>

    </nav>
</template>

<style lang="scss" scoped>
/* NavBar is fixed to the top */
.main-nav {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;

    width: 100%;
}
</style>