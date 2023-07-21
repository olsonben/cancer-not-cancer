<template>
    <div>
        <!-- Main tasks -->
        <section class='section tasks-controller'>
            <h1 class='title'>Tasks</h1>
            <div>
                Create Tasks Here
            </div>
        </section>
    </div>
</template>

<script>

export default {
    data() {
        return {
        }
    },
    computed: {
    },
    watch: {
    },
    created() {
    },

    mounted() {
        // Allowing scrolling because some table are really long
        document.documentElement.style.setProperty('--overflow', 'initial')
    },
    destroyed() {
        // Turn scrolling off when leaving dataview
        document.documentElement.style.setProperty('--overflow', 'hidden')
    },

    methods: {
    }
}
</script>

<style lang='scss'>

section.tasks-controller {
    padding-top: 0;
}

</style>