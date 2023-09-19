import dbOps from "./dbConnection.js"
import * as path from 'path'

// ---------------------------------
// TAG BASED DATABASE METHODS
// ---------------------------------
// Tags can be thought of as a way to represent folders virtually. Then the owner
// of a file can organize files how ever they like while the server can save the
// actual files where ever and how ever it would like.
const tagOps = {
    /**
     * Create a new tag in the database.
     * @param {String} tagName - Name of tag/folder
     * @param {Number} user_id - Id of user creating tag
     * @returns {Number} - Id of the newly created tag.
     */
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
    /**
     * Rename a tag in the database.
     * @param {Number} tagId - Id of tag to be renamed
     * @param {String} newName - Name of tag/folder
     * @param {Number} user_id - Id of user creating tag
     * @returns True
     */
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
    /**
     * Move a tag by changing its parent tag relation.
     * @param {Number} tagId - Id of tag to be moved
     * @param {Number} oldParentTagId - Old parent tag id
     * @param {Number} newParentTagId - New parent tag id
     * @returns {Boolean}
     */
    async moveTag(tagId, oldParentTagId, newParentTagId) {
        const deleteOldParentRelation = `DELETE FROM tag_relations WHERE tag_id = ? AND parent_tag_id = ?`
        const createTagRelation = `INSERT INTO tag_relations (tag_id, parent_tag_id) VALUES (?, ?)`

        try {
            const transaction = await dbOps.startTransaction()
            await transaction.query(deleteOldParentRelation, [tagId, oldParentTagId])
            await transaction.query(createTagRelation, [tagId, newParentTagId])
            await transaction.commit()
            return true
        } catch (error) {
            console.error('Error moving tag in database operations.')
            throw error
        }
    },
    /**
     * Delete a tag by id.
     * @param {Number} tagId - Id of tag to delete
     * @param {Number} user_id - Id of tag owner
     * @returns {boolean} - True
     */
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

export default tagOps