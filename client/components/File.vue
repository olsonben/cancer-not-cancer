<template>
        <div class="is-flex">
            <input type="checkbox" :value="inputName" v-model="value.selected">
            <a class="file-link">{{ value.name }}</a>
        </div>
</template>

<script>
// EXAMPLE 'value' DATA
// {
//     id: 13,
//     name: 'blood_parasite_1.tiff',
//     type: 'img',
//     selected: false,
// }
export default {
    name: 'file',
    props: {
        value: Object,
    },
    computed: {
        inputName() {
            return `image-${this.value.id}`
        },
    },
    methods: {
    }
}
</script>

<style lang='scss' scoped>

.file-link {
    position: relative;
    
    &.folder {
        padding-right: 2rem;
    }
}

</style>
