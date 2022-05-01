<script>
export default {
    props: {
        title: {
            type: String,
            default: 'Tab'
        }
    },

    data() {
        return {
            isActive: true
        }
    }
}
</script>

<template>
    <div v-show="isActive">
        <slot></slot>
    </div>
</template>
