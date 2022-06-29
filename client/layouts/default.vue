<template>
    <div>
        <NavBar class='block main-nav' />
        <nuxt class='element' />
    </div>
</template>

<style scoped>
.main-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
}
.element {
    margin-top: calc(3.4rem + 1.5rem);
}
</style>