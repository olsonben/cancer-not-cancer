import { Router } from 'express'
import imageController from '../controllers/imageController.js'
import { isLoggedIn, isEnabled, isUploader, isPathologist } from '../lib/functions.js' // Helper functions

const router = Router()

const isLoggedAndEnabled = [isLoggedIn, isEnabled]

// routes for /images
router.get('/', isLoggedAndEnabled, isPathologist, imageController.nextImage)
router.get('/queue', isLoggedAndEnabled, isPathologist, imageController.getNextImageIds)
router.post('/', isLoggedAndEnabled, isUploader, imageController.uploadAndSaveImages)
router.post('/tag', isLoggedAndEnabled, isUploader, imageController.createTag)
router.post('/renameTag', isLoggedAndEnabled, isUploader, imageController.updateTag)
router.post('/moveTag', isLoggedAndEnabled, isUploader, imageController.moveTag)
router.post('/deleteTag', isLoggedAndEnabled, isUploader, imageController.deleteTag)
router.post('/rename', isLoggedAndEnabled, isUploader, imageController.renameImage)
router.post('/move', isLoggedAndEnabled, isUploader, imageController.moveImage)
router.post('/delete', isLoggedAndEnabled, isUploader, imageController.deleteImage)

export default router