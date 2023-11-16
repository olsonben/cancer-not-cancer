<template>
    <!-- This uses bulma's navbar -->
    <nav class="navbar is-primary block" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <!-- Should include the logo, but it was acting weird -->
            <nuxt-link to='/' class="navbar-item logo" href="https://client.milmed.ai">
                <img src="~assets/logo.svg" alt="Milmed Logo">
            </nuxt-link>

            <!-- Burger menu -->
            <a 
                role="button" 
                class="navbar-burger" 
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
                <nuxt-link to='/' class="navbar-item">
                    Home
                </nuxt-link>

                <!-- CancerNotCancer -->
                <nuxt-link to='/pathapp' v-if='isPathologist' class="navbar-item">
                    CancerNotCancer
                </nuxt-link>

                <!-- Admin -->
                <nuxt-link 
                    :to='`/admin/${isUploader ? "images" : "users" /* Location changes with permissions */}`' 
                    v-if='isUploader || isAdmin' 
                    class="navbar-item"
                >
                    Admin
                </nuxt-link>
                
                <!-- Extra Links: About + Issues -->
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">More</a>

                    <div class="navbar-dropdown">
                        <nuxt-link to='/about' class="navbar-item">About</nuxt-link>
                        <hr class="navbar-divider">
                        <nuxt-link to='/issues' class="navbar-item">Report an issue</nuxt-link>
                    </div>
                </div>
            </div>

            <div class="navbar-end">
                <div class="navbar-item">
                    <!-- Logout/Login -->
                    <div class="buttons">
                        <nuxt-link v-if='isLoggedIn' to='/logout' class='button is-light'>Log Out</nuxt-link>
                        <a v-else :href='loginLink' class='button is-light'>Log In</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            // State for the burger menu
            showNav: false,
            showAnimation: false,
            loginLink: this.$common.getLoginURL(),
        }
    },

    // Shorthand to check permissions + isLoggedIn
    computed: {
        ...mapGetters('user', ['isLoggedIn', 'isAdmin', 'isPathologist', 'isUploader'])
    },

    created() {
    },

    // Fine grained control of the burger animation
    watch:{
        $route: {
            handler(to, from) {
                this.loginLink = this.$common.getLoginURL()
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
/* CSS for the current page */
</style>