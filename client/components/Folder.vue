<template>
    <li>
        <div class="is-flex">
            <input type="checkbox" :value="inputName" v-model="checked" :indeterminate.prop="selectedState === 'partial'" @click="onCheck">
            <a class="file-link folder" @click="clickToExpand">{{ value.name }}<span class="expander" :class="{ 'is-expanded': expand }"></span></a>
        </div>
            <ul v-if="value.contents.length > 0" class="menu-list" :class="{ 'is-expanded': expand }">
                <!-- https://stackoverflow.com/questions/42629509/you-are-binding-v-model-directly-to-a-v-for-iteration-alias -->
                <li v-for="(file, index) in value.contents" :key="file.id">
                    <folder v-if="isFolder(file)" v-model="value.contents[index]"/>
                    <File v-else v-model="value.contents[index]"></File>
                </li>
            </ul>
    </li>
</template>

<script>
// value == folderObject: {
//     id: 0,
//     name: 'folder name',
//     contents: [array of files and folders],
//     type: 'tag', // tag == folder
// }

export default {
    name: 'folder',
    props: {
        value: Object
    },
    data() {
        return {
            expand: false,
            checked: !(this.$common.getSelectedState(this.value) === 'none'),
        }
    },
    watch: {
        selectedState(newState) {
            this.checked = !(newState === 'none')
        },
    },
    computed: {
        selectedState() {
            const state = this.$common.getSelectedState(this.value)
            return state
        },
        inputName() {
            return `tag-${this.value.id}`
        },

    },
    methods: {
        onCheck(event) {
            if (this.checked) {
                // uncheck children
                this.checkChildren(this.value, false)
            } else {
                // check children
                this.checkChildren(this.value, true)
            }
        },
        checkChildren(folderObject, checkVal) {
            for (let child of folderObject.contents) {
                if (child.type === 'tag') {
                    this.checkChildren(child, checkVal)
                } else {
                    child.selected = checkVal
                }
            }
        },
        clickToExpand() {
            this.expand = !this.expand
        },
        isFolder(file) {
            return !!(file.contents && file.contents.length)
        },
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
        // TODO: figure out a way to get animations working with
        // long list expansion.
        max-height: fit-content;
    }
}

</style>
