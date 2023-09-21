import dbOps from "./dbConnection.js"
import * as path from 'path'

// ---------------------------------
// USER BASED DATABASE METHODS
// ---------------------------------
const userOps = {
    /**
     * Get all users other than self.
     * @param {Number} userId - id of user to exclude
     * @returns {Array.<Object>} - [{id, fullname, username}]
     */
    async getUsers(userId) {
        const query = `SELECT id, fullname, username
                    FROM users
                    WHERE id != ?`
        const rows = await dbOps.select(query, [userId])
        return rows
    },
    /**
     * Get user information by id.
     * @param {Number} id - id of user to get
     * @returns {Object} - {id, fullname, username, password, is_enabled, is_pathologist,
     * is_uploader, is_admin, created, updated}
     */
    async getUserById(id) {
        const query = `SELECT * FROM users WHERE id = ?`
        const rows = await dbOps.select(query, [id])
        return rows[0]
    },
    /**
     * Get user information by username.
     * @param {String} username - username of user to lookup
     * @returns {Object} - {id, fullname, username, password, is_enabled, is_pathologist,
     * is_uploader, is_admin, created, updated}
     */
    async getUserByUsername(username) {
        const query = `SELECT * FROM users WHERE username = ?`
        const rows = await dbOps.select(query, [username])
        return rows[0]
    },
    /**
     * Create a new user in the database.
     * @param {String} fullname - Full name of user
     * @param {String} username - email associated with login
     * @param {String} password - arbitrary
     * @param {Boolean} is_enabled - user enabled state
     * @param {Boolean} is_pathologist - pathologist/observer state
     * @param {Boolean} is_uploader - uploader/investigator state
     * @param {Boolean} is_admin - admin state
     * @returns {Boolean} - False if duplicate.
     */
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
                // Duplicate user
                return false
            } else {
                throw (err)
            }
        }

    },
}

export default userOps