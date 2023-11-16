<template>
        <div class="is-flex">
            <input v-if="!editable" type="checkbox" :value="inputName" v-model="modelValue.selected">
            <a class="file-link" v-draggable="draggableConfig" @drop.prevent @dragover.prevent @dragenter.prevent @dragleave.prevent>{{ modelValue.name }}</a>


            <button v-if="editable & !changeName" class="button is-small is-info" type="button" @click="changeName = !changeName">
                <span class="icon"><i class="cnc-pen-to-square"></i></span>
            </button>
            <button v-if="editable & !changeName" class="button is-small is-danger ml-1" type="button" @click="removeFile">
                <span class="icon"><i class="cnc-xmark"></i></span>
            </button>


            <div v-if="changeName" class="field-body pl-4">
                <div class="field is-grouped">
                    <div class="control">
                        <input class="input is-small" type="text" placeholder="New File Name" v-model="newName">
                    </div>
                    <div class="control">
                        <button class="button is-small is-warning" type="button" @click="setNewName">save</button>
                        <button class="button is-small is-danger" type="button" @click="changeName = !changeName"><span class="icon"><i class="cnc-xmark"></i></span></button>
                    </div>
                </div>
            </div>
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
        modelValue: Object,
        editable: {
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
            changeName: false,
            newName: ''
        }
    },
    computed: {
        inputName() {
            return `image-${this.modelValue.id}`
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
        setNewName() {
            const extension = this.modelValue.name.substring(this.modelValue.name.lastIndexOf('.'))

            if (!this.newName.endsWith(extension)) {
                // Keep the original file extension
                this.newName = this.newName + extension
            }

            const changeData = {
                eventType: 'fileName',
                fileId: this.modelValue.id,
                newName: this.newName
            }
            this.$emit('change', changeData)
            this.modelValue.name = this.newName
            this.changeName = false
            this.newName = ''
        },
        removeFile() {
            const changeData = {
                eventType: 'fileDelete',
                fileId: this.modelValue.id
            }
            this.$emit('change', changeData)
        },
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
