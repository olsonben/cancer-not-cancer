<template>
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <a class="navbar-item" href="https://bulma.io">
                <img class='logo' src="https://bulma.io/images/bulma-logo.png">
            </a>

            <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
                <a class="navbar-item">
                    Home
                </a>

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

<style lang="scss" scoped>
img.logo {
    width: fit-content;
}
</style>