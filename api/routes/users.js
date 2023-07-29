import express from 'express'
import userController from '../controllers/userController.js'
import { isLoggedIn, isEnabled, isAdmin } from '../lib/functions.js' // Helper functions

const router = express.Router()

const isValid = [isLoggedIn, isEnabled, isAdmin]

router.get('/', isValid, userController.getUsers)
router.post('/', isValid, userController.createUser)

export default router