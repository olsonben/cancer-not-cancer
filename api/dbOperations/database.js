// TODO: Consider breaking into smaller files, matching routes and controllers
import dbOps from "./dbConnection.js"
import * as path from 'path'

// ---------------------------------
// GENERAL USE DATABASE METHODS
// ---------------------------------
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

export async function addRating(userId, imageId, rating, comment, fromIp, taskId) {
    const ratingQuery = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip, task_id) 
        VALUES (?, ?, ?, ?, ?, ?)`
    const updateQuery = `UPDATE images 
        SET times_graded = times_graded + 1 
        WHERE id = ?;`
    
    // TODO: user the transaction method
    await Promise.all([
        dbOps.execute(ratingQuery, [userId, imageId, rating, comment, fromIp, taskId]),
        dbOps.execute(updateQuery, [imageId])
    ])

    console.log("Successful hotornot insert query");
    return true
}

// ---------------------------------
// IMAGE BASED DATABASE METHODS
// ---------------------------------
const imageOps = {
    async getNextImage(imageId) {
        // NOTE: this is not very efficient, but it works
        const query = `SELECT id, path FROM images WHERE images.id = ?`
        const rows = await dbOps.select(query, [imageId])
        return rows[0]
    },

    async getNextImageIds(userId, taskId) {
        const query = `
            (
                SELECT task_images.image_id as image_id
                FROM task_images 
                WHERE task_images.task_id = ?
            )
            EXCEPT
            (
                SELECT hotornot.image_id as image_id
                FROM hotornot
                WHERE user_id = ? AND task_id = ?
            )`
        const rows = await dbOps.select(query, [taskId, userId, taskId])
        return rows.map(row => row.image_id)
    },

    // folders are saved as tags in the data base, and a tag can have parent tags (a tag_relation)
    // folderStructure should be an array of every folder's full path
    // ex. folders: root -> subFolder === ['root/subFolder', 'root']
    async saveFolderStructure(folderStructure, user_id) {
        const createFolderTags = `INSERT INTO tags (name, user_id) VALUES (?, ?)`
        const createTagRelation = `INSERT INTO tag_relations (tag_id, parent_tag_id) VALUES (?, ?)`

        let folders = {}
        // first we iterate through and create all the folders/tags
        for (const folderPath of folderStructure) {
            let folderArray = folderPath.split(path.sep)
            const folderName = folderArray.pop()
            const parentFolderName = folderArray.join(path.sep)

            try {
                const results = await dbOps.executeWithResults(createFolderTags, [folderName, user_id])
                folders[folderPath] = {
                    'name': folderPath,
                    'id': results.insertId,
                    'parentFolderName': parentFolderName
                }

            } catch (error) {
                console.error('Error creating folder tag!')
                throw error
            }
        }

        // now we create a relation for each folder with a parent folder
        for (const folder of Object.values(folders)) {
            if (folder.parentFolderName !== '') {
                // add parent relationship
                try {
                    const parentFolder = folders[folder.parentFolderName]
                    await dbOps.execute(createTagRelation, [folder.id, parentFolder.id])
                } catch (error) {
                    console.error('Error creating tag relation!')
                    throw error
                }
            }
        }

        return folders
    },

    async addImage(path, hash, from_ip, user_id, original_name, folderId) {
        const addImageQuery = `INSERT INTO images (path, hash, from_ip, user_id, original_name) VALUES (?, ?, ?, ?, ?)` // insert image
        const addImageToTag = `INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)`

        try {
            const results = await dbOps.executeWithResults(addImageQuery, [path, hash, from_ip, user_id, original_name])
            console.log(`Successful image insert query: ${path}`);
            // its critical that we associate the images with a tag/folder, otherwise the frontend won't see the image
            await dbOps.execute(addImageToTag, [results.insertId, folderId])
            return true
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return false
            } else {
                console.error('Error saving image to database.')
                throw (err)
            }
        }
    },

    async renameImage(imageId, newName, user_id) {
        const renameImage = `UPDATE images SET original_name = ? WHERE id = ? AND user_id = ?`

        try {
            await dbOps.execute(renameImage, [newName, imageId, user_id])
            return true
        } catch (error) {
            console.error('Error renaming image!')
            throw error
        }
    },
    async moveImage(imageId, oldParentTagId, newParentTagId, user_id) {
        const deleteImageTags = `DELETE FROM image_tags WHERE image_id = ? AND tag_id = ?`
        const tagImage = `INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)`

        try {

            // TODO: user the transaction method
            await dbOps.execute(deleteImageTags, [imageId, oldParentTagId])
            await dbOps.execute(tagImage, [imageId, newParentTagId])
            return true
        } catch (error) {
            console.error('Error moving image in database operations.')
            throw error
        }
    },
    async deleteImage(imageId, user_id) {
        const deleteImage = `DELETE FROM images WHERE id = ? AND user_id = ?`
        // TODO: WARNING: deleting a photo will delete the photo from the task,
        // this is not obvious in the UI to the investigator and cause DAMAGE!
        const deleteImageFromTasks = `DELETE FROM task_images WHERE image_id = ?`

        try {
            await dbOps.execute(deleteImage, [imageId, user_id])
            await dbOps.execute(deleteImageFromTasks, [imageId])
            return true
        } catch (error) {
            console.error('Error deleting image.')
            throw error
        }
    },

    async createTag(tagName, user_id) {
        const createFolderTags = `INSERT INTO tags (name, user_id) VALUES (?, ?)`
        
        try {
            const results = await dbOps.executeWithResults(createFolderTags, [tagName, user_id])
            return results.insertId
        } catch (error) {
            console.error('Error creating folder tag!')
            throw error
        }
    },
    async renameTag(tagId, newName, user_id) {
        const renameFolderTag = `UPDATE tags SET name = ? WHERE id = ? AND user_id = ?`
        
        try {
            await dbOps.execute(renameFolderTag, [newName, tagId, user_id])
            return true
        } catch (error) {
            console.error('Error renaming tag!')
            throw error
        }
    },
    async moveTag(tagId, oldParentTagId, newParentTagId) {
        const deleteOldParentRelation = `DELETE FROM tag_relations WHERE tag_id = ? AND parent_tag_id = ?`
        const createTagRelation = `INSERT INTO tag_relations (tag_id, parent_tag_id) VALUES (?, ?)`

        try {

            // TODO: user the transaction method
            await dbOps.execute(deleteOldParentRelation, [tagId, oldParentTagId])
            await dbOps.execute(createTagRelation, [tagId, newParentTagId])
            return true
        } catch (error) {
            console.error('Error moving tag in database operations.')
            throw error
        }
    },
    async deleteTag(tagId, user_id) {
        const deleteTag = `DELETE FROM tags WHERE id = ? AND user_id = ?`

        try {
            await dbOps.execute(deleteTag, [tagId, user_id])
            return true
        } catch (error) {
            console.error('Error deleting tag.')
            throw error
        }

    }
}

// ---------------------------------
// USER BASED DATABASE METHODS
// ---------------------------------
const userOps = {
    async getUsers(userId) {
        const query = `SELECT id, fullname, username
                    FROM users
                    WHERE id != ?`
        const rows = await dbOps.select(query, [userId])

        return rows
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
                throw(err)
            }
        }
        
    },
}


// ---------------------------------
// DATA BASED DATABASE METHODS
// ---------------------------------
const dataOps = {
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

export { userOps, imageOps, dataOps }