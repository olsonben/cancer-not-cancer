import dataOps from '../dbOperations/dataOps.js'

// For Data View
// =====================
/** Express.js API endpoint handlers for data related requests. */
const dataController = {
    // TODO: Add some better data checking to make sure the user owns the data they
    //       are looking at.

    /** Return overview data for a task, admins can change the visible data by 
     * switching user id. */
    async getData(req, res) {
        const taskId = req.query.task_id || null
        let investigatorId = req.user.id
        if (req.query.user_id && req.user.permissions.admin) {
            investigatorId = req.query.user_id
        }
        
        const data = await dataOps.getData(investigatorId, taskId)
        res.send(data)
    },
    
    /** Return per user overview data for a task, admins can change user id. */
    async getDataPerUsers(req, res) {
        const taskId = req.query.task_id || null
        let investigatorId = req.user.id
        if (req.query.user_id && req.user.permissions.admin) {
            investigatorId = req.query.user_id
        }

        const data = await dataOps.getDataPerUsers(investigatorId, taskId)
        res.send(data)
    },
    
    /** Return per image overview data for a task, admins can change user id. */
    async getDataPerImages(req, res) {
        const taskId = req.query.task_id || null
        let investigatorId = req.user.id
        if (req.query.user_id && req.user.permissions.admin) {
            investigatorId = req.query.user_id
        }

        const data = await dataOps.getDataPerImages(investigatorId, taskId)
        res.send(data)
    }
    
}
    
export default dataController