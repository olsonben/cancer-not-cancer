import * as path from 'path'

// `export function ...` lets us deconstruct the import to get specific functions
export function isLoggedIn (req, res, next) {
    // Has user ? move on : unauthorized status
    if (req.isAuthenticated()) {
        next()
    } else {
        // redirects are handled else where
        // TODO: should this behavior be revised?
        res.status(401).send('/auth')
    } 
}

export function getIP (req) {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    ip = ip.substring(ip.lastIndexOf(':')+1)
    return ip
}

export function isEnabled (req, res, next) {
    if (req.user.permissions.enabled) {
        next()
    } else {
        // User is not enabled
        res.sendStatus(401)
    }
}

export function isAdmin(req, res, next) {
    if (req.user.permissions.admin) {
        next()
    } else {
        res.sendStatus(401)
    }
}

export function isPathologist(req, res, next) {
    if (req.user.permissions.pathologist) {
        next()
    } else {
        res.sendStatus(401)
    }
}

export function isUploader(req, res, next) {
    if (req.user.permissions.uploader) {
        next()
    } else {
        res.sendStatus(401)
    }
}

/** Use to wrap express middleware in generic try/catch. */
export function asyncHandler(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (error) {
            next(error) // Pass to generic error handler
        }
    }
}

/** Function that help create folder and file objects and structure */
export const virtualFileSystem = {
    /**
     * Creates a set of all possible folders paths.
     * @param {Array.<Object>} filesArray - Array of file objects full path file name.
     * @param {String} containerFolder - A base folder to contain all found folders/files.
     * @returns {Set.<String>} - root/folder_a -> { root, root/folder_a }
     */
    createFolderStructure(filesArray, containerFolder) {
        let folderStructure = new Set()
        folderStructure.add(containerFolder)
    
        for (const file of filesArray) {
            if (file.success) {
                let folders = file.sanitizedName.split(path.sep)
                const fileName = folders.pop()
                for (let i = folders.length; i != 0; i--) {
                    folderStructure.add(path.join(containerFolder, ...folders))
                    folders.pop()
                }
            }
        }
    
        return folderStructure
    },
    /** Returns a folder object. */
    createFolder(tag_id, tag_name, contents = []) {
        return {
            id: tag_id,
            name: tag_name,
            contents: contents,
            type: 'tag'
        }
    },
    /** Returns a file object. */
    createFile(image_id, image_path, selected = false) {
        return {
            id: image_id,
            name: image_path,
            selected: selected,
            type: 'img'
        }
    }
}