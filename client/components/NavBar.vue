<template>
    <nav class="navbar is-primary block" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <nuxt-link class="navbar-item" to="/home">
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
                <nuxt-link to='/home' class="navbar-item">
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
                        <nuxt-link to='/login' class="button is-light">
                            Log in
                        </nuxt-link>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            showNav: false
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