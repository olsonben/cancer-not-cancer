<template>
    <div>
        <NavBar class='main-nav' />
        <nuxt class='nuxt-tag' />
    </div>
</template>

<style lang='scss'>
.main-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
}
.nuxt-tag {
    margin-top: calc($navbar-height + $block-margin);
}
.nuxt-tag.section {
    margin-top: $navbar-height;
}
</style>