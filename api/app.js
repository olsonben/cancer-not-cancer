/**********************************************
 * IMPORTS
 **********************************************/
// Basic stuff for the server
import express from 'express'              // We have an express server (https://expressjs.com/)
import env from './.env.js'
import envLocal from './.env.local.js'        // Hidden information not to be tracked by github (passwords and such)

/// Features
import bodyParser from 'body-parser'       // JSON parsing is NOT default with http; we have to make that possible (https://www.npmjs.com/package/body-parser)
import mysql from 'mysql'                  // We are using a database (https://expressjs.com/en/guide/database-integration.html#mysql)
import fs from 'fs'

import upload from './lib/multer.js'                         // multer
import funcs from './lib/functions.js'                      // Helper functions
// These are all for authentication
import auth from './lib/auth.js'                           // This needs to be loaded for passport.authenticate
import passport from 'passport'            // Authentication procedure (https://www.passportjs.org/)
import session from 'express-session'      // Session gives us cookies (https://www.npmjs.com/package/express-session)
import cookieParser from 'cookie-parser'   // We need to track things about the session (https://www.npmjs.com/package/cookie-parser)

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

/**
 * Image Handling
 */

app.use('/images', express.static('images'));   // This is REQUIRED for displaying images

/******************
 * REQUEST PARSING
 ******************/

// This is vital to parsing the json requests
app.use(bodyParser.json({           // to support JSON-encoded bodies
    type: 'application/json'
}));

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
    funcs.bounce(req, res)
})

// Failed authorization
app.get('/auth/failure', (req, res) => {
    if (['User not in database.', 'User not enabled.'].some(item => req.session.messages.includes(item))) {
        funcs.bounce(req, res)
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
 * Express REQUESTS
 **********************************************/

/*****************
 * GET
 *****************/
app.get('/nextImage', funcs.isLoggedIn, funcs.isValid, (req, res) => {
    console.log("Get /nextImage"); // tracking location 
    
    // Get random row
    // NOTE: this is not very efficient, but it works
    const query = `SELECT id, path FROM images ORDER BY times_graded, date_added LIMIT 1;`
    
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
app.post('/hotornot', funcs.isLoggedIn, funcs.isValid, (req, res) => {
    console.log("post /hotornot")
    // REMEMBER: the data in body is in JSON format
    
    const query = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) 
        VALUES (${req.user.id}, ${req.body.id}, ${req.body.rating}, "${req.body.comment}", ${funcs.getIP(req)});
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
app.post('/users', funcs.isLoggedIn, funcs.isValid, (req, res) => {
    console.log("Post /users");
    let query = `INSERT INTO users (fullname, username, password, is_enabled, is_pathologist, is_uploader, is_admin) VALUES 
        ("${req.body.fullname}", "${req.body.email}", "${req.body.password}", 
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
app.post('/images', funcs.isLoggedIn, funcs.isValid, upload.any(), (req, res) => {
    console.log("Post /images");
    // Check for proper content-type: multer only checks requests with multipart/form-data
    if (!req.headers['content-type'].includes('multipart/form-data')) {
        res.status(415).send('Content-Type must be multipart/form-data.')
    }
    if (req.files.length === 0) {
        res.status(200).send('No files uploaded.')
    }
    
    let count = 0
    let failFlag = false
    for (let file in req.files) {
        const query = `INSERT INTO images (path, hash, from_ip, user_id) VALUES ("/${req.files[file].path}", ${req.body.hash || 'NULL'}, ${funcs.getIP(req)}, ${req.user.id});` // insert image

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