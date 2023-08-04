<!-- https://dev.to/proticm/vue-and-recursive-components-15n7 -->
<template>
    <li>
        <div class="is-flex">

            <input type="checkbox" :value="inputName" v-model="selectedVal">
            <a class="file-link" @click="clickToExpand">{{ file.name }}<span v-if="isFolder" class="expander" :class="{ 'is-expanded': expand }"></span></a>
        </div>
            <ul v-if="isFolder" class="menu-list" :class="{ 'is-expanded': expand }">
                <file v-for="child in file.contents" :key="child.id" v-bind:file="child" @selected="itemSelected"></file>
        </ul>
    </li>
</template>

<script>
export default {
    name: 'file',
    props: {
        file: Object,
    },
    data() {
        return {
            expand: false,
            selectedVal: [],
            childSelected: new Set()
        }
    },
    watch: {
        selectedVal: {
            handler(newSelectedValue) {
                if (newSelectedValue.length === 1) {
                    console.log('id:', this.inputName,',', this.file.name, 'selected')

                    this.$emit('selected', this.selectedVal[0])
                } else {
                    this.$emit('selected')
                }
            }
        }
    },
    computed: {
        isFolder() {
            return !!(this.file.contents && this.file.contents.length)
        },
        inputName() {
            if (this.file.contents !== undefined) {
                return `tag-${this.file.id}`
            } else {
                return `image-${this.file.id}`
            }
        }
    },
    methods: {
        clickToExpand() {
            console.log(this.file.name, 'toggled')
            this.expand = !this.expand
        },
        itemSelected(selectedItem=null) {
            // ****************
            // TODO: Work out how to update parents recursively!!!
            // ****************

        //     if 
        //     let selected = new Set(this.selectedVal)
        //     // join sets
        //     selected = [...selected, ...childSelectedValues]
        //     this.$emit('selected', selected)
        }
    }
}
</script>

<style lang='scss' scoped>

.menu-list li ul {
    margin: 0;
}

.file-link {
    position: relative;
}

span.expander {
    font-weight: bold;

    border: 3px solid $primary;
    border-radius: 2px;
    border-right: 0;
    border-top: 0;
    height: 0.625em;
    margin-top: -0.4375em;
    pointer-events: none;
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
