import userOps from '../dbOperations/userOps.js'

const userController = {
    /** Get a list of users. */
    async getUsers(req, res) {
        const adminUserId = req.user.id
        const data = await userOps.getUsers(adminUserId)
        res.send(data)
    },

    /** Insert new user via post  */
    async createUser(req, res, next) {
        console.log("CreateUser::");

        // Check permissions
        if (typeof req.body.fullname !== 'string' ||
            typeof req.body.email !== 'string' ||
            typeof req.body.password !== 'string') {
            res.sendStatus(415)
            return
        }

        // Check string lengths
        let flag = false
        let message = []
        if (req.body.fullname.length > 256) {
            flag = true
            message += "Name too long"
        } if (req.body.email.length > 320) {
            flag = true
            message += "Email too long"
        } if (req.body.password.length > 50) {
            flag = true
            message += "Password too long"
        } if (flag) {
            res.status(413).send(message)
        }

        const addUserSuccess = await userOps.createUser(
            req.body.fullname,
            req.body.email,
            req.body.password,
            req.body.permissions.enabled,
            req.body.permissions.pathologist,
            req.body.permissions.uploader,
            req.body.permissions.admin
        )

        if (addUserSuccess) {
            res.status(200).send(req.body)
        } else {
            // No duplicate users
            res.status(409).send({
                message: "Email already exists in database.",
                user: req.body
            })
        }
    }
}

export default userController