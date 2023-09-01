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

// export default wraps all the functions in one object
export default { isLoggedIn, getIP, isEnabled, isAdmin, isUploader, isPathologist }