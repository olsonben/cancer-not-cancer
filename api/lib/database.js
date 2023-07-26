import { DatabaseOps } from "./dbops.js";

const dbConfig = {
    type: process.env.DB_PROTOCOL,
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
}

const dbOps = new DatabaseOps(dbConfig)

export async function getUserByUsername(username) {
    const query = `SELECT * FROM users WHERE username = ?`
    const rows = await dbOps.select(query, [username])
    return rows[0]
}

export async function getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ?`
    const rows = await dbOps.select(query, [id])
    return rows[0]
}

export async function getNextImage() {
    // NOTE: this is not very efficient, but it works
    const query = `SELECT id, path FROM images ORDER BY times_graded, date_added LIMIT 1;`
    const rows = await dbOps.select(query, [])
    return rows[0]
}

export async function addRating(userId, imageId, rating, comment, fromIp) {
    const ratingQuery = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) 
        VALUES (?, ?, ?, ?, ?);`
    const updateQuery = `UPDATE images 
        SET times_graded = times_graded + 1 
        WHERE id = ?;`
    
    await Promise.all([
        dbOps.execute(ratingQuery, [userId, imageId, rating, comment, fromIp]),
        dbOps.execute(updateQuery, [imageId])
    ])

    console.log("Successful hotornot insert query");
    return true
}

export async function createUser(fullname, username, password, is_enabled, is_pathologist, is_uploader, is_admin) {
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
            throw(err)
        }
    }
    
}

export async function addImage(path, hash, from_ip, user_id) {
    const addImageQuery = `INSERT INTO images (path, hash, from_ip, user_id) VALUES (?, ?, ?, ?);` // insert image

    try {
        await dbOps.execute(addImageQuery, [ path, hash, from_ip, user_id])
        console.log(`Successful image insert query: ${path}`);
        return true
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return false
        } else {
            throw(err)
        }
    }
}

export async function getUsers(userId) {
    const query = `SELECT id, fullname, username
                FROM users
                WHERE id != ?`
    const rows = await dbOps.select(query, [userId])

    return rows
}

export async function getTasks(userId) {
    const query = `SELECT id, prompt, short_name
                FROM tasks
                WHERE investigator = ?`
    const rows = await dbOps.select(query, [userId])
    
    return rows
}

// export async function getTask(userId, taskId) {
//     const query = `SELECT id, prompt, short_name
//                 FROM tasks
//                 WHERE investigator = ?
//                 AND id = ?`
//     const rows = await dbOps.select(query, [userId, taskId])

//     return rows
// }
export async function getTaskTable(userId) {
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

export async function getData(userId, taskId) {
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
}

export async function getDataPerUsers(userId, taskId) {
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
}

export async function getDataPerImages(userId, taskId) {
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
}