import express from 'express'
import { uploadImages, removeFile, removeEmptyImageFolders } from '../lib/upload.js' // middleware to handle uploads
import imageController from '../controllers/imageController.js'
import { isLoggedIn, isEnabled, isUploader, isPathologist, getIP } from '../lib/functions.js' // Helper functions
import { imageOps } from '../dbOperations/database.js'

async function saveUploadsToDb(req, res, next) {
    const ip = getIP(req)
    for (const file of req.files) {
        if (file.success) {
            try {
                // TODO: consider moving to imageController
                const insertImageSuccess = await imageOps.addImage(
                    // TODO: move this concatenation to upload.js
                    file.relPath, // safe: created by the server
                    file.hash || null,
                    ip,
                    req.user.id
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
    next()
}

async function removeFailedImageSaves(req, res, next) {
    for (const file of req.files) {
        if (!file.success) {
            await removeFile(file.savePath)
        }
    }
    removeEmptyImageFolders()
    next()
}

const router = express.Router()

const uploadImageChain = [uploadImages, saveUploadsToDb, removeFailedImageSaves]
const isLoggedAndEnabled = [isLoggedIn, isEnabled]

router.get('/', isLoggedAndEnabled, isPathologist, imageController.nextImage)
router.post('/', isLoggedAndEnabled, isUploader, uploadImageChain, imageController.saveImages)

export default router