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
/* Body is under the NavBar */
.nav-bumper {
    margin-top: $navbar-height;
}
</style>