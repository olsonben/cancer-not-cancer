<script setup>
const api = useApi()

const { data: files, refresh: getFiles } = await api.GET('/tasks/images', { task_id: 14 }, null, null)

const createTagName = ref('')
const attention = ref(false)
const loading = ref(false)
const deleteMode = ref(false)

const toggleMode = () => {
    deleteMode.value = !deleteMode.value
}
const fileKey = (file) => {
    return `${file.type}-${file.id}`
}
const isFolder = (file) => {
    if (!(file.type == 'tag')) {
        console.warn('Warning: File not in a folder -', file.name)
    }
    return !!(file.type == 'tag')
}
const getFolderById = (tagId, contents) => {
    let result = contents.find((file) => file.type === 'tag' && file.id === tagId)
    if (result === undefined) {
        for (const file of contents) {
            if (file.type === 'tag') {
                result = getFolderById(tagId, file.contents)
                if (result) {
                    break
                }
            }
        }
    }
    return result
}

const editTagName = async (tagId, newName) => {
    console.log('editTagName:', tagId, newName)
    try {
        await api.POST('/images/renameTag', {
            tagId: tagId,
            tagName: newName,
        })
    } catch (error) {
        console.error('ImageManager editTagName:', error.message)
    }
}

const moveTag = async (tagId, newParentTagId, oldParentTagId) => {
    try {
        // TODO: Currently there isn't a way to make a folder a base folder, as in no parent.
        //  This is primarily because I haven't thought of a good way to do this with the UI.

        // console.log('Move folder:', tagId, 'to folder:', newParentTagId, 'oldParent:', oldParentTagId)
        let oldParent
        if (oldParentTagId === null) {
            oldParent = { contents: files.value }
        } else {
            oldParent = getFolderById(oldParentTagId, files.value)
        }

        if (oldParent === undefined) {
            // Something is broken if this happens
            throw new Error('Old parent tag/folder not found.')
        }

        const newParent = getFolderById(newParentTagId, files.value)
        if (newParent === undefined) {
            throw new Error('New parent tag/folder not found.')
        }

        // Move tag/folder locally
        const tagIndex = oldParent.contents.findIndex((file) => file.type === 'tag' && file.id === tagId)
        const movingTag = oldParent.contents[tagIndex]
        oldParent.contents.splice(tagIndex, 1)
        newParent.contents.unshift(movingTag)

        // Save changes remotely
        await api.POST('images/moveTag', {
            tagId: tagId,
            oldParentTagId: oldParentTagId,
            newParentTagId: newParentTagId
        })
    } catch (error) {
        console.error('ImageManager moveTag:', error.message)
    }
}

// Template Ref
const folderName = ref(null)
const createTag = async () => {
    try {
        if (createTagName.value !== '') {
            const newTagFolder = await api.POST('/images/tag', {
                tagName: createTagName.value,
            })
            createTagName.value = ''
            files.value.unshift(newTagFolder)
        } else {
            // focus input
            folderName.focus()
            // add class that has animation to bring attention
            attention.value = true
            // remove animation class for future attention needs
            setTimeout(() => {
                attention.value = false
            }, 750);
        }
    } catch (error) {
        console.error('ImageManager createTag:', error.message)
    }
}

const deleteTag = async (tagId) => {
    try {
        await api.POST('/images/deleteTag', {
            tagId: tagId,
        })
    } catch (error) {
        console.error('ImageManager deleteTag:', error.message)
        // because folder delete can be nested, if we experience an error,
        // we should refresh the data for accuracy
        getFiles()
    }
}

const getAllImageIds = (folderObj, memo = []) => {
    for (const file of folderObj.contents) {
        if (file.type === 'tag') {
            getAllImageIds(file, memo)
        } else {
            memo.push(file.id)
        }
    }
    return memo
}

const getAllTagIds = (folderObj, memo = []) => {
    memo.push(folderObj.id)
    for (const file of folderObj.contents) {
        if (file.type === 'tag') {
            getAllTagIds(file, memo)
        }
    }
    return memo
}

const deleteAllContents = async (folder) => {
    try {
        console.log('deleteAllContents - folder id:', folder.id)
        const listOfImages = getAllImageIds(folder)
        const listOfTags = getAllTagIds(folder)
        console.log('Deleting...')
        console.log('images:', listOfImages)
        console.log('folders:', listOfTags)
        await api.POST('/images/deleteAllIn', {
            tags: listOfTags,
            images: listOfImages,
        })

        files.value = files.value.filter((file) => {
            return !(file.type == folder.type && file.id == folder.id)
        })
    } catch (error) {
        console.error('Error deleting folder contents.')
        console.error(error)
        getFiles()
    }
}

const editFileName = async (fileId, newName) => {
    try {
        await api.POST('/images/rename', {
            imageId: fileId,
            newName: newName,
        })
    } catch (error) {
        console.error('ImageManager editFileName:', error.message)
    }
}

const deleteFile = async (fileId) => {
    try {
        // TODO: Add Unlock button that warns users.
        await api.POST('/images/delete', {
            imageId: fileId
        })
    } catch (error) {
        console.error('ImageManager deleteFile:', error.message)
    }
}

const moveFile = async (fileId, newParentTagId, oldParentTagId) => {
    try {
        // console.log('Move file:', fileId, 'to folder:', newParentTagId, 'oldParent:', oldParentTagId)
        let oldParent
        if (oldParentTagId === null) {
            oldParent = { contents: files.value }
        } else {
            oldParent = getFolderById(oldParentTagId, files.value)
        }

        if (oldParent === undefined) {
            // Something is broken if this happens
            throw new Error('Old parent tag/folder not found.')
        }

        const newParent = getFolderById(newParentTagId, files.value)
        if (newParent === undefined) {
            throw new Error('New parent tag/folder not found.')
        }

        // Move file locally
        const fileIndex = oldParent.contents.findIndex((file) => file.type !== 'tag' && file.id === fileId)
        const movingFile = oldParent.contents[fileIndex]
        oldParent.contents.splice(fileIndex, 1)
        newParent.contents.unshift(movingFile)

        // Save move remotely
        await api.POST('images/move', {
            imageId: fileId,
            oldParentTagId: oldParentTagId,
            newParentTagId: newParentTagId
        })
    } catch (error) {
        console.error('ImageManager moveFile:', error.message)
    }
}

const masterChangeHandler = async (changeData) => {
    const { eventType } = changeData
    if (eventType === 'folderMove') {
        moveTag(changeData.folderId, changeData.newParentTagId, changeData.oldParentTagId)
    } else if (eventType === 'fileMove') {
        moveFile(changeData.fileId, changeData.newParentTagId, changeData.oldParentTagId)
    } else if (eventType === 'folderName') {
        editTagName(changeData.folderId, changeData.newName)
    } else if (eventType === 'fileName') {
        editFileName(changeData.fileId, changeData.newName)
    } else if (eventType === 'folderDelete') {
        files.value = files.value.filter((file) => {
            return !(file.type == 'tag' && file.id == changeData.folderId)
        })
        deleteTag(changeData.folderId)
    } else if (eventType === 'fileDelete') {
        files.value = files.value.filter((file) => {
            return !(file.type == 'img' && file.id == changeData.fileId)
        })
        deleteFile(changeData.fileId)
    } else if (eventType === 'folderDeleteAll') {
        deleteAllContents(changeData.folder)
    }
}

/**
 * TODO: try manual lazy loading folder and file components
 * <component
      v-if="isOpen"
      :is="getComponent(item)"
      :item="item"
      v-for="item in children"
      :key="item.id"
    />

    getComponent(item) {
      return item.type === 'folder'
        ? () => import('./Folder.vue')
        : () => import('./File.vue');
    },
 */

/**
 * NOTES from template:
 * 
 * <!-- TODO: This is essentially the ImagePicker can that component be used here? -->
 * <div class="menu">
 * 
 * <!-- TODO: Should probably be replaced with a app wide loading animation. -->
 * <button v-if="loading" class="button is-loading is-medium is-info">loading</button>
 * 
 * <!-- https://stackoverflow.com/questions/42629509/you-are-binding-v-model-directly-to-a-v-for-iteration-alias -->
 * <ul class="menu-list">
 *      <li v-for="(file, index) in files" :key="fileKey(file)">
 */
</script>

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
            <span v-if="!deleteMode">In Edit </span><span v-else>In Delete </span>Mode
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
            <div class="menu">
                <p v-if="!deleteMode" class="menu-label">Images Folders: Drag files and folder where you want to move them.</p>
                <p v-else class="menu-label"><span class="has-text-danger">WARNING:</span> Deleting folders and images will permanently remove files, including images associated with existing tasks.</p>
                <button v-if="loading" class="button is-loading is-medium is-info">loading</button>
                <ul class="menu-list">
                    <li v-for="(file, index) in files" :key="fileKey(file)">
                        <Folder v-if="isFolder(file)"
                        v-model="files[index]"
                        @change="masterChangeHandler"
                        :editable="!deleteMode"
                        :deletable="deleteMode"/>
                    </li>

                </ul>
            </div>
        </div>
    </div>
</template>

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