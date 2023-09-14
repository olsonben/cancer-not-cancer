import { Router } from 'express'
import imageOps from '../dbOperations/imageOps.js'
import tagOps from '../dbOperations/tagOps.js'
import { uploadImages, removeFile, removeEmptyImageFolders } from '../lib/upload.js' // middleware to handle uploads
import { getIP } from '../lib/functions.js' // Helper functions

import * as path from 'path'

const imageBaseURL = process.env.IMAGE_URL

// Returns the url of the next image for grading.
const nextImage = async (req, res, next) => {
    let imageId = req.query.imageId
    console.log("GET: nextImage", imageId);
    try {
        const img = await imageOps.getNextImage(imageId)
        // TODO: Use URLs and Path Join instead of this logic
        let imagePath = img.path
        if (imageBaseURL.slice(-1) == "/") {
            if (img.path.charAt(0) == "/") {
                imagePath = imagePath.slice(1)
            }
        } else if (img.path.charAt(0) != "/") {
            imagePath = "/" + imagePath
        }

        let url = imageBaseURL + imagePath
        res.send({
            id: img.id, // imageID
            url: imageBaseURL + img.path
        })
    } catch (err) {
        next(err)
    }
}

const getNextImageIds = async (req, res, next) => {
    let userId = req.user.id
    let taskId = req.query.taskId
    try {
        const data = await imageOps.getNextImageIds(userId, taskId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
}

function createFolderStructure(filesArray, containerFolder) {
    let folderStructure = new Set()
    folderStructure.add(containerFolder)

    for (const file of filesArray) {
        if (file.success) {
            let folders = file.sanitizedName.split(path.sep)
            const fileName = folders.pop()
            for (let i = folders.length; i != 0; i--) {
                folderStructure.add(`${containerFolder}${path.sep}${folders.join(path.sep)}`)
                folders.pop()
            }
        }
    }

    return folderStructure
}

// Save successfull image uploads with the uploaders ip
async function saveUploadsToDb(req, res, next) {
    const ip = getIP(req)
    const date = new Date()
    const masterFolderName = `${date.toISOString().split('.')[0].replace('T', ' ')} Upload`

    const folderStructure = createFolderStructure(req.files, masterFolderName)

    try {
        const folders = await imageOps.saveFolderStructure(folderStructure, req.user.id)

        for (const file of req.files) {
            if (file.success) {
                try {

                    let location = file.sanitizedName.split(path.sep)
                    const originalFileName = location.pop()
                    const folderName = location.length > 0 ? `${masterFolderName}${path.sep}${location.join(path.sep)}` : masterFolderName
                    const folderId = folders[folderName]['id']

                    const insertImageSuccess = await imageOps.addImage(
                        file.relPath, // safe: created by the server
                        file.hash || null, // file contents hash
                        ip,
                        req.user.id,
                        originalFileName,
                        folderId
                    )

                    if (!insertImageSuccess) {
                        console.log('File already exists:', file.sanitizedName)
                        file.success = false
                        file.message = 'File already exists.'
                    }
                } catch (err) {
                    // database error
                    console.error(err)
                    file.success = false
                    file.message = 'Upload Error. Please try again later.'
                }
            }
        }

    } catch (error) {
        // handle errors
    }

    // TODO: if a file upload fails and there are no files associated with the
    // folder, then we should delete the folder
    next()
}

// If an image database save wasn't successful, we want to remove the file.
async function removeFailedImageSaves(req, res, next) {
    for (const file of req.files) {
        if (!file.success) {
            await removeFile(file.savePath)
        }
    }
    removeEmptyImageFolders()
    next()
}

// TODO: update the image pipeline to use unified error handler via `next(err)`
// Return to sender the status of the upload.
const saveImages = async (req, res, next) => {
    if (req.files.length === 0) {
        res.status(200).send('No files uploaded.')
    } else {
        const allowedKeys = ["filename", "mimeType", "id", "relPath", "success", "message"]
        const resultData = req.files.map((file) => {
            const filteredFile = Object.keys(file)
                .filter(key => allowedKeys.includes(key))
                .reduce((obj, key) => {
                    obj[key] = file[key]
                    return obj
                }, {})
            return filteredFile
        })

        res.status(200).send(resultData)
    }
}

const renameImage = async (req, res, next) => {
    const investigatorId = req.user.id
    const imageId = req.body.imageId
    const newName = req.body.newName
    console.log('renameImage:: User:', investigatorId, 'imageId:', imageId, 'newName:', newName)

    try {
        const renameSuccess = await imageOps.renameImage(imageId, newName, investigatorId)
        if (renameSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}


const moveImage = async (req, res, next) => {
    const investigatorId = req.user.id
    const imageId = req.body.imageId
    const oldParentTagId = req.body.oldParentTagId
    const newParentTagId = req.body.newParentTagId
    console.log('moveImage:: User:', investigatorId, 'imageId:', imageId, 'newParentTagId:', newParentTagId)

    try {
        const moveSuccess = await imageOps.moveImage(imageId, oldParentTagId, newParentTagId, investigatorId)
        if (moveSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const deleteImage = async (req, res, next) => {
    const investigatorId = req.user.id
    const imageId = req.body.imageId
    console.log('deleteImage:: User:', investigatorId, 'imageId:', imageId)

    try {
        const deleteSuccess = await imageOps.deleteImage(imageId, investigatorId)
        if (deleteSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

function createFolder(tag_id, tag_name, contents = []) {
    return {
        id: tag_id,
        name: tag_name,
        contents: contents,
        type: 'tag'
    }
}

const createTag = async (req, res, next) => {
    const investigatorId = req.user.id
    const tagName = req.body.tagName
    console.log('CreateTag:: User:', investigatorId, 'tagName:', tagName)
    try {
        const newTagId = await tagOps.createTag(tagName, investigatorId)
        const newFolder = createFolder(newTagId, tagName)
        res.send(newFolder)
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const updateTag = async (req, res, next) => {
    const investigatorId = req.user.id
    const tagId = req.body.tagId
    const tagName = req.body.tagName
    console.log('UpdateTag:: User:', investigatorId, 'tagId:', tagId, 'tagName:', tagName)

    try {
        const renameSuccess = await tagOps.renameTag(tagId, tagName, investigatorId)
        if (renameSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const moveTag = async (req, res, next) => {
    const investigatorId = req.user.id
    const tagId = req.body.tagId
    const oldParentTagId = req.body.oldParentTagId
    const newParentTagId = req.body.newParentTagId
    console.log('MoveTag:: User:', investigatorId, 'tagId:', tagId, 'parentTagId:', newParentTagId)

    try {
        const moveSuccess = tagOps.moveTag(tagId, oldParentTagId, newParentTagId)
        if (moveSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const deleteTag = async (req, res, next) => {
    const investigatorId = req.user.id
    const tagId = req.body.tagId

    console.log('DeleteTag:: User:', investigatorId, 'tagId:', tagId)
    try {
        const deleteSuccess = tagOps.deleteTag(tagId, investigatorId)
        if (deleteSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

// Join all the middleware pieces need for uploading images.
// This list is order specific.
const uploadAndSaveImages = Router().use([
    uploadImages,
    saveUploadsToDb,
    removeFailedImageSaves,
    saveImages
])

const imageController = {
    nextImage,
    uploadAndSaveImages,
    getNextImageIds,
    createTag,
    updateTag,
    moveTag,
    deleteTag,
    renameImage,
    moveImage,
    deleteImage
}

export default imageController