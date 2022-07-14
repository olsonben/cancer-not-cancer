export default {
    bounce: (req, res, route='/') => {
        // Bounce back to origin
        const origin = req.session.origin
        delete req.session.origin
        res.redirect(origin || route)
    },
    
    isLoggedIn: (req, res, next) => {
        // Has user ? move on : unauthorized status
        if (req.user) {
            next()
        } else {
            req.session.origin = req.headers.referer // Remember the original url to bounce back to
            console.log("Origin: " + req.session.origin)
            res.status(401).send('/auth')
        } 
    },
    
    getIP: (req) => {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        console.log(ip)
        ip = '"' + ip.substring(ip.lastIndexOf(':')+1) + '"'
        return ip
    },
    
    // Checking if a user is allowed to make a specific request
    isValid: (req, res, next) => {
        // Each method and source has specific requirements to be valid
        const perms = req.user.permissions
        if (req.route.methods.get) {
            if (req.route.path === '/nextImage') {
                perms.pathologist && perms.enabled ? next() : res.sendStatus(401)
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
}