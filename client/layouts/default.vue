<template>
    <div>
        <!-- Every page should have the navbar + body -->
        <NavBar class='main-nav' />
        <nuxt class='nuxt-tag' />
        <Login class='login-modal' />
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
.nuxt-tag {
    margin-top: calc($navbar-height + $block-margin);
}
/* Reduced margin for sections to avoid unwanted whitespace */
.nuxt-tag.section {
    margin-top: $navbar-height;
}
</style>