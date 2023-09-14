import dbOps from "./dbConnection.js"
import * as path from 'path'

// ---------------------------------
// USER BASED DATABASE METHODS
// ---------------------------------
const userOps = {
    // get users other than self
    async getUsers(userId) {
        const query = `SELECT id, fullname, username
                    FROM users
                    WHERE id != ?`
        const rows = await dbOps.select(query, [userId])

        return rows
    },
    async getUserById(id) {
        const query = `SELECT * FROM users WHERE id = ?`
        const rows = await dbOps.select(query, [id])
        return rows[0]
    },

    async getUserByUsername(username) {
        const query = `SELECT * FROM users WHERE username = ?`
        const rows = await dbOps.select(query, [username])
        return rows[0]
    },

    async createUser(fullname, username, password, is_enabled, is_pathologist, is_uploader, is_admin) {
        const addUserQuery = `INSERT INTO users (
            fullname,
            username,
            password,
            is_enabled,
            is_pathologist,
            is_uploader,
            is_admin
            ) VALUES (?, ?, ?, ?, ?, ?, ?);`

        try {
            // TODO: Consider using ternary instead of number for speed.
            // ex. is_enabled ? 1 : 0
            await dbOps.execute(
                addUserQuery,
                [
                    fullname,
                    username,
                    password,
                    Number(is_enabled),
                    Number(is_pathologist),
                    Number(is_uploader),
                    Number(is_admin)
                ]
            )

            console.log("Successful user insert query");
            return true
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return false
            } else {
                throw (err)
            }
        }

    },
}

export default userOps