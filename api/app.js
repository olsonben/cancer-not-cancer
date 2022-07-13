/**********************************************
 * IMPORTS
 **********************************************/
// Basic stuff for the server
const express = require('express')              // We have an express server (https://expressjs.com/)
const env = require('./.env')
const envLocal = require('./.env.local')        // Hidden information not to be tracked by github (passwords and such)

/// Features
const bodyParser = require('body-parser')       // JSON parsing is NOT default with http; we have to make that possible (https://www.npmjs.com/package/body-parser)
const mysql = require('mysql')                  // We are using a database (https://expressjs.com/en/guide/database-integration.html#mysql)
const multer = require('multer')                // Need to upload images (https://www.npmjs.com/package/multer)
const fs = require('fs')

// These four are all for authentication
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


/*****************
 * MariaDB DATABASE
 *****************/
const pool = mysql.createConnection({
    host: 'localhost',
    user: envLocal.db.user,
    password: envLocal.db.password,
    database: envLocal.db.database,
    multipleStatements: true
}) 
pool.connect()

/******************
 * REQUEST PARSING
 ******************/

// This is vital to parsing the json requests
app.use(bodyParser.json({           // to support JSON-encoded bodies
    type: 'application/json'
}));

/**
 * MULTER FILE UPLOADS
 */

const upload = multer({
    storage: multer.diskStorage({
        // Where to files
        destination: (req, file, cb) => {
            const folderName = './images/' + file.originalname.match(/^.*[\\\/]/)[0]
            fs.access(folderName, err => {
                if (err) {
                    fs.mkdirSync(folderName, { recursive: true })
                }
                cb(null, folderName) // We are only interested in images
            })
        },

        filename: (req, file, cb) => {
            // Joe is setting the files to have unique names
            cb(null, file.originalname.replace(/^.*[\\\/]/, ''))
        }
    }),

    // Multer completely ignores anything that doesn't pass this test, not even being noted in req.files
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop()
        // Only allow png, jpg, and jpeg
        if ([ 'png', 'jpg', 'jpeg' ].includes(ext)) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    },

    // Busboy (what multer uses to upload) will just use the file name if this is not set
    preservePath: true
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.use('/images', express.static('images'));   // This is REQUIRED for displaying images

/*****************
 * USER AUTHENTICATION
 *****************/

// This was done with this video: https://youtu.be/Q0a0594tOrc
app.use(
    cookieParser(),                             // Use cookies to track the session         :: req.session
    session({ secret: envLocal.session.secret }),    // Encrypted session
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
    bounce(req, res)
})

// Failed authorization
app.get('/auth/failure', (req, res) => {
    if (['User not in database.', 'User not enabled.'].some(item => req.session.messages.includes(item))) {
        bounce(req, res)
    } else {
        res.send("Something went wrong...")
    }
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
        failureRedirect: '/auth/failure', failureMessage: true,
        successRedirect: '/auth/success'
    })
)

/**********************************************
 * HELPER FUNCTIONS
 **********************************************/
function bounce(req, res, route='/') {
    // Bounce back to origin
    const origin = req.session.origin
    delete req.session.origin
    res.redirect(origin || route)
}

function isLoggedIn(req, res, next) {
    // Has user ? move on : unauthorized status
    if (req.user) {
        next()
    } else {
        req.session.origin = req.headers.referer // Remember the original url to bounce back to
        console.log("Origin: " + req.session.origin)
        res.status(401).send('/auth')
    } 
}

function getIP(req) {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    console.log(ip)
    ip = '"' + ip.substring(ip.lastIndexOf(':')+1) + '"'
    return ip
}

// Checking if a user is allowed to make a specific request
function isValid(req, res, next) {
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

/**********************************************
 * Express REQUESTS
 **********************************************/

/*****************
 * GET
 *****************/
app.get('/nextImage', isLoggedIn, isValid, (req, res) => {
    console.log("Get /nextImage"); // tracking location 
    
    // Get random row
    // NOTE: this is not very efficient, but it works
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
    if (req.user) {
        res.send(req.user)
    } else {
        res.status(401).send('/auth')
    }
})

/*****************
 * POST
 *****************/

// Insert the hotornots
app.post('/hotornot', isLoggedIn, isValid, (req, res) => {
    console.log("post /hotornot")
    // REMEMBER: the data in body is in JSON format
    
    query = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) 
    VALUES (${req.user.id}, ${req.body.id}, ${req.body.rating}, "${req.body.comment}", ${getIP(req)});
    UPDATE images 
    SET times_graded = times_graded + 1 
    WHERE id = ${req.body.id};`
    
    pool.query(query, (err, results, fields) => {
        if (err) throw err
        console.log("Successful hotornot insert query");
        res.sendStatus(200)
    })
})

// Insert new user
app.post('/users', isLoggedIn, isValid, (req, res) => {
    console.log("Post /users");
    query = 'INSERT INTO users (fullname, username, password, is_enabled, is_pathologist, is_uploader, is_admin) VALUES '
    query += `("${req.body.fullname}", "${req.body.email}", "${req.body.password}", 
        ${req.body.permissions.enabled ? 1 : 0}, 
        ${req.body.permissions.pathologist ? 1 : 0}, 
        ${req.body.permissions.uploader ? 1 : 0}, 
        ${req.body.permissions.admin ? 1 : 0});`

    pool.query(query, (err, rows, fields) => {
        if (err) {
            // No duplicate users
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(409).send({
                    message: "Email already exists in database.",
                    user: req.body
                })
            } else {
                throw err
            }
        } else {
            console.log("Successful user insert query");
            res.status(200).send(req.body)
        }
    })
})

// Insert new images
app.post('/images', isLoggedIn, isValid, upload.any(), (req, res) => {
    console.log("Post /images");
    // Check for proper content-type: multer only checks requests with multipart/form-data
    if (!req.headers['content-type'].includes('multipart/form-data')) {
        res.status(415).send('Content-Type must be multipart/form-data.')
    }
    if (req.files.length === 0) {
        console.log("in empty")
        res.status(200).send('No files uploaded.')
    }
    
    let count = 0
    let failFlag = false
    for (let file in req.files) {
        console.log("hello")
        query = `INSERT INTO images (path, hash, from_ip, user_id) VALUES ("/${req.files[file].path}", ${req.body.hash || 'NULL'}, ${getIP(req)}, ${req.user.id});` // insert image

        pool.query(query, (err, rows, fields) => {
            count++
            if (err) {
                // No duplicate images
                failFlag = true
                if (err.code === 'ER_DUP_ENTRY') {
                    req.files[file].message = "Path already exists in database."
                } else {
                    throw err
                }
            } else {
                console.log(`Successful image insert query: ${req.files[file].path}`)
            }

            if (count === req.files.length) {
                try {
                    // Respond as an error if any of the files failed
                    res.status(failFlag ? 409 : 200).send(req.files)
                } catch (err) {
                    if (err.code !== 'ERR_HTTP_HEADERS_SENT') throw err
                }
            }
        })
    }
})

/**********************************************
 * LISTEN
 **********************************************/

// Listen to the port
app.listen(port, () => {
    console.log(`CNC running on port ${port}`);
})






/**********************************************
 * EXTRA
 **********************************************/

// DEV: this to reduce the request for logging json
// const { route, user, _sessionManager, isUnauthenticated, isAuthenticated, logout, logOut, login, logIn, _passport, session, sessionID, sessionStore, _parsedOriginalUrl, signedCookies, cookies, secret, res, query, params, _parsedUrl, originalUrl, baseUrl, next, _dumped, _consuming, client, statusMessage, statusCode, method, url, upgrade, aborted, rawTrailers, trailers, rawHeaders, headers, complete, httpVersion, httpVersionMinor, httpVersionMajor, connection, socket, _maxListeners, _eventsCount, _events, readable, _readableState, body, ...qux } = req
// console.log(qux)