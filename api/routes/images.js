import { Router } from 'express'
import imageController from '../controllers/imageController.js'
import { isLoggedIn, isEnabled, isUploader, isPathologist } from '../lib/functions.js' // Helper functions

const router = Router()

const isLoggedAndEnabled = [isLoggedIn, isEnabled]

// routes for /images
router.get('/', isLoggedAndEnabled, isPathologist, imageController.nextImage)
router.post('/', isLoggedAndEnabled, isUploader, imageController.uploadAndSaveImages)

export default router