import dbOps from "./dbConnection.js"
import * as path from 'path'

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
    }
}


export default imageOps