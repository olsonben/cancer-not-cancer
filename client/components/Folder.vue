<template>
    <li>
        <div class="is-flex">
            <input v-if="!editable & !deletable" type="checkbox" :value="inputName" v-model="checked" :indeterminate.prop="selectedState === 'partial'" @click="onCheck">
            <a
                class="file-link folder"
                :class="{ 'dragHover': dragOverStyle }"
                @click="clickToExpand"
                v-draggable="draggableConfig"
                @drop="onDrop" @dragover.prevent @dragenter="dragEnter" @dragleave="dragLeave"
            >
                {{ modelValue.name }}
                <span v-if="modelValue.contents.length > 0" class="expander" :class="{ 'is-expanded': expand }"></span>
                <span class="icon add"><fa-icon :icon="['fas', 'xmark']" /></span>
            </a>
            
            <button v-if="editable & !changeName" class="button is-small is-info" type="button" @click="changeName = !changeName">
                <span class="icon"><fa-icon :icon="['far', 'pen-to-square']" /></span>
            </button>
            <button v-if="deletable" class="button is-small is-danger ml-1" type="button" @click="removeTag">
                <span class="icon"><fa-icon :icon="['fas', 'xmark']" /></span>
            </button>
            <div v-if="changeName" class="field-body pl-4">
                <div class="field is-grouped">
                    <div class="control">
                        <input class="input is-small" type="text" placeholder="New Folder Name" v-model="newName">
                    </div>
                    <div class="control">
                        <button class="button is-small is-warning" type="button" @click="setNewName">save</button>
                        <button class="button is-small is-danger" type="button" @click="changeName = !changeName"><span class="icon"><fa-icon :icon="['fas', 'xmark']" /></span></button>
                    </div>
                </div>
            </div>
        </div>
            <ul v-if="modelValue.contents.length > 0" class="menu-list" :class="{ 'is-expanded': expand }">
                <!-- https://stackoverflow.com/questions/42629509/you-are-binding-v-model-directly-to-a-v-for-iteration-alias -->
                <li v-for="(file, index) in modelValue.contents" :key="fileKey(file)">
                    <folder v-if="isFolder(file)" v-model="modelValue.contents[index]" :editable="editable" :deletable="deletable" @change="changeHandler" :parentTagId="modelValue.id"/>
                    <File v-else v-model="modelValue.contents[index]" :editable="editable" :deletable="deletable" @change="changeHandler" :parentTagId="modelValue.id"></File>
                </li>
            </ul>
    </li>
</template>

<script>
// EXAMPLE 'value' DATA (folderObject): {
//     id: 0,
//     name: 'folder name',
//     contents: [array of files and folders],
//     type: 'tag', // tag == folder
// }
const fileTools = useFileTools()

export default {
    name: 'folder',
    props: {
        modelValue: Object,
        editable: {
            default: false,
            type: Boolean
        },
        deletable: {
            default: false,
            type: Boolean
        },
        parentTagId: {
            default: null,
            type: Number
        }
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            expand: false,
            checked: !(fileTools.getSelectedState(this.modelValue) === 'none'),
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
            const state = fileTools.getSelectedState(this.modelValue)
            return state
        },
        inputName() {
            return `tag-${this.modelValue.id}`
        },
        draggableConfig() {
            return {
                editable: this.editable,
                data: this.modelValue,
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
                this.checkChildren(this.modelValue, false)
            } else {
                // check children
                this.checkChildren(this.modelValue, true)
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
            const changeData = {
                eventType: 'folderName',
                folderId: this.modelValue.id,
                newName: this.newName
            }
            this.$emit('change', changeData)
            this.modelValue.name = this.newName
            this.changeName = false
            this.newName = ''
        },
        removeTag() {
            if (this.modelValue.contents.length > 0) {
                console.log('You are about to delete all the files and this folder.')
                const changeData = {
                    eventType: 'folderDeleteAll',
                    folder: this.modelValue
                }
                this.$emit('change', changeData)
            } else {
                console.log('removeTag!')
                const changeData = {
                    eventType: 'folderDelete',
                    folderId: this.modelValue.id
                }
                this.$emit('change', changeData)
            }
        },
        onDrop(event) {
            const { data, parentTagId } = JSON.parse(event.dataTransfer.getData('application/json'))
            if (data.type == 'tag') {
                // A folder was dropped on this folder.
                if (data.id !== this.modelValue.id) { // if not self
                    const changeData = {
                        eventType: 'folderMove',
                        folderId: data.id,
                        newParentTagId: this.modelValue.id,
                        oldParentTagId: parentTagId
                    }
                    this.$emit('change', changeData)
                } 
            } else {
                // A file was dropped on this folder.
                if (parentTagId !== this.modelValue.id) {  // if file not already in this folder  
                    const changeData = {
                        eventType: 'fileMove',
                        fileId: data.id,
                        newParentTagId: this.modelValue.id,
                        oldParentTagId: parentTagId
                    }
                    this.$emit('change', changeData)
                }
            }
            this.dragOverStyle = false
        },
        dragEnter(event) {
            event.preventDefault()
            const { data } = JSON.parse(event.dataTransfer.getData('application/json'))
            // Add '+' icon to indicate droppable area.
            if (data.type === 'img' || data.id != this.modelValue.id) { // if dragged item is not self
                this.dragOverStyle = true
            }
        },
        dragLeave(event) {
            event.preventDefault
            this.dragOverStyle = false
        },
        changeHandler(changeData) {
            // We catch incoming change events. Make necessary changes before passing change event up
            if (changeData.eventType === 'fileDelete') {
                this.modelValue.contents = this.modelValue.contents.filter((file) => {
                    return !(file.type == 'img' && file.id == changeData.fileId)
                })
            }
            if (changeData.eventType === 'folderDelete') {
                this.modelValue.contents = this.modelValue.contents.filter((file) => {
                    return !(file.type == 'tag' && file.id == changeData.folderId)
                })
            }
            if (changeData.eventType === 'folderDeleteAll') {
                this.modelValue.contents = this.modelValue.contents.filter((file) => {
                    return !(file.type == 'tag' && file.id == changeData.folder.id)
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
            box-shadow: 0px 2px 4px 0.5px rgba($dark-grey,0.6); // add alpha val
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
