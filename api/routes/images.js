import { Router } from 'express'
import imageController from '../controllers/imageController.js'
import { isLoggedIn, isEnabled, isUploader, isPathologist, asyncHandler } from '../lib/functions.js' // Helper functions

const router = Router()

const isObserver = [isLoggedIn, isEnabled, isPathologist]
const isInvestigator = [isLoggedIn, isEnabled, isUploader]

// routes for /images
router.get('/', isObserver, asyncHandler(imageController.nextImage))
router.get('/queue', isObserver, asyncHandler(imageController.getNextImageIds))
router.post('/', isInvestigator, imageController.uploadAndSaveImages) // asyncHandler already applied
router.post('/tag', isInvestigator, asyncHandler(imageController.createTag))
router.post('/renameTag', isInvestigator, asyncHandler(imageController.updateTag))
router.post('/moveTag', isInvestigator, asyncHandler(imageController.moveTag))
router.post('/deleteTag', isInvestigator, asyncHandler(imageController.deleteTag))
router.post('/rename', isInvestigator, asyncHandler(imageController.renameImage))
router.post('/move', isInvestigator, asyncHandler(imageController.moveImage))
router.post('/delete', isInvestigator, asyncHandler(imageController.deleteImage))

export default router