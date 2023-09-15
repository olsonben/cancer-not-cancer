<template>
    <div class="image-manager container">
        <h1 class="title">Image Manager</h1>

        <div class="box">
            Create a folder
            <!-- <Adder :tags="tags" @update="updateTags"/> -->
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
const dummyTagsData = {
    applied: [
        { id: 1, name: "Tag A" },
        { id: 2, name: "Tag B" },
    ],
    available: [
        { id: 3, name: "Tag C" },
        { id: 4, name: "Tag D" },
    ]
}

export default {
    data() {
        return {
            tags: dummyTagsData,
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
            console.error(error)
        }
    },
    methods: {
        fileKey(file) {
            return `${file.type}-${file.id}`
        },
        isFolder(file) {
            return !!(file.type == 'tag')
            // return !!(file.contents && file.contents.length)
        },
        updateTags(tagData) {
            this.tags.applied = tagData.applied
            this.tags.available = tagData.available
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
            console.log('editTagName')
            console.log(tagId, newName)
            try {
                const response = await this.$axios.$post('/images/renameTag', {
                    tagId: tagId,
                    tagName: newName,
                })
                console.log(response)
            } catch (error) {
                console.error(error)
            }   
        },
        async moveTag(tagId, newParentTagId, oldParentTagId) {
            try {
                // TODO: Currently there isn't a way to make a folder a base folder, as in no parent.
                //  This is primarily because I haven't thought of a good way to do this with the UI.

                // console.log('Move folder:', tagId, 'to folder:', newParentTagId, 'oldParent:', oldParentTagId)
                let oldie
                if (oldParentTagId === null) {
                    oldie = { contents: this.files }
                } else {
                    oldie = this.getFolderById(oldParentTagId, this.files)
                }

                if (oldie === undefined) {
                    // Something is broken if this happens
                    console.log('old parent not found:', oldParentTagId)
                }

                const indx = oldie.contents.findIndex((file) => file.type === 'tag' && file.id === tagId)
                const moving = oldie.contents[indx]
                oldie.contents.splice(indx, 1)

                const dest = this.getFolderById(newParentTagId, this.files)
                if (dest === undefined) {
                    console.log('parent not found:', newParentTagId)
                }
                dest.contents.unshift(moving)

                const response = await this.$axios.post('images/moveTag', {
                    tagId: tagId,
                    oldParentTagId: oldParentTagId,
                    newParentTagId: newParentTagId
                })

            } catch (error) {
                console.log(error)
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
                    console.log('tag created')
                    this.files.unshift(newTagFolder)
                } else {
                    console.log('You need a tag name.')
                }
            } catch (error) {
                console.error(error)
            }
        },
        async deleteTag(tagId) {
            try {
                const response = await this.$axios.$post('/images/deleteTag', {
                    tagId: tagId,
                })
                // console.log(response)
            } catch (error) {
                console.error(error)
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
                console.error(error)
            }
        },
        async deleteFile(fileId) {
            try {
                console.log('Delete file:', fileId)
                const response = await this.$axios.$post('/images/delete', {
                    imageId: fileId
                })
            } catch (error) {
                console.error(error)
            }
        },
        async moveFile(fileId, folderId, oldParentTagId) {
            try {
                console.log('Move file:', fileId, 'to folder:', folderId, 'oldParent:', oldParentTagId)
                let oldie
                if (oldParentTagId === null) {
                    oldie = { contents: this.files }
                } else {
                    oldie = this.getFolderById(oldParentTagId, this.files)
                }

                if (oldie === undefined) {
                    // Something is broken if this happens
                    console.log('old parent not found:', oldParentTagId)
                }

                const indx = oldie.contents.findIndex((file) => file.type !== 'tag' && file.id === fileId)
                const moving = oldie.contents[indx]
                oldie.contents.splice(indx, 1)

                const dest = this.getFolderById(folderId, this.files)
                if (dest === undefined) {
                    console.log('parent not found:', folderId)
                }

                dest.contents.unshift(moving)

                const response = await this.$axios.$post('images/move', {
                    imageId: fileId,
                    oldParentTagId: oldParentTagId,
                    newParentTagId: folderId
                })
            } catch (error) {
                console.error(error)
            }
        }
    }
}
</script>

<style lang='scss'>
// .image-manager {
    
//     & ul {
//         position: relative;
//     }

//     & li a {

//     }

//     & li a::after {
//         content: "--";
//         position: absolute;
//         right: -10px;
//     }

// }
</style>