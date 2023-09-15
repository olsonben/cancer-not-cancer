import dbOps from "./dbConnection.js"
import * as path from 'path'

// ---------------------------------
// TAG BASED DATABASE METHODS
// ---------------------------------
const tagOps = {
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