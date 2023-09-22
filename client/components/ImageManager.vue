<template>
    <div class="image-manager container">
        <h1 class="title">Image Manager</h1>

        <div class="box">
            Create a folder
             <div class="field-body pl-4">
                <div class="field is-grouped">
                    <div class="control">
                        <input class="input is-small" type="text" placeholder="Folder Name" v-model="createTagName">
                    </div>
                    <div class="control">
                        <button class="button is-small is-success" type="button" @click="createTag">+</button>
                    </div>
                </div>
            </div>
            <div class="menu">
                <p class="menu-label">Images Folders: Drag files and folder where you want to move them.</p>
                <ul class="menu-list">
                    <!-- https://stackoverflow.com/questions/42629509/you-are-binding-v-model-directly-to-a-v-for-iteration-alias -->
                    <li v-for="(file, index) in files" :key="fileKey(file)">
                        <folder v-if="isFolder(file)"
                        v-model="files[index]"
                        @change="masterChangeHandler"
                        :editable="true"/>
                        <File v-else v-model="files[index]" :editable="true" @change="masterChangeHandler"></File>
                    </li>

                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            files: [],
            createTagName: '',
        }
    },
    async fetch() {
        try {
            // TODO: change this over to an images/all request.
            // The task_id is arbitrary.
            const images = await this.$axios.$get('/tasks/images', {
                params: {
                    task_id: 14
                }
            })
            this.files = images
        } catch (error) {
            console.error('ImageManager fetch:', error.message)
        }
    },
    methods: {
        fileKey(file) {
            return `${file.type}-${file.id}`
        },
        isFolder(file) {
            return !!(file.type == 'tag')
        },
        getFolderById(tagId, contents) {
            let result = contents.find((file) => file.type === 'tag' && file.id === tagId)
            if (result === undefined) {
                for (const file of contents) {
                    if (file.type === 'tag') {
                        result = this.getFolderById(tagId, file.contents)
                        if (result) {
                            break
                        }
                    }
                }
            }
            return result
        },
        async masterChangeHandler(changeData) {
            const { eventType } = changeData
            if (eventType === 'folderMove') {
                this.moveTag(changeData.folderId, changeData.newParentTagId, changeData.oldParentTagId)
            } else if (eventType === 'fileMove') {
                this.moveFile(changeData.fileId, changeData.newParentTagId, changeData.oldParentTagId)
            } else if (eventType === 'folderName') {
                this.editTagName(changeData.folderId, changeData.newName)
            } else if (eventType === 'fileName') {
                this.editFileName(changeData.fileId, changeData.newName)
            } else if (eventType === 'folderDelete') {
                this.files = this.files.filter((file) => {
                    return !(file.type == 'tag' && file.id == changeData.folderId)
                })
                this.deleteTag(changeData.folderId)
            } else if (eventType === 'fileDelete') {
                this.files = this.files.filter((file) => {
                    return !(file.type == 'img' && file.id == changeData.fileId)
                })
                this.deleteFile(changeData.fileId)
            }
         },
        async editTagName(tagId, newName) {
            console.log('editTagName:', tagId, newName)
            try {
                const response = await this.$axios.$post('/images/renameTag', {
                    tagId: tagId,
                    tagName: newName,
                })
            } catch (error) {
                console.error('ImageManager editTagName:', error.message)
            }   
        },
        async moveTag(tagId, newParentTagId, oldParentTagId) {
            try {
                // TODO: Currently there isn't a way to make a folder a base folder, as in no parent.
                //  This is primarily because I haven't thought of a good way to do this with the UI.

                // console.log('Move folder:', tagId, 'to folder:', newParentTagId, 'oldParent:', oldParentTagId)
                let oldParent
                if (oldParentTagId === null) {
                    oldParent = { contents: this.files }
                } else {
                    oldParent = this.getFolderById(oldParentTagId, this.files)
                }

                if (oldParent === undefined) {
                    // Something is broken if this happens
                    throw new Error('Old parent tag/folder not found.')
                }

                const newParent = this.getFolderById(newParentTagId, this.files)
                if (newParent === undefined) {
                    throw new Error('New parent tag/folder not found.')
                }

                // Move tag/folder locally
                const tagIndex = oldParent.contents.findIndex((file) => file.type === 'tag' && file.id === tagId)
                const movingTag = oldParent.contents[tagIndex]
                oldParent.contents.splice(tagIndex, 1)
                newParent.contents.unshift(movingTag)

                // Save changes remotely
                const response = await this.$axios.post('images/moveTag', {
                    tagId: tagId,
                    oldParentTagId: oldParentTagId,
                    newParentTagId: newParentTagId
                })
            } catch (error) {
                console.error('ImageManager moveTag:', error.message)
            }
        },
        async createTag() {
            try {
                // TODO: Look into prevent no name tag creation in the DB.
                if (this.createTagName !== '') {
                    const newTagFolder = await this.$axios.$post('/images/tag', {
                        tagName: this.createTagName,
                    })
                    this.createTagName = ''
                    this.files.unshift(newTagFolder)
                } else {
                    // TODO: Add input focus and highlighting to notify user.
                    console.log('You need a tag name.')
                }
            } catch (error) {
                console.error('ImageManager createTag:', error.message)
            }
        },
        async deleteTag(tagId) {
            try {
                const response = await this.$axios.$post('/images/deleteTag', {
                    tagId: tagId,
                })
            } catch (error) {
                console.error('ImageManager deleteTag:', error.message)
            }
        },
        async editFileName(fileId, newName) {
            try {
                console.log('Edit file name:', fileId, newName)
                const response = await this.$axios.$post('/images/rename', {
                    imageId: fileId,
                    newName: newName,
                })
            } catch (error) {
                console.error('ImageManager editFileName:', error.message)
            }
        },
        async deleteFile(fileId) {
            try {
                console.log('Delete file:', fileId)
                const response = await this.$axios.$post('/images/delete', {
                    imageId: fileId
                })
            } catch (error) {
                console.error('ImageManager deleteFile:', error.message)
            }
        },
        async moveFile(fileId, newParentTagId, oldParentTagId) {
            try {
                // console.log('Move file:', fileId, 'to folder:', newParentTagId, 'oldParent:', oldParentTagId)
                let oldParent
                if (oldParentTagId === null) {
                    oldParent = { contents: this.files }
                } else {
                    oldParent = this.getFolderById(oldParentTagId, this.files)
                }

                if (oldParent === undefined) {
                    // Something is broken if this happens
                    throw new Error('Old parent tag/folder not found.')
                }

                const newParent = this.getFolderById(newParentTagId, this.files)
                if (newParent === undefined) {
                    throw new Error('New parent tag/folder not found.')
                }

                // Move file locally
                const fileIndex = oldParent.contents.findIndex((file) => file.type !== 'tag' && file.id === fileId)
                const movingFile = oldParent.contents[fileIndex]
                oldParent.contents.splice(fileIndex, 1)
                newParent.contents.unshift(movingFile)

                // Save move remotely
                const response = await this.$axios.$post('images/move', {
                    imageId: fileId,
                    oldParentTagId: oldParentTagId,
                    newParentTagId: newParentTagId
                })
            } catch (error) {
                console.error('ImageManager moveFile:', error.message)
            }
        }
    }
}
</script>

<style lang='scss'>

</style>