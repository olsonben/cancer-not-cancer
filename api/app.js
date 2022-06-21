/**********************************************
 * IMPORTS
 **********************************************/
// Basic stuff for the server
const express = require('express')              // We have an express server (https://expressjs.com/)
const env = require('./.env')                   // Hidden information not to be tracked by github (passwords and such)

/// Features
const bodyParser = require('body-parser')       // JSON parsing is NOT default with http; we have to make that possible (https://www.npmjs.com/package/body-parser)
const mysql = require('mysql')                  // We are using a database (https://expressjs.com/en/guide/database-integration.html#mysql)
const multer = require('multer')                // Need to upload images (https://www.npmjs.com/package/multer)

// These four all all for authentication
require('./auth')                               // This needs to be loaded for passport.authenticate
const passport = require('passport')            // Authentication procedure (https://www.passportjs.org/)
const session = require('express-session')      // Session gives us cookies (https://www.npmjs.com/package/express-session)
const cookieParser = require('cookie-parser')   // We need to track things about the session (https://www.npmjs.com/package/cookie-parser)

/**********************************************
 * SERVER SETUP
 **********************************************/
// Make the server
const app = express() 
const port = env.port || 5000;
const imageBaseURL = env.url.image
const baseURL = env.url.base

// This is vital to parsing the json requests
app.use(bodyParser.json({           // to support JSON-encoded bodies
    type: 'application/json'
}));

/**
 * MariaDB DATABASE
 */
const pool = mysql.createConnection({
    host: 'localhost',
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: true
}) 
pool.connect()

/**
 * MULTER FILE UPLOADS
 */

const upload = multer({
    storage: multer.diskStorage({
        // Where to files
        destination: (req, file, cb) => {
            cb(null, './images/') // We are only interested in images
        },

        filename: (req, file, cb) => {
            // TODO: mandate unique filename
            cb(null, file.originalname)
        }
    }),

    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop()
        // Only allow png, jpg, and jpeg
        if ([ 'png', 'jpg', 'jpeg' ].includes(ext)) {
            cb (null, true)
        } else {
            cb(null, false)
        }
    }
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.use('/images', express.static('images'));   // This is REQUIRED for displaying images

/**
 * USER AUTHENTICATION
 */

// This was done with this video: https://youtu.be/Q0a0594tOrc
app.use(
    cookieParser(),                             // Use cookies to track the session         :: req.session
    session({ secret: env.session.secret }),    // Encrypted session
    passport.initialize(),                      // Google OAuth2 is a passport protocol
    passport.session()                          // Need to track the user as a session      :: req.user
)

/**
 * GENERAL AUTHENTICATION ROUTES
 */

// Authorization options page
app.get('/auth', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>')
})

// Handle successful authentications
app.get('/auth/success', (req, res) => {
    // Check to make sure they were allowed
    if (!req.user.allowed) {
        res.status(403)
    }
    // Bounce back to origin
    const origin = req.session.origin
    delete req.session.origin
    res.redirect(origin || '/') // NOTE: After setting up index page on frontend, send to '/'
})

// Failed authorization
app.get('/auth/failure', (req, res) => {
    res.send("Something went wrong...")
})

// Log out the user
app.get('/auth/logout', (req, res) => {
    req.logout()            // Log out the user
    req.session.destroy()   // kill their session
    res.send('Goodbye!')
})

/**
 * GOOGLE AUTHENTICATION
 */
//                                                  Interested in: email
app.get('/auth/google', passport.authenticate('google', { scope: ['email'] }))

// You need to tell google where to go for successful and failed authorizations
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/failure',
        successRedirect: '/auth/success'
    })
)

/**********************************************
 * HELPER FUNCTIONS
 **********************************************/
function isLoggedIn(req, res, next) {
    // has user ? move on : unauthorized status
    if (req.user && req.user.allowed) {
        next()
    } else {
        req.session.origin = req.headers.referer // Remember the original url to bounce back to
        console.log("Origin: " + req.session.origin)
        res.status(401).send('/auth')
    } 
}

function getIP(req) {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    ip = '"' + ip.substring(ip.lastIndexOf(':')+1) + '"'
    return ip
}

// Checking if a user is allowed to make a specific request
function isValid(req, res, next) {
    // Each method and source has specific requirements to be valid
    const perms = req.user.database.permissions
    if (req.route.methods.get) {
        if (req.route.path === '/nextImage') {
            perms.pathologist && perms.enabled ? next() : res.sendStatus(401)
        }
    } else if (req.route.methods.post) {
        // checking enabled is redundant but safe
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

/**********************************************
 * Express REQUESTS
 **********************************************/

/**********************************************
 * GET
 **********************************************/
app.get('/nextImage', isLoggedIn, isValid, (req, res) => {
    console.log("Get /nextImage"); // tracking location
    
    // Get random row
    // NOTE: this is not very efficient, but it works
    // TODO: only consider rows with a rule - eg. least # of hotornot entries
    query = `SELECT id, path FROM images ORDER BY times_graded, date_added LIMIT 1;`
    
    pool.query(query, (err, rows, fields) => {
        if (err) throw err
        res.send({
            id: rows[0].id, // imageID
            url: imageBaseURL + rows[0].path
        })
        console.log("Successful image get query");
    })
})

app.get('/isLoggedIn', (req, res) => {
    if (req.user && req.user.allowed) {
        res.send(req.user)
    } else {
        res.status(401).send('/auth')
    }
})

/**********************************************
 * POST
 **********************************************/

app.post('/hotornot', isLoggedIn, isValid, (req, res) => {
    console.log("post /hotornot")
    // REMEMBER: the data in body is in JSON format
    
    // Insert the hotornots
    query = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) 
    VALUES (${req.user.database.id}, ${req.body.id}, ${req.body.rating}, "${req.body.comment}", ${getIP(req)});
    UPDATE images 
    SET times_graded = times_graded + 1 
    WHERE id = ${req.body.id};`
    
    pool.query(query, (err, results, fields) => {
        if (err) throw err
        console.log("Successful hotornot insert query");
        res.sendStatus(200)
    })
})

app.post('/users', isLoggedIn, isValid, (req, res) => {
    console.log("Post /users");

    // Insert new user
    query = 'INSERT INTO users (fullname, username, password, is_enabled, is_pathologist, is_uploader, is_admin) VALUES '
    query += `("${req.body.fullname}", "${req.body.email}", "${req.body.password}", 
        ${req.body.permissions.enabled === 1 ? 1 : 0}, 
        ${req.body.permissions.pathologist === 1 ? 1 : 0}, 
        ${req.body.permissions.uploader === 1 ? 1 : 0}, 
        ${req.body.permissions.admin === 1 ? 1 : 0});`

    pool.query(query, (err, rows, fields) => {
        if (err) {
            // No duplicate users
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(409).send("Email already exists in database.")
            } else {
                throw err
            }
        } else {
            console.log("Successful user insert query");
            res.sendStatus(200)
        }
    })
})

app.post('/images', isLoggedIn, isValid, upload.any(), (req, res) => {
    console.log("Post /images");

    // Check for proper content-type: multer only checks requests with multipart/form-data
    if (!req.headers['content-type'].includes('multipart/form-data')) {
        req.sendStatus(415).send('Content-Type must be multipart/form-data')
    }
    
    // Insert new images
    let uploaded = 0
    let count = 0
    for (let file of req.files) {
        query = `INSERT INTO images (path, hash, from_ip, user_id) VALUES ("/${file.path}", ${req.body.hash || 'NULL'}, ${getIP(req)}, ${req.user.database.id});` // insert image

        pool.query(query, (err, rows, fields) => {
            count++
            if (err) {
                // No duplicate images
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(409).send("Path already exists in database.")
                } else {
                    throw err
                }
            }
            console.log(`Successful image insert query: ${file.path}`)
            uploaded++
            if (count === req.files.length) {
                res.send({
                    message: 'OK',
                    uploaded: uploaded
                })
            }
        })
    }
})

/**********************************************
 * LISTEN
 **********************************************/

// listen to app
app.listen(port, () => {
    console.log(`CNC running on port ${port}`);
})






/**********************************************
 * EXTRA
 **********************************************/

// User this to reduce the request for logging json
// const { route, user, _sessionManager, isUnauthenticated, isAuthenticated, logout, logOut, login, logIn, _passport, session, sessionID, sessionStore, _parsedOriginalUrl, signedCookies, cookies, secret, res, query, params, _parsedUrl, originalUrl, baseUrl, next, _dumped, _consuming, client, statusMessage, statusCode, method, url, upgrade, aborted, rawTrailers, trailers, rawHeaders, headers, complete, httpVersion, httpVersionMinor, httpVersionMajor, connection, socket, _maxListeners, _eventsCount, _events, readable, _readableState, body, ...qux } = req
// console.log(qux)