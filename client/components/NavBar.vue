<template>
    <!-- This uses bulma's navbar -->
    <nav class="navbar is-primary block" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <!-- Should include the logo, but it was acting weird -->

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
                <nuxt-link to='/pathapp' v-if='this.permissions.pathologist' class="navbar-item">
                    CancerNotCancer
                </nuxt-link>

                <!-- Admin -->
                <nuxt-link 
                    :to='`/admin/${this.permissions.uploader ? "images" : "users" /* Location changes with permissions */}`' 
                    v-if='this.permissions.uploader || this.permissions.admin' 
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
                        <!-- This is for having an onsite login page -->
                        <!-- <nuxt-link 
                            :to="isLoggedIn ? '/logout' :  '/login'" 
                            @click="setIsLoggedIn(!isLoggedIn)" 
                            class="button is-light"
                        >
                            {{ isLoggedIn ? 'Log Out' : 'Log In' }
                        }</nuxt-link> -->

                        <nuxt-link v-if='isLoggedIn' to='/logout' class='button is-light'>Log Out</nuxt-link>
                        <a v-else :href='api + "/auth/google"' class='button is-light'>Log In</a>
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
            // State for the burger menu
            showNav: false,
            showAnimation: false,
            api: this.$axios.defaults.baseURL.replace(/\/+$/, '') // remove ending slash
        }
    },

    // Shorthand to check permissions + isLoggedIn
    computed: {
        isLoggedIn() {
            return this.$store.state.user.isLoggedIn
        },
        permissions() {
            return this.$store.state.user.permissions
        }
    },

    // Run onload as soon as this is created
    created() {
       this.$store.dispatch('user/onload')
    },

    // Fine grained control of the burger animation
    watch:{
        $route: {
            handler(to, from) {
                this.showAnimation = false
                setTimeout(() => {
                    this.showNav = false
                }, "86")
            },
        }
    },

    // Handle isLoggedIn state
    methods: {
        setIsLoggedIn(value) {
            this.$store.commit('user/isLoggedIn', value)
        }
    }
}
</script>

<style lang="scss" scoped>
/* CSS for the current page */
a.nuxt-link-exact-active {
    background-color: $info;
    color: white !important; //this should be moved out of the .vue and into a scss or css file since it's static, also our need to use !important gives me pause.
}

.navbar.is-primary:hover .navbar-start > .navbar-item:hover{
    background-color: $info;
    color: white !important; //this should be moved out of the .vue and into a scss or css file since it's static
}

/* Logo */
.navbar, .navbar-brand {
    background-image: url(~assets/logo.svg);
    background-position: left;
    background-position-x: .70rem;
    background-size: 2rem auto;
    background-repeat: no-repeat;
}
/* Spacer for the logo */
.navbar-start {
    margin-left: 3.4rem;
}
/* Adjust burger size for consistent navbar height */
.navbar-burger {
    height: $navbar-height;
    width: $navbar-height; /* I want it square */
}
/* adjustments for mobile */
@media screen and (max-width: 1024px) {
    a.nuxt-link-exact-active {
        border-radius: 1rem 0 0 1rem;
    }
}
</style>