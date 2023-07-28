import dbOps from './dbConnection.js'

const getTasks = async (userId) => {
    const query = `SELECT id, prompt, short_name
                FROM tasks
                WHERE investigator = ?`
    const rows = await dbOps.select(query, [userId])

    return rows
}

const createTask = async (userId, short_name, prompt) => {
    const query = `INSERT INTO tasks (short_name, prompt, investigator) VALUES (?, ?, ?);`
    try {
        const results = await dbOps.executeWithResults(query, [short_name, prompt, userId])
        return results.insertId
    } catch (err) {
        throw (err)
    }

}

const updateTask = async (userId, taskId, short_name, prompt) => {
    const query = `UPDATE tasks
                SET short_name = ?,
                    prompt = ?
                WHERE investigator = ?
                    AND id = ?`
    try {
        await dbOps.execute(query, [short_name, prompt, userId, taskId])
        return true
    } catch (err) {
        throw (err)
    }

}

const deleteTask = async (userId, taskId) => {
    const query = `DELETE FROM tasks WHERE tasks.investigator = ? AND tasks.id = ?;`
    try {
        await dbOps.execute(query, [userId, taskId])
        return true
    } catch (err) {
        throw (err)
    }
}

const getTaskTable = async (userId) => {
    // TODO: I think this can probably be clean up a little
    // getting image counts should only require the image_tags table,
    // and there maybe other redundant joins. For now it works!
    const query = `WITH image_count_table AS (
  SELECT tasks.id AS task_id, COUNT(DISTINCT images.id) AS image_count
  FROM tasks
  LEFT JOIN task_tags ON task_tags.task_id = tasks.id
  LEFT JOIN image_tags ON image_tags.tag_id = task_tags.tag_id
  LEFT JOIN images ON images.id = image_tags.image_id
  WHERE tasks.investigator = ?
  GROUP BY tasks.id
),
observer_count_table AS (
  SELECT tasks.id AS task_id, COUNT(DISTINCT observers.user_id) AS observer_count
  FROM tasks
  LEFT JOIN observers ON observers.task_id = tasks.id
  WHERE tasks.investigator = ?
  GROUP BY tasks.id
),
progress_table AS (
	SELECT hotornot.user_id, COUNT(DISTINCT hotornot.image_id) AS graded_images_count, hotornot.task_id,
    total_images.total_images,
    (COUNT(DISTINCT hotornot.image_id) / total_images.total_images) AS progress_percentage
  FROM hotornot
  JOIN (
    SELECT tasks.id as tt_id, COUNT(DISTINCT images.id) AS total_images
    FROM tasks
    LEFT JOIN task_tags ON task_tags.task_id = tasks.id
    LEFT JOIN image_tags ON image_tags.tag_id = task_tags.tag_id
    LEFT JOIN images ON images.id = image_tags.image_id
    GROUP BY tasks.id
  ) AS total_images ON total_images.tt_id = hotornot.task_id
  GROUP BY hotornot.task_id, hotornot.user_id
),
overall AS (
	SELECT progress_table.task_id AS task_id, SUM(progress_table.progress_percentage)/COUNT(progress_table.progress_percentage) AS overall_progress
  FROM progress_table
  GROUP BY progress_table.task_id
)
SELECT tasks.id, tasks.short_name, tasks.prompt,
       COALESCE(image_count_table.image_count, 0) AS image_count,
       COALESCE(observer_count_table.observer_count, 0) AS observer_count,
       COALESCE(overall.overall_progress, 0) AS progress
FROM tasks
LEFT JOIN image_count_table ON tasks.id = image_count_table.task_id
LEFT JOIN observer_count_table ON tasks.id = observer_count_table.task_id
LEFT JOIN overall ON tasks.id = overall.task_id;`

    const rows = await dbOps.select(query, [userId, userId])
    return rows

}

const taskOps = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskTable,
}

export default taskOps