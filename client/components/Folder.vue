<template>
    <li>
        <div class="is-flex">
            <input v-if="!editable" type="checkbox" :value="inputName" v-model="checked" :indeterminate.prop="selectedState === 'partial'" @click="onCheck">
            <a
                class="file-link folder"
                :class="{ 'dragHover': dragOverStyle }"
                @click="clickToExpand"
                v-draggable="draggableConfig"
                @drop="onDrop" @dragover.prevent @dragenter="dragEnter" @dragleave="dragLeave"
            >
                {{ value.name }}
                <span v-if="value.contents.length > 0" class="expander" :class="{ 'is-expanded': expand }"></span>
                <span class="icon add"><i class="cnc-xmark"></i></span>
            </a>
            
            <button v-if="editable & !changeName" class="button is-small is-info" type="button" @click="changeName = !changeName">
                <span class="icon"><i class="cnc-pen-to-square"></i></span>
            </button>
            <button v-if="deletable" class="button is-small is-danger ml-1" type="button" @click="removeTag">
                <span class="icon"><i class="cnc-xmark"></i></span>
            </button>
            <div v-if="changeName" class="field-body pl-4">
                <div class="field is-grouped">
                    <div class="control">
                        <input class="input is-small" type="text" placeholder="New Folder Name" v-model="newName">
                    </div>
                    <div class="control">
                        <button class="button is-small is-warning" type="button" @click="setNewName">save</button>
                        <button class="button is-small is-danger" type="button" @click="changeName = !changeName"><span class="icon"><i class="cnc-xmark"></i></span></button>
                    </div>
                </div>
            </div>
        </div>
            <ul v-if="value.contents.length > 0" class="menu-list" :class="{ 'is-expanded': expand }">
                <!-- https://stackoverflow.com/questions/42629509/you-are-binding-v-model-directly-to-a-v-for-iteration-alias -->
                <li v-for="(file, index) in value.contents" :key="fileKey(file)">
                    <folder v-if="isFolder(file)" v-model="value.contents[index]" :editable="editable" @change="changeHandler" :parentTagId="value.id"/>
                    <File v-else v-model="value.contents[index]" :editable="editable" @change="changeHandler" :parentTagId="value.id"></File>
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
        value: Object,
        editable: {
            default: false,
            type: Boolean
        },
        parentTagId: {
            default: null,
            type: Number
        }
    },
    data() {
        return {
            expand: false,
            checked: !(this.$common.getSelectedState(this.value) === 'none'),
            changeName: false,
            newName: '',
            dragOverStyle: false
        }
    },
    watch: {
        selectedState(newState) {
            this.checked = !(newState === 'none')
        },
    },
    computed: {
        selectedState() {
            if (this.editable) {
                return 'none'
            }
            const state = this.$common.getSelectedState(this.value)
            return state
        },
        inputName() {
            return `tag-${this.value.id}`
        },
        deletable() {
            // console.log('deletable:', this.value.name, (this.editable && this.value.contents.length === 0))
            return this.editable && this.value.contents.length === 0
        },
        draggableConfig() {
            return {
                editable: this.editable,
                data: this.value,
                parentTagId: this.parentTagId
            }
        }

    },
    methods: {
        fileKey(file) {
            return `${file.type}-${file.id}`
        },
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
            return (file.type === 'tag')
        },
        setNewName() {
            console.log('Setting New Name')
            const changeData = {
                eventType: 'folderName',
                folderId: this.value.id,
                newName: this.newName
            }
            this.$emit('change', changeData)
            this.value.name = this.newName
            this.changeName = false
            this.newName = ''
        },
        removeTag() {
            const changeData = {
                eventType: 'folderDelete',
                folderId: this.value.id
            }
            this.$emit('change', changeData)
        },
        onDrop(event) {
            console.log('Drop Event on:', this.value.id, this.value.name)
            const { data, parentTagId } = JSON.parse(event.dataTransfer.getData('application/json'))
            if (data.type == 'tag') {
                if (data.id !== this.value.id) {
                    // console.log(`Move folder: ${data.name} into ${this.value.name}`)
                    const changeData = {
                        eventType: 'folderMove',
                        folderId: data.id,
                        newParentTagId: this.value.id,
                        oldParentTagId: parentTagId
                    }
                    this.$emit('change', changeData)
                } else {
                    // console.log('Can not add folder to self.')
                }
            } else {
                // console.log(`Move file: ${data.name} into ${this.value.name}`)
                if (parentTagId !== this.value.id) {   
                    const changeData = {
                        eventType: 'fileMove',
                        fileId: data.id,
                        newParentTagId: this.value.id,
                        oldParentTagId: parentTagId
                    }
                    this.$emit('change', changeData)
                } else {
                    // console.log('File already in this folder.')
                }
            }
            this.dragOverStyle = false
        },
        dragEnter(event) {
            event.preventDefault()
            const { data } = JSON.parse(event.dataTransfer.getData('application/json'))
            if (data.type === 'img' || data.id != this.value.id) {

                this.dragOverStyle = true
            }
        },
        dragLeave(event) {
            event.preventDefault
            this.dragOverStyle = false
        },
        changeHandler(changeData) {
            if (changeData.eventType === 'fileDelete') {
                this.value.contents = this.value.contents.filter((file) => {
                    return !(file.type == 'img' && file.id == changeData.fileId)
                })
            }
            if (changeData.eventType === 'folderDelete') {
                this.value.contents = this.value.contents.filter((file) => {
                    return !(file.type == 'tag' && file.id == changeData.folderId)
                })
            }
            this.$emit('change', changeData)
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

    & .icon.add {
        display: none;
    }

    &.dragHover {

        & .icon.add {
            display: flex;
            position: absolute;
            top: 0.125rem;
            right: 1.325rem;
            color: $link;
            font-size: 0.75rem;
            transform: rotate(45deg);
            height: 1rem;
            width: 1rem;
            background-color: $success;
            border-radius: 50%;
            border-color: $link;
            border-width: 1px;
            border-style: solid;
            box-shadow: 0px 2px 4px 0.5px rgba($cap-darknavbg,0.6); // add alpha val
        }

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
