<template>
    <div>
        <!-- Every page should have the navbar + body -->
        <NavBar class='main-nav' />
        <div class="nav-bumper">
            <NuxtPage  />
        </div>
    </div>
</template>

<style lang='scss'>
/* NavBar is fixed to the top */
.main-nav {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;

    width: 100%;
}
/* Body is under the NavBar */
.nav-bumper {
    margin-top: $navbar-height;
}
</style>