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
            <!-- TODO: This is essentially the ImagePicker can that component be used here? -->
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
const start = Date.now()
// TODO: VUE3 declare all emits for the app.
// TODO: Determine if most api calls should be cached or not, Vue3/nuxt does by
// default now, and thus we will have to specifically key out api requests.
const api = useApi()

async function getData() {
    try {
        // TODO: change this over to an images/all request.
        // The task_id is arbitrary.
        const { response } = await api.GET('/tasks/images', {
            task_id: 14
        })
        const fetchTime = Date.now() - start
        console.log(`Fetch Time: ${fetchTime} ms`)
        return response.value
    } catch (error) {
        console.error('ImageManager fetch:', error.message)
    }
}

// Note: We start the initial api call here, then await the data in the setup.
// This is the fastest way to load data(that I found) using the options api, and
// it resembles the composition api.
const firstData = getData()

export default {
    // Using setup because it fire just before data
    async setup() {
        return {
            // files: await firstData, // awaiting promise resolve
            // files: new Proxy([], {
            //     _isReadonly: false,
            //     _shallow: false
            // }),
            files: ref([]),
            createTagName: '',
            attention: false
        }
    },
    // Notes: we know that this.appendData is non-blocking, fetching data, the telling
    // it to append in the created function. Using await instead blocks created.
    // TODO: Test the time from start to data change in the watch method, making sure
    // to calc at the second update. Then try the different methods
    async created() {
        const cTime = Date.now()
        this.appendData()

        // const data = await firstData
        // this.files.push(...data)
        // const dataTime = Date.now() - start
        // console.log(`Data Time: ${dataTime} ms`)
        // console.log('beforeCreate')
        // const dTime = Date.now() - cTime
        // console.log(`cd Time: ${dTime} ms`)


        // console.log(this)
    }, 
    async mounted() {
        
        // const data = await firstData
        // this.files = [...toRaw(this.files), data]
        // console.log(this.files)
        
        // const test = new Proxy([], {
        //     _isReadonly: false,
        //     _shallow: false
        // })
        // console.log(test)
        // console.log(JSON.stringify(this.files))
        const mountedTime = Date.now() - start
        console.log(`Mount Time: ${mountedTime} ms`)
        // console.log(`Data Time: ${dataTime} ms`)
        // console.log('mounted()')
        // // this.refreshData()
        // setTimeout(() => {
        //     this.testMethod()
        // }, 3000);
    },
    watch: {
        files: {
            immediate: true,
            deep: true,
            handler(newFiles, oldFiles) {
                if (oldFiles == undefined) {
                    console.log('init files Change')
                } else {
                    const dataTime = Date.now() - start
                    console.log(`Data Time: ${dataTime} ms`)
                    console.log('files Change')
                }
                // console.log(JSON.stringify(oldFiles))
                // console.log(JSON.stringify(newFiles))
                // this.headers = newTableData.columns
                // this.body = newTableData.bodyData
                // this.indexProp = newTableData.indexProp
                // this.order = newTableData.order
            }
        }
    },
    methods: {
        async appendData() {
            try {
                const data = await firstData
                this.files.push(...data)
                // const dataTime = Date.now() - start
                // console.log(`Data Time: ${dataTime} ms`)
            } catch (error) {
                console.log(error)
            }
        },
        testMethod() {
            console.log('testMethod')
            this.files.splice(0)
            console.log(JSON.stringify(this.files))
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
                this.refreshData()
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
        },
        async refreshData() {
            try {
                console.log('refreshDat')
                // TODO: change this over to an images/all request.
                // The task_id is arbitrary.
                const { response } = await api.GET('/tasks/images', {
                    task_id: 14
                })
                console.log(response.value)
                const images = response.value
                this.files = images
            } catch (error) {
                console.error('ImageManager fetch:', error.message)
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