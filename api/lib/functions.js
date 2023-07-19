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
    ip = '"' + ip.substring(ip.lastIndexOf(':')+1) + '"'
    return ip
}

// Checking if a user is allowed to make a specific request
export function isValid (req, res, next) {
    // Each method and source has specific requirements to be valid
    const perms = req.user.permissions
    if (req.route.methods.get) {
        if (req.route.path === '/nextImage') {
            perms.pathologist && perms.enabled ? next() : res.sendStatus(401)
        } else if (req.route.path.includes('/getData')) {
            perms.uploader && perms.enabled ? next() : res.sendStatus(401)
        } else if (req.route.path === '/allTasks') {
            perms.uploader && perms.enabled ? next() : res.sendStatus(401)
        }
    } else if (req.route.methods.post) {
        // Checking enabled is redundant but safe
        if (req.route.path === '/hotornot') {
            perms.pathologist && perms.enabled ? next() : res.sendStatus(401)
        } else if (req.route.path === '/images') {
            perms.uploader && perms.enabled ? next() : res.sendStatus(401)
        } else if (req.route.path === '/users') {
            perms.admin && perms.enabled ? next() : res.sendStatus(401)
        }
    }
    return false
}

// export default wraps all the functions in one object
export default { isLoggedIn, getIP, isValid }