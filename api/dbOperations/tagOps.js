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
        const results = await dbOps.executeWithResults(createFolderTags, [tagName, user_id])
        return results.insertId
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
        await dbOps.execute(renameFolderTag, [newName, tagId, user_id])
    },
    /**
     * Move a tag by changing its parent tag relation.
     * @param {Number} tagId - Id of tag to be moved
     * @param {Number} oldParentTagId - Old parent tag id
     * @param {Number} newParentTagId - New parent tag id
     */
    async moveTag(tagId, oldParentTagId, newParentTagId) {
        const deleteOldParentRelation = `DELETE FROM tag_relations WHERE tag_id = ? AND parent_tag_id = ?`
        const createTagRelation = `INSERT INTO tag_relations (tag_id, parent_tag_id) VALUES (?, ?)`

        const transaction = await dbOps.startTransaction()
        await transaction.query(deleteOldParentRelation, [tagId, oldParentTagId])
        await transaction.query(createTagRelation, [tagId, newParentTagId])
        await transaction.commit()
    },
    /**
     * Delete a tag by id.
     * @param {Number} tagId - Id of tag to delete
     * @param {Number} user_id - Id of tag owner
     */
    async deleteTag(tagId, user_id) {
        const hasDependencies = `SELECT 1 AS result
            WHERE
            EXISTS (SELECT 1 FROM image_tags WHERE image_tags.tag_id = ?)
            OR
            EXISTS (SELECT 1 FROM tag_relations WHERE tag_relations.parent_tag_id = ?)`
        const deleteTag = `DELETE FROM tags WHERE id = ? AND user_id = ?`

        const result = await dbOps.select(hasDependencies, [tagId, tagId])
        if (result.length === 0) { // No dependencies
            await dbOps.execute(deleteTag, [tagId, user_id])
            return true
        } else {
            return false
        }
    },
    /**
     * Delete a list of tags.
     * @param {Number} tagIds - Id of tag to delete
     * @param {Number} user_id - Id of tag owner
     */
    async deleteTags(tagIds, user_id) {
        if (tagIds.length === 0) {
            // This shouldn't happen.
            console.log('Empty array of tag ids sent to deleteTags.')
            return true
        }

        const tagPlaceholders = Array.from(Array(tagIds.length), () => '?').join(', ')
        const hasDependencies = `SELECT 1 AS result
            WHERE
            EXISTS (SELECT 1 FROM image_tags WHERE image_tags.tag_id IN (${tagPlaceholders}))`
        const deleteTag = `DELETE FROM tags WHERE id IN (${tagPlaceholders}) AND user_id = ?`

        const result = await dbOps.select(hasDependencies, tagIds)
        if (result.length === 0) { // No dependencies
            await dbOps.execute(deleteTag, [...tagIds, user_id])
            return true
        } else {
            return false
        }
    }
}

export default tagOps