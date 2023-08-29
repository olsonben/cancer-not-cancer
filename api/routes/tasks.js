import { Router } from 'express'
import taskController from '../controllers/taskController.js'
import { isLoggedIn, isEnabled, isUploader } from '../lib/functions.js' // Helper functions

const router = Router()

const isValid = [isLoggedIn, isEnabled, isUploader]

// routes for /tasks
router.get('/', isValid, taskController.getAllTasks)
router.get('/owned', isValid, taskController.getOwnedTasks)
router.get('/table', isValid, taskController.getTaskTable)
router.post('/', isValid, taskController.createTask)
router.post('/update', isValid, taskController.updateTask)
router.post('/delete', isValid, taskController.deleteTask)
router.get('/observers', isValid, taskController.getObservers)
router.post('/observers', isValid, taskController.updateObservers)
router.get('/tags', isValid, taskController.getTags)
router.post('/tags', isValid, taskController.updateTaskTags)
router.get('/images', isValid, taskController.getImages)
router.post('/images', isValid, taskController.setTaskImages)

export default router