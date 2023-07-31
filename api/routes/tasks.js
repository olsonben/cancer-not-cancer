import { Router } from 'express'
import taskController from '../controllers/taskController.js'
import { isLoggedIn, isEnabled, isUploader } from '../lib/functions.js' // Helper functions

const router = Router()

const isValid = [isLoggedIn, isEnabled, isUploader]

// routes for /tasks
router.get('/', isValid, taskController.getAllTasks)
router.get('/table', isValid, taskController.getTaskTable)
router.post('/', isValid, taskController.createTask)
router.post('/update', isValid, taskController.updateTask)
router.post('/delete', isValid, taskController.deleteTask)

export default router