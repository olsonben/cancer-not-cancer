import dbOps from "./dbConnection.js"
import * as path from 'path'

// ---------------------------------
// DATA BASED DATABASE METHODS
// ---------------------------------
const dataOps = {
    // Note: for addRating, technically updateQuery is not necessary anymore
    async addRating(userId, imageId, rating, comment, fromIp, taskId) {
        const ratingQuery = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip, task_id) 
            VALUES (?, ?, ?, ?, ?, ?)`
        const updateQuery = `UPDATE images 
            SET times_graded = times_graded + 1 
            WHERE id = ?;`
        
        const transaction = await dbOps.startTransaction()
        await transaction.query(ratingQuery, [userId, imageId, rating, comment, fromIp, taskId])
        await transaction.query(updateQuery, [imageId])
        await transaction.commit()

        console.log("Successful hotornot insert query");
        console.log("dSuccessful hotornot insert query");
        return true
    },
    
    // Overview data: totals for all tasks or a specified task
    async getData(userId, taskId) {
        const query = `SELECT
                        count(*) AS total,
                        sum(case when rating = 1 then 1 else 0 end) AS yes,
                        sum(case when rating = -1 then 1 else 0 end) AS no,
                        sum(case when rating = 0 then 1 else 0 end) AS maybe
                    FROM hotornot
                        LEFT JOIN tasks ON hotornot.task_id = tasks.id
                    WHERE (task_id = ? OR ? is NULL)
                        AND tasks.investigator = ?`
        const rows = await dbOps.select(query, [taskId, taskId, userId])
        
        return rows[0]
    },

    // Similar to getData, but totals are split by each user associated.
    async getDataPerUsers(userId, taskId) {
        const query = `
            SELECT
                h.user_id,
                u.fullname,
                COUNT(*) AS total,
                SUM(CASE WHEN h.rating = 1 THEN 1 ELSE 0 END) AS yes,
                SUM(CASE WHEN h.rating = -1 THEN 1 ELSE 0 END) AS no,
                SUM(CASE WHEN h.rating = 0 THEN 1 ELSE 0 END) AS maybe
            FROM
                hotornot as h
            LEFT JOIN users as u ON
                h.user_id = u.id
            LEFT JOIN tasks ON h.task_id = tasks.id
            WHERE (task_id = ? OR ? is NULL)
                AND tasks.investigator = ?
            GROUP BY
                h.user_id`

        const rows = await dbOps.select(query, [taskId, taskId, userId])
        return rows
    },

    // Similar to getData, but totals are split by each image associated.
    async getDataPerImages(userId, taskId) {
        const query = `
            SELECT
                h.image_id,
                im.path,
                COUNT(*) AS total,
                SUM(CASE WHEN h.rating = 1 THEN 1 ELSE 0 END) AS yes,
                SUM(CASE WHEN h.rating = -1 THEN 1 ELSE 0 END) AS no,
                SUM(CASE WHEN h.rating = 0 THEN 1 ELSE 0 END) AS maybe
            FROM
                hotornot as h
            LEFT JOIN images as im ON
                h.image_id = im.id
            LEFT JOIN tasks ON h.task_id = tasks.id
            WHERE (task_id = ? OR ? is NULL)
                AND tasks.investigator = ?
            GROUP BY
                im.id`

        const rows = await dbOps.select(query, [taskId, taskId, userId])
        return rows
    },
}

export default dataOps