import { Router } from 'express'
import imageOps from '../dbOperations/imageOps.js'
import tagOps from '../dbOperations/tagOps.js'
import { uploadImages, removeFile, removeEmptyImageFolders } from '../lib/upload.js' // middleware to handle uploads
import { getIP, virtualFileSystem as VFS } from '../lib/functions.js' // Helper functions

import * as path from 'path'

const imageBaseURL = process.env.IMAGE_URL

/** Express.js API endpoint handlers for image related requests. */
const imageController = {
    /**
     * Asynchronously retrieves the next image url based on the provided imageId.
     *
     * @param {express.Request} req - The Express request object.
     * @param {express.Response} res - The Express response object.
     * @param {express.NextFunction} next - The Express next function for error handling.
     * @returns {Promise<void>} A Promise that resolves when the operation is complete.
     * @throws {Error} If an error occurs while retrieving the next image.
     */
    async nextImage(req, res, next) {
        let imageId = req.query.imageId
        console.log("GET: nextImage", imageId);
        try {
            const img = await imageOps.getNextImage(imageId)
            const pathUrl = new URL(img.path, imageBaseURL)
            
            res.send({
                id: img.id, // imageID
                url: pathUrl.href
            })
        } catch (err) {
            next(err)
        }
    },
    
    /** Retrieve a queue of next image ids for grading based on taskId. */
    async getNextImageIds(req, res, next) {
        let userId = req.user.id
        let taskId = req.query.taskId
        try {
            const data = await imageOps.getNextImageIds(userId, taskId)
            res.send(data)
        } catch (err) {
            res.status(500).send({})
        }
    },
    
    /** Save successfull image uploads with the uploaders ip */
    async saveUploadsToDb(req, res, next) {
        const ip = getIP(req)
        const date = new Date()
        const masterFolderName = `${date.toISOString().split('.')[0].replace('T', ' ')} Upload`
        
        const folderStructure = VFS.createFolderStructure(req.files, masterFolderName)
        
        try {
            const folders = await imageOps.saveFolderStructure(folderStructure, req.user.id)
            
            for (const file of req.files) {
                if (file.success) {
                    try {
                        
                        let location = file.sanitizedName.split(path.sep)
                        const originalFileName = location.pop()
                        const folderName = path.join(masterFolderName, ...location)
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
                throw error
        }
            
        // TODO: if a file upload fails and there are no files associated with the
        // folder, then we should delete the folder
        next()
    },
        
    /** If an image database save wasn't successful, we want to remove the file. */
    async removeFailedImageSaves(req, res, next) {
        for (const file of req.files) {
            if (!file.success) {
                await removeFile(file.savePath)
            }
        }
        removeEmptyImageFolders()
        next()
    },
        
    /** Delete a file at the relative file path.
     * @param {String} filePath - should be relative with filename and extension.
     */
    async deleteFile(filePath) {
        const absoluteFilePath = path.join(process.env.IMAGES_DIR, filePath)
        
        try {
            await removeFile(absoluteFilePath)
            removeEmptyImageFolders()
        } catch (error) {
            console.log('Error deleting file:', absoluteFilePath)
            throw error
        }
    },
        
    // TODO: update the image pipeline to use unified error handler via `next(err)`
    /** Filters file upload output to relavent data only (Return to sender the
     * status of the upload). */
    async saveImages(req, res, next) {
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
    },
    /** Rename a file based on file id and owner(investigator) id. */
    async renameImage(req, res, next) {
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
    },
    /** Move image to a different folder/tag. This is virtual and doesn't
     * actually move the file on the file system.
     */
    async moveImage(req, res, next) {
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
    },
    /** Delete image from file system, then removes image from database. */
    async deleteImage(req, res, next) {
        const investigatorId = req.user.id
        const imageId = req.body.imageId
        console.log('deleteImage:: User:', investigatorId, 'imageId:', imageId)
        
        try {
            const img = await imageOps.getNextImage(imageId)
            await deleteFile(img.path)
            const deleteSuccess = await imageOps.deleteImage(imageId, investigatorId)
            if (deleteSuccess) {
                res.sendStatus(200)
            }
        } catch (err) {
            console.log(err)
            res.status(500).send({})
        }
    },
    /** Create a tag/folder. */
    async createTag(req, res, next) {
        const investigatorId = req.user.id
        const tagName = req.body.tagName
        console.log('CreateTag:: User:', investigatorId, 'tagName:', tagName)
        try {
            const newTagId = await tagOps.createTag(tagName, investigatorId)
            const newFolder = VFS.createFolder(newTagId, tagName)
            res.send(newFolder)
        } catch (err) {
            console.log(err)
            res.status(500).send({})
        }
    },
    /** Rename a tag/folder name. */
    async updateTag(req, res, next) {
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
    },
    /** Remove a tag's previous parent and assign a new parent. */
    async moveTag(req, res, next) {
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
    },
    // TODO: Make sure the tag has now images associated with it before deleteing.
    // This is done on the frontend, but should really be done here too.
    /** Delete a tag. */
    async deleteTag(req, res, next) {
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
    },
    /**
     * Middleware for uploading and saving images.
     * @type {Router}
     * @memberof imageController
     */
    uploadAndSaveImages: null
}

// Join all the middleware pieces need for uploading images.
// This list is order specific.
imageController.uploadAndSaveImages = Router().use([
    uploadImages,
    imageController.saveUploadsToDb,
    imageController.removeFailedImageSaves,
    imageController.saveImages
])

export default imageController