import { Router } from 'express'
import dataController from '../controllers/dataController.js'
import { isLoggedIn, isEnabled, isUploader, asyncHandler } from '../lib/functions.js' // Helper functions

const router = Router()

const isValid = [isLoggedIn, isEnabled, isUploader]

// routes for /data
router.get('/', isValid, asyncHandler(dataController.getData))
router.get('/perUsers', isValid, asyncHandler(dataController.getDataPerUsers))
router.get('/perImages', isValid, asyncHandler(dataController.getDataPerImages))

export default router