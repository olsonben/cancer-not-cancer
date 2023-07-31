import { Router } from 'express'
import userController from '../controllers/userController.js'
import { isLoggedIn, isEnabled, isAdmin } from '../lib/functions.js' // Helper functions

const router = Router()

const isValid = [isLoggedIn, isEnabled, isAdmin]

// routes for /users
router.get('/', isValid, userController.getUsers)
router.post('/', isValid, userController.createUser)

export default router