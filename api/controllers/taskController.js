import taskOps from '../dbOperations/taskOps.js'

// Returns all tasks associated with a user id. Admins can change user id.
const getAllTasks = async (req, res) => {
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

const taskController = {
    getAllTasks,
    getTaskTable,
    createTask,
    updateTask,
    deleteTask,
}

export default taskController