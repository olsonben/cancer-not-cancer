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
router.put('/tag', isLoggedAndEnabled, isUploader, imageController.updateTag)
router.put('/moveTag', isLoggedAndEnabled, isUploader, imageController.moveTag)
router.delete('/tag', isLoggedAndEnabled, isUploader, imageController.deleteTag)

export default router