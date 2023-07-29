import { dataOps } from '../dbOperations/database.js'

// For data view
// TODO: Add some better data checking to make sure the user owns the data they
//       are looking at.
const getData = async (req, res) => {
    const taskId = req.query.task_id
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }

    try {
        const data = await dataOps.getData(investigatorId, taskId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
}

const getDataPerUsers = async (req, res) => {
    const taskId = req.query.task_id
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }
    try {
        const data = await dataOps.getDataPerUsers(investigatorId, taskId)
        res.send(data)
    } catch (err) {
        console.error(err)
        res.status(500).send({})
    }
}

const getDataPerImages = async (req, res) => {
    const taskId = req.query.task_id
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }
    try {
        const data = await dataOps.getDataPerImages(investigatorId, taskId)
        res.send(data)
    } catch (err) {
        console.error(err)
        res.status(500).send({})
    }
}

const dataController = {
    getData,
    getDataPerUsers,
    getDataPerImages,
}

export default dataController