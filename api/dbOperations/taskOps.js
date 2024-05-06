import dbOps from './dbConnection.js'

// ---------------------------------
// TASK BASED DATABASE METHODS
// ---------------------------------
const taskOps = {
    /**
     * Get all tasks owned by a user.
     * @param {Number} userId - Task owner id
     * @returns {Array.<Object>} - An array of task object {id, prompt, short_name}
     */
    async getTasks(userId) {
        const query = `SELECT id, prompt, short_name
                    FROM tasks
                    WHERE investigator = ?`
        const rows = await dbOps.select(query, [userId])
        return rows
    },

    /**
     * Get all tasks assigned to a user/observer.
     * @param {Number} userId - Observer's id
     * @returns {Array.<Object>} - An array of assign task objects {id, short_name, prompt}
     */
    async getTasked(userId) {
        const query = `SELECT tasks.id as id, tasks.short_name as short_name, tasks.prompt as prompt, tasks.chip_size, tasks.fov_size, tasks.zoom_scale
                    FROM observers
                    LEFT JOIN tasks ON tasks.id = observers.task_id
                    WHERE observers.user_id = ?
                    ORDER BY tasks.id`
        const rows = await dbOps.select(query, [userId])
        return rows
    },
    /**
     * Create a new task/prompt.
     * @param {Number} userId - Id of user creating task.
     * @param {String} short_name - Name of the task
     * @param {String} prompt - Question to be displayed to observers
     * @returns {Number} - Newly created task id
     */
    async createTask(userId, short_name, prompt) {
        const query = `INSERT INTO tasks (short_name, prompt, investigator) VALUES (?, ?, ?);`
        const results = await dbOps.executeWithResults(query, [short_name, prompt, userId])
        return results.insertId

    },
    /**
     * Change a task's name, prompt, chip_size, fov_size, or zoom_scale.
     * @param {Number} userId - Id of task owner
     * @param {Number} taskId - Id of task to update
     * @param {String} short_name - Task name
     * @param {String} prompt - Question to be displayed to observers
     * @param {String} chip_size - Size of the region of interest (ROI)
     * @param {String} fov_size - Default image size
     * @param {String} zoom_scale - Amount slide zooms when tapped
     */
    async updateTask(userId, taskId, short_name, prompt, chip_size, fov_size, zoom_scale) {
        const query = `UPDATE tasks
                    SET short_name = ?,
                        prompt = ?,
                        chip_size = ?,
                        fov_size = ?,
                        zoom_scale = ?
                    WHERE investigator = ?
                        AND id = ?`
        await dbOps.execute(query, [short_name, prompt, chip_size, fov_size, zoom_scale, userId, taskId])
    },
    /**
     * Delete a task by id.
     * @param {Number} userId - Task owner id
     * @param {Number} taskId - Id of task to be deleted
     */
    async deleteTask(userId, taskId) {
        const query = `DELETE FROM tasks WHERE tasks.investigator = ? AND tasks.id = ?;`
        await dbOps.execute(query, [userId, taskId])
    },

    /**
     * Get information to build task table. Task details which include progress,
     * image count, and observer count.
     * @param {Number} userId - task's owner id (investigator's id)
     * @returns {Array.<Object>} - {id, short_name, prompt, image_count,
     * observer_count, progress}
     */
    async getTaskTable(userId) {
        // Gets existing tasks, then collects image counts per task, observer count,
        // and sums the progress of all the observers for 'overall_progress' per task.

        // TODO: this query does not account for users who are removed from a task
        // after making ratings. This would make for progress beyond 1.0
        const query = `SELECT
                    t.*,
                    COALESCE(hot.ratings, 0) as ratings,
                    COALESCE(ob_count.num_users, 0) as observer_count,
                    COALESCE(im_count.total, 0) as image_count,
                    COALESCE(hot.ratings/(ob_count.num_users*im_count.total), 0) as progress
                    FROM tasks as t
                    LEFT JOIN (
                        SELECT observers.task_id, COUNT(DISTINCT user_id) as num_users
                        FROM observers
                        GROUP BY observers.task_id
                    ) AS ob_count ON ob_count.task_id = t.id
                    LEFT JOIN (
                        SELECT task_images.task_id, COUNT(*) as total
                        FROM task_images
                        GROUP BY task_images.task_id
                    ) AS im_count ON im_count.task_id = t.id
                    LEFT JOIN (
                        SELECT hotornot.task_id, COUNT(DISTINCT hotornot.user_id, hotornot.image_id, hotornot.task_id) as ratings
                        FROM hotornot
                        GROUP BY hotornot.task_id
                    ) as hot ON hot.task_id = t.id
                    WHERE t.investigator = ?`

        const rows = await dbOps.select(query, [userId])
        return rows
    },

    /**
     * Get a task's current progress information.
     * @param {Number} userId - task's owner id
     * @param {Number} taskId - task's id
     * @returns {Object} - {gradings, images, observers}
     */
    async getQuickTaskProgress(userId, taskId) {
        const query = `SELECT gradings.total / (images.total* observers.total) AS progress
        FROM (
            SELECT COUNT(*) as total
            FROM (
                SELECT DISTINCT user_id, image_id
                FROM hotornot
                WHERE hotornot.task_id = ?
            ) AS t
        ) AS gradings,
        (
            SELECT COUNT(*) AS total
            FROM task_images
            WHERE task_images.task_id = ?
        ) AS images,
        (
            SELECT COUNT(DISTINCT observers.user_id) AS total
            FROM observers
            WHERE observers.task_id = ?
        ) AS observers;`

        const rows = await dbOps.select(query, [taskId, taskId, taskId])
        return rows[0]
    },

    /**
     * Get assigned and unassigned observers for a task. A 1 for applied means
     * that observer has been assigned to the task.
     * @param {Number} userId - not used
     * @param {Number} taskId - task's id
     * @returns {Array.<Object>} - {id, name, applied}
     */
    async getObservers(userId, taskId) {
        const query = `SELECT
              users.id,
              users.fullname as name,
              CASE WHEN task_id is NULL THEN 0 ELSE 1 END applied
            FROM users
              LEFT JOIN observers ON observers.user_id = users.id AND task_id = ?
            WHERE users.is_enabled = 1 AND users.is_pathologist = 1
            ORDER BY users.id`

        const rows = await dbOps.select(query, [taskId])
        return rows

    },

    /**
     * Assign observers to task.
     * @param {Number} userId - not used
     * @param {Number} taskId - id of task to update observers
     * @param {Array.<Number>} observerIds - Array of user ids to assign to task.
     */
    async updateObservers(userId, taskId, observerIds) {
        const deleteObserversForTask = `DELETE FROM observers WHERE task_id = ?`
        const addObserverToTask = `INSERT INTO observers (task_id, user_id) VALUES (?, ?)`

        const transaction = await dbOps.startTransaction()
        await transaction.query(deleteObserversForTask, [taskId])
        await Promise.all(observerIds.map((observerId) => transaction.query(addObserverToTask, [taskId, observerId])))
        await transaction.commit()
    },

    /**
     * Get all images associated with a user and mark images that are selected
     * for the taskId
     * @param {Number} userId - Image owner id
     * @param {Number} taskId - Id of task to note for image selection
     * @returns {Array.<Object>} - [{tag_id, tag_name, parent_tag_id, parent_tag_name,
     * image_id, hash, owner_id, original_name, selected}]
     */
    async getImages(userId, taskId) {

        const query = `SELECT 
                tags.id as tag_id,
                tags.name as tag_name,
                tag_relations.parent_tag_id as parent_tag_id,
                tags2.name as parent_tag_name,
                images.id as image_id,
                images.path, images.hash,
                images.user_id as owner_id,
                images.original_name as original_name,
                CASE WHEN selected.picked IS NOT NULL THEN TRUE ELSE FALSE END as selected
            FROM tags
            LEFT JOIN image_tags ON image_tags.tag_id = tags.id
            LEFT JOIN images ON images.id = image_tags.image_id
            LEFT JOIN tag_relations ON tag_relations.tag_id = tags.id
            LEFT JOIN tags as tags2 ON tag_relations.parent_tag_id = tags2.id
            LEFT JOIN (
              SELECT DISTINCT task_images.image_id as image_id, TRUE AS picked
              FROM task_images
              WHERE task_id = ?
            ) selected ON selected.image_id = images.id
            WHERE tags.user_id = ?
            ORDER BY tags.id`

        const rows = await dbOps.select(query, [taskId, userId])
        return rows
    },

    /**
     * Save a list of image ids for a specified task.
     * @param {Number} userId - not used
     * @param {Number} taskId - Id of task to associate images to
     * @param {Array.<Number>} imageIds - Array of image ids apply to task.
     */
    async setTaskImages(userId, taskId, imageIds) {
        const deleteImagesForTask = `DELETE FROM task_images WHERE task_id = ?`
        const addImageToTask = `INSERT INTO task_images (task_id, image_id) VALUES (?, ?)`

        const transaction = await dbOps.startTransaction()
        await transaction.query(deleteImagesForTask, [taskId])
        await Promise.all(imageIds.map((imageId) => transaction.query(addImageToTask, [taskId, imageId])))
        await transaction.commit()
    },

    async getTaskGuide(taskId) {
        const query = `SELECT
              id as guideId, task_id as taskId, content
            FROM guides
            WHERE guides.task_id = ?`

        const rows = await dbOps.select(query, [taskId])
        return rows[0]
    },

    async setTaskGuide(taskId, HTMLContent) {
        const deleteContent = `DELETE FROM guides WHERE task_id = ?`
        const saveContent = `INSERT INTO guides (task_id, content) VALUES (?, ?)`
        const transaction = await dbOps.startTransaction()
        await transaction.query(deleteContent, [taskId])
        await transaction.query(saveContent, [taskId, HTMLContent])
        await transaction.commit()
    }
}

export default taskOps