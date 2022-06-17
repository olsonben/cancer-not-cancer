<template>
    <section>
        {{loadPage()}}
        <nav class="navbar is-primary block" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <nuxt-link class="navbar-item" to="/">
                    <img class='logo' src="/logo.svg" alt='milmed logo'>
                </nuxt-link>

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

                    <nuxt-link to='/pathapp' class="navbar-item">
                        HotOrNot
                    </nuxt-link>

                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">More</a>

                        <div class="navbar-dropdown">
                            <nuxt-link to='/about' class="navbar-item">About</nuxt-link>
                            <nuxt-link to='/admin/images' class="navbar-item">Admin</nuxt-link>
                            <hr class="navbar-divider">
                            <a class="navbar-item">Report an issue</a>
                        </div>
                    </div>
                </div>

                <div class="navbar-end">
                    <div class="navbar-item">
                        <div class="buttons">
                        <client-only>
                            <nuxt-link :to="isLoggedIn ? '/logout' : '/login'" @click="console.log(isLoggedIn)" class="button is-light" v-html="isLoggedIn ? 'Log Out' : 'Log In'"/>
                        </client-only>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </section>
</template>

<script>
import { setCookie, getCookie } from 'tiny-cookie'
import axios from 'axios'
import * as env from '../.env.js'

export default {
    data() {
        return {
            showNav: false,
            isLoggedIn: false
        }
    },

    beforeMount() {
        this.loadPage()
    },
    methods: {
        loadPage() {
            console.log('Checking')
            axios.get(env.url.api + '/isLoggedIn')
                .then(res => {
                    this.isLoggedIn = true
                    console.log("Logged in: " + this.isLoggedIn)
                })
                .catch(err => {
                    if ([401, 403].includes(err.response.status)){
                        console.log('hello')
                        this.isLoggedIn = false
                    } else {
                        console.error(err)
                    }
                })
        }
    }
}
</script>

<style lang="scss" scoped>
img.logo {
    width: fit-content;
    max-height: 3rem;
}
</style>