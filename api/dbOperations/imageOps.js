import dbOps from "./dbConnection.js"
import * as path from 'path'

// ---------------------------------
// IMAGE BASED DATABASE METHODS
// ---------------------------------
/**
 * @typedef {Object} ImageObject
 * @property {string} path - Local image path on server.
 * @property {string} hash - File check some hash, nullable, sha256.
 * @property {date} date_added - Date image was uploaded.
 * @property {string} from_ip - IP address of uploaded.
 * @property {string} user_id - Uploaders user id (owner).
 * @property {string} times_graded - Number of times the image has been graded.
 * @property {string} original_name - Original file name, used for display but
 * not the actual file name which is in the path.
 */
const imageOps = {
    /**
     * Get image object by id.
     * @param {number} imageId - Image's id to look up.
     * @returns {ImageObject} - ImageObject which contains `path` and `original_name`.
     */
    async getNextImage(imageId) {
        const query = `SELECT id, path FROM images WHERE images.id = ?`
        const rows = await dbOps.select(query, [imageId])
        return rows[0]
    },

    /**
     * Database call that returns a queue of next images to be graded.
     * @param {Number} userId - User's id to check against existing ratings
     * @param {Number} taskId - Task id for which to build the queue of image ids.
     * @returns {Array.<Number>} - Returns an array of image id numbers.
     */
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

    /**
     * Translates an array or set of folder paths into tag and creates tag relations accordingly.
     * 
     * folders are saved as tags in the database, and a tag can have parent tags (a tag_relation)
     * folderStructure should be an array of every folder's full path
     * ex. folders: root -> subFolder === ['root/subFolder', 'root']
     * @param {Set.<String>} folderStructure - Iterable of strings representing folder paths.
     * @param {Number} user_id - The id of the owner of the folders (the investigator).
     * @returns {Object} - Object of all folders created with the folders path as the key
     * and { name, id, and parentFolderName}.
     */
    async saveFolderStructure(folderStructure, user_id) {
        const createFolderTag = `INSERT INTO tags (name, user_id) VALUES (?, ?)`
        const createTagRelation = `INSERT INTO tag_relations (tag_id, parent_tag_id) VALUES (?, ?)`

        let folders = {}
        // first we iterate through and create all the folders/tags
        for (const folderPath of folderStructure) {
            let folderArray = folderPath.split(path.sep)
            const folderName = folderArray.pop()
            const parentFolderName = folderArray.join(path.sep)

            try {
                const results = await dbOps.executeWithResults(createFolderTag, [folderName, user_id])
                // save new folder/tag id for reference later
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

    /**
     * Add image to database
     * @param {String} path - Relative path to file on server includes filename.
     * @param {String} hash - File check some hash, sha256.
     * @param {String} from_ip - Uploaders ip address.
     * @param {Number} user_id - Uploaders user id (owner of the image).
     * @param {String} original_name - Original file name.
     * @param {Number} folderId - Folder/tag id that the image should be associated with.
     * @returns {Boolean} - Returns true if successfull.
     */
    async addImage(path, hash, from_ip, user_id, original_name, folderId) {
        // its critical that we associate the images with a tag/folder, otherwise the frontend won't see the image
        const addImageQuery = `INSERT INTO images (path, hash, from_ip, user_id, original_name) VALUES (?, ?, ?, ?, ?)`
        const addImageToTag = `INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)`

        try {
            const transaction = await dbOps.startTransaction()
            const results = await transaction.query(addImageQuery, [path, hash, from_ip, user_id, original_name])
            await transaction.query(addImageToTag, [results.insertId, folderId])
            await transaction.commit()
            console.log(`Successful image insert query: ${path}`);
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

    /**
     * Rename a file.
     * @param {Number} imageId - ID of image to rename
     * @param {String} newName - New name of file.
     * @param {Number} user_id - User/owner's id of image.
     * @returns {Boolean} - Returns true if successfull.
     */
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
    /**
     * Move file to different folder/tag.
     * @param {Number} imageId - ID of image to move
     * @param {Number} oldParentTagId - ID of original folder/tag location.
     * @param {Number} newParentTagId - ID of new folder/tag location.
     * @param {Number} user_id - User/owner's id of image.
     * @returns {Boolean} - Returns true if successfull.
     */
    async moveImage(imageId, oldParentTagId, newParentTagId, user_id) {
        const deleteImageTags = `DELETE FROM image_tags WHERE image_id = ? AND tag_id = ?`
        const tagImage = `INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)`

        try {
            const transaction = await dbOps.startTransaction()
            await transaction.query(deleteImageTags, [imageId, oldParentTagId])
            await transaction.query(tagImage, [imageId, newParentTagId])
            await transaction.commit()
            return true
        } catch (error) {
            console.error('Error moving image in database operations.')
            throw error
        }
    },
    /**
     * Delete file
     * @param {Number} imageId - ID of image to delete.
     * @param {Number} user_id - User/owner's id of image.
     * @returns {Boolean} - Returns true if successfull.
     */
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