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
                    <NuxtLink v-if='isLoggedIn' to='/logout' class='button is-light'>Log Out</NuxtLink>
                    <NuxtLink v-else :to='loginLink' class='button is-light'>Log In</NuxtLink>
                </div>
            </div>

            <!-- Burger menu -->
            <a 
                role="button" 
                class="navbar-burger ml-0" 
                aria-label="menu" 
                aria-expanded="false" 
                data-target="navContent"
                v-on:click="showNav = !showNav; showAnimation = !showAnimation /* Use changes on click */" 
                v-bind:class="{ 'is-active' : showAnimation }" 
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>        

        <!-- Navbar body -->
        <div id="navContent" class="navbar-menu" v-bind:class="{ 'is-active' : showNav }"> <!-- Show when the burger is clicked on mobile -->
            <!-- Links to places -->
            <div class="navbar-start">
                <!-- Home -->
                <NuxtLink to='/' class="navbar-item">
                    Home
                </NuxtLink>

                <!-- CancerNotCancer -->
                <!-- TODO: temp navigation to task-0, remove when no longer needed. -->
                <NuxtLink to='/pathapp/task-0' v-if='isPathologist' class="navbar-item">
                    CancerNotCancer
                </NuxtLink>

                <!-- Admin -->
                <NuxtLink 
                    :to='`/admin/${isUploader ? "images" : "users" /* Location changes with permissions */}`' 
                    v-if='isUploader || isAdmin' 
                    class="navbar-item"
                >
                    Admin
                </NuxtLink>
                
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
                        <NuxtLink v-if='isLoggedIn' to='/logout' class='button is-light'>Log Out</NuxtLink>
                        <NuxtLink v-else :to='loginLink' class='button is-light'>Log In</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
        
    </nav>
</template>

<script>
import { mapState } from "pinia";
import { useUserStore } from "../store/user"

export default {
    data() {
        return {
            // State for the burger menu
            showNav: false,
            showAnimation: false,
            loginLink: getLoginUrl(),
        }
    },

    // Shorthand to check permissions + isLoggedIn
    computed: {
        ...mapState(useUserStore, ['isLoggedIn', 'isAdmin', 'isPathologist', 'isUploader'])
    },

    created() {
    },

    // Fine grained control of the burger animation
    watch:{
        $route: {
            handler(to, from) {
                this.loginLink = getLoginUrl(to.fullPath)
                this.showAnimation = false
                setTimeout(() => {
                    this.showNav = false
                }, "86")
            },
        }
    },

    methods: {
    }
}
</script>

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