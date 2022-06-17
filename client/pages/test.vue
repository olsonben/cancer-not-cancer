<template>
    <div>
        {{ fruits }}
    </div>
</template>

<script>
export default {
    layout: '',

    computed: {
        fruits() {
            // return this.$store.fruits.state.fruits
        },
    }
}
</script>