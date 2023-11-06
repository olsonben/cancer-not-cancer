import { Router } from 'express'
import userController from '../controllers/userController.js'
import { isLoggedIn, isEnabled, isAdmin, asyncHandler } from '../lib/functions.js' // Helper functions

const router = Router()

const isValid = [isLoggedIn, isEnabled, isAdmin]

// routes for /users
router.get('/', isValid, asyncHandler(userController.getUsers))
router.post('/', isValid, asyncHandler(userController.createUser))

export default router