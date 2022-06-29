<template>
    <section>
        <nav class="navbar is-primary block" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a 
                  role="button" 
                  class="navbar-burger" 
                  v-on:click="showNav = !showNav" 
                  v-bind:class="{ 'is-active' : showNav }" 
                  aria-label="menu" 
                  aria-expanded="false" 
                  data-target="navContent"
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div id="navContent" class="navbar-menu" v-bind:class="{ 'is-active' : showNav }">
                <div class="navbar-start">
                    <nuxt-link to='/' class="navbar-item">
                        Home
                    </nuxt-link>

                    <nuxt-link to='/pathapp' v-if='this.permissions.pathologist' class="navbar-item">
                        HotOrNot
                    </nuxt-link>
                    <nuxt-link 
                      :to='`/admin/${this.permissions.uploader ? "images" : "users"}`' 
                      v-if='this.permissions.uploader || this.permissions.admin' 
                      class="navbar-item"
                    >
                        Admin
                    </nuxt-link>

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
                        <div class="buttons">
                            <!-- <nuxt-link :to="isLoggedIn ? '/logout' :  '/login'" @click="setIsLoggedIn(!isLoggedIn);" class="button is-light">{{ isLoggedIn ? 'Log Out' : 'Log In' }}</nuxt-link> -->
                            <nuxt-link v-if='isLoggedIn' to='/logout' class='button is-light'>Log Out</nuxt-link>
                            <a v-else :href='api + "/auth/google"' class='button is-light'>Log In</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </section>
</template>

<script>
import axios from 'axios'
import * as env from '../.env.js'

export default {
    data() {
        return {
            showNav: false,
            api: env.url.api
        }
    },

    computed: {
        isLoggedIn() {
            return this.$store.state.user.isLoggedIn
        },
        permissions() {
            return this.$store.state.user.permissions
        }
    },

    created() {
       this.$store.dispatch('user/onload')
    },

    methods: {
        setIsLoggedIn(value) {
            this.$store.commit('user/isLoggedIn', value)
        }
    }
}
</script>

<style lang="scss" scoped>
.navbar, .navbar-brand {
    background-image: url(/logo.svg);
    background-position: left;
    background-position-x: 1rem;
    background-size: 2rem auto;
    background-repeat: no-repeat;
}
.navbar-brand, .navbar-tabs {
    display: block;
}
.navbar-start {
    margin-left: 3.4rem;
}
.navbar-burger {
    height: 3.45rem;
    width: 3.45rem;
}
</style>