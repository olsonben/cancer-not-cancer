import taskOps from '../dbOperations/taskOps.js'


// Returns all task assigned to the user/observer.
const getAllTasks = async (req, res) => {
    let observerId = req.user.id
    try {
        const data = await taskOps.getTasked(observerId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
}

// Returns all tasks owned/associated with a user id. Admins can change user id.
const getOwnedTasks = async (req, res) => {
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }
    try {
        const data = await taskOps.getTasks(investigatorId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
}

// Returns all data needed to build a task table associated with a user id.
const getTaskTable = async (req, res) => {
    let investigatorId = req.user.id
    try {
        const data = await taskOps.getTaskTable(investigatorId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
}

// Handle a post request to create a new task. Returns new task id.
const createTask = async (req, res) => {
    let investigatorId = req.user.id
    const short_name = req.body.short_name
    const prompt = req.body.prompt
    console.log('create task:', short_name, prompt)
    try {
        const insertId = await taskOps.createTask(investigatorId, short_name, prompt)
        console.log('createTask data')
        console.log(insertId)
        res.send({ newTaskId: insertId })
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

// Handle a post request to update a task.
const updateTask = async (req, res) => {
    let investigatorId = req.user.id
    const taskId = req.body.id
    const short_name = req.body.short_name
    const prompt = req.body.prompt
    try {
        const updateSuccess = await taskOps.updateTask(investigatorId, taskId, short_name, prompt)
        if (updateSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

// Handle a post request to delete a task.
const deleteTask = async (req, res) => {
    let investigatorId = req.user.id
    const taskId = req.body.id
    try {
        const deleteSuccess = await taskOps.deleteTask(investigatorId, taskId)
        if (deleteSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

// Handle a get request for a tasks observers(users).
const getObservers = async (req, res) => {
    let investigatorId = req.user.id
    const taskId = req.query.task_id
    try {
        const observers = await taskOps.getObservers(investigatorId, taskId)
        res.send(observers)
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const updateObservers = async (req, res) => {
    let investigatorId = req.user.id
    const taskId = req.body.task_id
    const observerIds = JSON.parse(req.body.observerIds)
    try {
        const updateSuccess = await taskOps.updateObservers(investigatorId, taskId, observerIds)
        if (updateSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

function createFolder(tag_id, tag_name, contents=[]) {
    return {
        id: tag_id,
        name: tag_name,
        contents: contents,
        type: 'tag'
    }
}

function createFile(image_id, image_path, selected = false) {
    return {
        id: image_id,
        name: image_path,
        selected: selected,
        type: 'img'
    }
}

const getImages = async (req, res) => {
    let investigatorId = req.user.id
    const taskId = req.query.task_id
    try {
        const images = await taskOps.getImages(investigatorId, taskId)
        // build file structure
        let files = {}
        for (const image of images) {
            let folder = files[image['tag_name']]
            if (folder === undefined) {
                folder = createFolder(image['tag_id'], image['tag_name'])
            }
            if (image['image_id'] !== null) {
                const file = createFile(image['image_id'], image['path'], !!image['selected'])
                folder.contents.push(file)
            }
            files[image['tag_name']] = folder
        }
        const fileArray = Object.values(files)
        res.send(fileArray)
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const setTaskImages = async(req, res) => {
    let investigatorId = req.user.id
    const taskId = req.body.task_id
    const imageIds = JSON.parse(req.body.imageIds)

    try {
        const updateSuccess = await taskOps.setTaskImages(investigatorId, taskId, imageIds)
        if (updateSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

// Handle a get request for a task tags.
const getTags = async (req, res) => {
    let investigatorId = req.user.id
    const taskId = req.query.task_id
    try {
        const tags = await taskOps.getTags(investigatorId, taskId)
        res.send(tags)
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const updateTaskTags = async (req, res) => {
    let investigatorId = req.user.id
    const taskId = req.body.task_id
    const tagIds = JSON.parse(req.body.tagIds)
    try {
        const updateSuccess = await taskOps.updateTaskTags(investigatorId, taskId, tagIds)
        if (updateSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({})
    }
}

const taskController = {
    getAllTasks,
    getOwnedTasks,
    getTaskTable,
    createTask,
    updateTask,
    deleteTask,
    getObservers,
    updateObservers,
    getTags,
    updateTaskTags,
    getImages,
    setTaskImages
}

export default taskController