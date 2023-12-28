<template>
    <div class="image-manager container">
        <h1 class="title">Image Manager</h1>

        <div class="box">
            Create a folder
            <div class="field-body pl-4 pb-2">
                <div class="field is-grouped">
                    <div class="control">
                        <input ref="folderName" class="input is-small" :class="{ 'blink': attention }" type="text" placeholder="Folder Name" v-model="createTagName">
                    </div>
                    <div class="control">
                        <button class="button is-small is-success has-text-weight-bold" type="button" @click="createTag">+</button>
                    </div>
                </div>
            </div>
            Mode
            <div class="field-body pl-4 pb-2">
                    <div class="field is-grouped">
                        <div class="control">
                            <button class="button is-small is-info has-text-weight-bold" type="button" @click="toggleMode" :disabled="!deleteMode">Edit Mode</button>
                        </div>
                        <div class="control">
                            <button class="button is-small is-danger has-text-weight-bold" type="button" @click="toggleMode" :disabled="deleteMode">Delete Mode</button>
                        </div>
                    </div>
                </div>
            <!-- TODO: This is essentially the ImagePicker can that component be used here? -->
            <div class="menu">
                <p class="menu-label">Images Folders: Drag files and folder where you want to move them.</p>
                <!-- TODO: Should probably be replaced with a app wide loading animation. -->
                <button v-if="loading" class="button is-loading is-medium is-info">loading</button>
                <ul class="menu-list">
                    <!-- https://stackoverflow.com/questions/42629509/you-are-binding-v-model-directly-to-a-v-for-iteration-alias -->
                    <li v-for="(file, index) in files" :key="fileKey(file)">
                        <folder v-if="isFolder(file)"
                        v-model="files[index]"
                        @change="masterChangeHandler"
                        :editable="!deleteMode"
                        :deletable="deleteMode"/>
                        <File v-else v-model="files[index]" :editable="!deleteMode" :deletable="deleteMode" @change="masterChangeHandler"></File>
                    </li>

                </ul>
            </div>
        </div>
    </div>
</template>

<script>
const api = useApi()

async function getFiles() {
    try {
        // TODO: change this over to an images/all request.
        // The task_id is arbitrary.
        const { response } = await api.GET('/tasks/images', {
            task_id: 14
        })
        return response.value
    } catch (error) {
        console.error('ImageManager fetch:', error.message)
    }
}

// Note: We start the initial api call here. We could wait for firstData in the
// setup function but that blocks the the entire page from displaying.
const firstData = getFiles()

export default {
    // Using setup because it fire just before data()
    async setup() {
        return {
            files: ref([]), // using ref to make our nest array reactive
            createTagName: '',
            attention: false,
            loading: true,
            deleteMode: ref(false),
        }
    },
    async created() {
        // We can asynchronously attach the data here
        this.refreshData(firstData)
    },
    methods: {
        async refreshData(dataPromise) {
            try {
                this.files = await dataPromise
                this.loading = false
            } catch (error) {
                console.error('ImageManager refreshData:', error.message)
            }
        },
        toggleMode() {
            console.log('toggle', this.deleteMode)
            this.deleteMode = !this.deleteMode
        },
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
            } else if (eventType === 'folderDeleteAll') {
                this.deleteAllContents(changeData.folder)
            }
         },
        async editTagName(tagId, newName) {
            console.log('editTagName:', tagId, newName)
            try {
                const { response } = await api.POST('/images/renameTag', {
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
                const { response } = await api.POST('images/moveTag', {
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
                if (this.createTagName !== '') {
                    const { response } = await api.POST('/images/tag', {
                        tagName: this.createTagName,
                    })
                    const newTagFolder = response.value
                    this.createTagName = ''
                    this.files.unshift(newTagFolder)
                } else {
                    // focus input
                    this.$refs.folderName.focus()
                    // add class that has animation to bring attention
                    this.attention = true
                    // remove animation class for future attention needs
                    setTimeout(() => {
                        this.attention = false
                    }, 750);
                }
            } catch (error) {
                console.error('ImageManager createTag:', error.message)
            }
        },
        async deleteTag(tagId) {
            try {
                const { response } = await api.POST('/images/deleteTag', {
                    tagId: tagId,
                })
            } catch (error) {
                console.error('ImageManager deleteTag:', error.message)
                // because folder delete can be nested, if we experience an error,
                // we should refresh the data for accuracy
                const newDataPromise = getFiles()
                this.refreshData(newDataPromise)
            }
        },
        getAllImageIds(folderObj, memo = []) {
            for (const file of folderObj.contents) {
                if (file.type === 'tag') {
                    this.getAllImageIds(file, memo)
                } else {
                    memo.push(file.id)
                }
            }
            return memo
        },
        getAllTagIds(folderObj, memo = []) {
            memo.push(folderObj.id)
            for (const file of folderObj.contents) {
                if (file.type === 'tag') {
                    this.getAllTagIds(file, memo)
                }
            }
            return memo
        },
        async deleteAllContents(folder) {
            try {
                console.log('deleteAllContents - folder id:', folder.id)
                const listOfImages = this.getAllImageIds(folder)
                const listOfTags = this.getAllTagIds(folder)
                console.log('Deleting...')
                console.log('images:', listOfImages)
                console.log('folders:', listOfTags)
                const { response } = await api.POST('/images/deleteAllIn', {
                    tags: listOfTags,
                    images: listOfImages,
                })

                this.files = this.files.filter((file) => {
                    return !(file.type == folder.type && file.id == folder.id)
                })
            } catch (error) {
                console.error('Error deleting folder contents.')
                console.error(error)
                const newDataPromise = getFiles()
                this.refreshData(newDataPromise)
            }
        },
        async editFileName(fileId, newName) {
            try {
                const { response } = await api.POST('/images/rename', {
                    imageId: fileId,
                    newName: newName,
                })
            } catch (error) {
                console.error('ImageManager editFileName:', error.message)
            }
        },
        async deleteFile(fileId) {
            try {
                // TODO: Add Unlock button that warns users.
                const { response } = await api.POST('/images/delete', {
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
                const { response } = await api.POST('images/move', {
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
input:focus {
    // color: hsl(199, 49%, 46%);
    border-color: $primary;
    box-shadow: 0 0 0 0.125em rgba(241, 241, 241, 0.25);
}

.blink {
    animation: blink 0.5s 1;
}

@keyframes blink {
    0% {
        scale: 1.1;
        border-color: $warning;
    }
    50% {
        scale: 1.0;
        border-color: $link;
    }
    51% {
        scale: 1.1;
        border-color: $warning;
    }
    100% {
        scale: 1.0;
        border-color: $link;
    }
}
</style>