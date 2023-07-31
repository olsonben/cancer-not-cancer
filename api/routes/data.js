import { Router } from 'express'
import dataController from '../controllers/dataController.js'
import { isLoggedIn, isEnabled, isUploader } from '../lib/functions.js' // Helper functions

const router = Router()

const isValid = [isLoggedIn, isEnabled, isUploader]

// routes for /data
router.get('/', isValid, dataController.getData)
router.get('/perUsers', isValid, dataController.getDataPerUsers)
router.get('/perImages', isValid, dataController.getDataPerImages)

export default router