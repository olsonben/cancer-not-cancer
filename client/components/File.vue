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
    watch: {
        value: {
            handler(val) {
                console.log('file update')
                this.$emit('update')
            },
            deep: true
        }
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

.menu-list li ul {
    margin: 0;
}

.file-link {
    position: relative;
    
    &.folder {
        padding-right: 2rem;
    }
}

span.expander {
    font-weight: bold;

    border: 3px solid $primary;
    border-radius: 2px;
    border-right: 0;
    border-top: 0;
    height: 0.625em;
    margin-top: -0.4375em;
    // pointer-events: none;
    position: absolute;
    top: 50%;
    transform: rotate(-135deg);
    transform-origin: center;
    width: 0.625em;
    margin-left: 0.5rem;

    transition: transform 0.5s ease;

    &.is-expanded {
        transform: rotate(-45deg);
    }
}

ul {
    max-height: 0;
    overflow: hidden;
    transition: 0.5s ease;

    &.is-expanded {
        max-height: 15em;
    }
}

</style>
