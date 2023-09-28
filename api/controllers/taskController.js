import taskOps from '../dbOperations/taskOps.js'
import { virtualFileSystem as VFS } from '../lib/functions.js'

const taskController = {
    //** Returns all task assigned to the user/observer. */
    async getAllTasks (req, res, next) {
        let observerId = req.user.id
        const data = await taskOps.getTasked(observerId)
        res.send(data)
    },
    /** Returns all tasks owned/associated with a user id. Admins can change user id. */
    async getOwnedTasks (req, res) {
        let investigatorId = req.user.id
        if (req.query.user_id && req.user.permissions.admin) {
            investigatorId = req.query.user_id
        }
        const data = await taskOps.getTasks(investigatorId)
        res.send(data)
    },
    /** Returns all data needed to build a task table associated with a user id. */
    async getTaskTable (req, res) {
        let investigatorId = req.user.id
        const data = await taskOps.getTaskTable(investigatorId)
        res.send(data)
    },
    /** Returns an individual task's progress, for updating the getTaskTable data. */
    async getTaskProgress (req, res) {
        let investigatorId = req.user.id
        const taskId = req.query.task_id
        const data = await taskOps.getQuickTaskProgress(investigatorId, taskId)
        res.send(data)
    },
    /** Handle a post request to create a new task. Returns new task id. */
    async createTask (req, res) {
        let investigatorId = req.user.id
        const short_name = req.body.short_name
        const prompt = req.body.prompt
        console.log('CreateTask::', short_name, prompt)

        const insertId = await taskOps.createTask(investigatorId, short_name, prompt)
        res.send({ newTaskId: insertId })
    },
    /** Handle a post request to update a task.  */
    async updateTask (req, res) {
        let investigatorId = req.user.id
        const taskId = req.body.id
        const short_name = req.body.short_name
        const prompt = req.body.prompt
        await taskOps.updateTask(investigatorId, taskId, short_name, prompt)
        res.sendStatus(200)
    },
    /** Handle a post request to delete a task. */
    async deleteTask (req, res) {
        let investigatorId = req.user.id
        const taskId = req.body.id
        await taskOps.deleteTask(investigatorId, taskId)
        res.sendStatus(200)
    },
    /** Handle a get request for a tasks observers(users). */
    async getObservers (req, res, next) {
        let investigatorId = req.user.id
        const taskId = req.query.task_id
        const observers = await taskOps.getObservers(investigatorId, taskId)
        res.send(observers)
    },
    /** Update/Set observers for a task id. */
    async updateObservers (req, res) {
        let investigatorId = req.user.id
        const taskId = req.body.task_id
        const observerIds = JSON.parse(req.body.observerIds)
        await taskOps.updateObservers(investigatorId, taskId, observerIds)
        res.sendStatus(200)
    },
    /** Get images and tag/folder structure for task image assignment. */
    async getImages (req, res) {
        let investigatorId = req.user.id
        const taskId = req.query.task_id

        const images = await taskOps.getImages(investigatorId, taskId)

        // build file structure
        const folderMap = new Map()
        const topFolders = new Set()
        const folderContents = new Map()
        for (const image of images) {
            const tagId = image['tag_id']
            const parentTagId = image['parent_tag_id']

            if (!folderMap.has(tagId)) {
                folderMap.set(tagId, VFS.createFolder(tagId, image['tag_name']))
                folderContents.set(tagId, new Set())
            }

            const folder = folderMap.get(tagId)

            if (parentTagId !== null) {
                if (!folderMap.has(parentTagId)) {
                    folderMap.set(parentTagId, VFS.createFolder(parentTagId, image['parent_tag_name']))
                    folderContents.set(parentTagId, new Set())
                }

                const parentFolder = folderMap.get(parentTagId)
                const parentFolderContents = folderContents.get(parentTagId)

                if (!parentFolderContents.has(folder)) {
                    parentFolder.contents.push(folder)
                    parentFolderContents.add(folder)
                }
            } else {
                topFolders.add(folder)
            }

            if (image['image_id'] !== null) {
                const file = VFS.createFile(image['image_id'], image['original_name'], !!image['selected'])
                folder.contents.push(file)
            }
        }

        const fileArray = Array.from(topFolders)
        res.send(fileArray)
    },
    /** Assign select images to a task. */
    async setTaskImages(req, res) {
        let investigatorId = req.user.id
        const taskId = req.body.task_id
        const imageIds = JSON.parse(req.body.imageIds)
        await taskOps.setTaskImages(investigatorId, taskId, imageIds)
        res.sendStatus(200)
    }
}

export default taskController