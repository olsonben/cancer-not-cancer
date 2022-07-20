/**********************************************
 * IMPORTS
 **********************************************/
// Basic stuff for the server
import express from 'express'               // We have an express server (https://expressjs.com/)
import env from './.env.js'
import envLocal from './.env.local.js'      // Hidden information not to be tracked by github (passwords and such)

/// Features
import bodyParser from 'body-parser'        // JSON parsing is NOT default with http; we have to make that possible (https://www.npmjs.com/package/body-parser)
import mysql from 'mysql'                   // We are using a database (https://expressjs.com/en/guide/database-integration.html#mysql)
import fs from 'fs'

import upload from './lib/upload.js'                                // multer
import { isLoggedIn, isValid, getIP } from './lib/functions.js'     // Helper functions
// These are all for authentication
import auth from './lib/auth.js'                                    // This needs to be loaded for passport.authenticate

/**********************************************
 * SERVER SETUP
 **********************************************/
// Make the server
const app = express() 
auth.setup(app)                         // Setup authentication routes for the app
const port = env.port || 5000;
const imageBaseURL = env.url.image
const baseURL = env.url.base


/*****************
 * MariaDB DATABASE
 *****************/
import dbConnect from './lib/database.js'
const pool = dbConnect(true)

/******************
 * REQUEST PARSING
 * 
 * These are vital for their respective areas
 ******************/

// JSON body structure
app.use(bodyParser.json({
    type: 'application/json'
}));

// Images
app.use('/images', express.static('images'))

/**********************************************
 * Express REQUESTS
 **********************************************/

/*****************
 * GET
 *****************/
app.get('/nextImage', isLoggedIn, isValid, (req, res) => {
    console.log("Get /nextImage");
    
    // Get random row
    // NOTE: this is not very efficient, but it works
    const query = "SELECT id, path FROM images ORDER BY times_graded, date_added LIMIT 1;"
    
    pool.query(query, (err, rows, fields) => {
        if (err) throw err
        res.send({
            id: rows[0].id, // imageID
            url: imageBaseURL + rows[0].path
        })
        console.log("Successful image get query")
    })
})

// Checker for if the user is authenticated
app.get('/isLoggedIn', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user)
    } else {
        res.status(401).send(baseURL + '/auth')
    }
})

/*****************
 * POST
 *****************/

// Insert the hotornots
app.post('/hotornot', isLoggedIn, isValid, (req, res) => {
    console.log("post /hotornot")
    // REMEMBER: the data in body is in JSON format
    
    const query = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) 
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
                return // Quit the function early to avoid compounding send
            } else {
                console.log(err)
            }
        }
        console.log("Successful user insert query");
        res.status(200).send(req.body)
    })
})

// Insert new images
app.post('/images', isLoggedIn, isValid, upload.any(), (req, res) => {
    console.log("Post /images");
    // Check for proper content-type: multer only checks requests with multipart/form-data
    if (!req.headers['content-type'].includes('multipart/form-data')) {
        res.status(415).send('Content-Type must be multipart/form-data.')
        return
    }
    if (req.files.length === 0) {
        res.status(200).send('No files uploaded.')
        return
    }
    
    let count = 0
    let failFlag = false
    for (let file in req.files) {
        const query = `INSERT INTO images (path, hash, from_ip, user_id) VALUES ("/${req.files[file].path}", ${req.body.hash || 'NULL'}, ${getIP(req)}, ${req.user.id});` // insert image

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
                    return
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

// This is to control shutdown
// nodemon sends out `SIGUSR2` to restart
process.once('SIGUSR2', () => {
    // This is to kill the process
    process.kill(process.pid);
})




/**********************************************
 * EXTRA
 **********************************************/

// DEV: this to reduce the request for logging json
// const { route, user, _sessionManager, isUnauthenticated, isAuthenticated, logout, logOut, login, logIn, _passport, session, sessionID, sessionStore, _parsedOriginalUrl, signedCookies, cookies, secret, res, query, params, _parsedUrl, originalUrl, baseUrl, next, _dumped, _consuming, client, statusMessage, statusCode, method, url, upgrade, aborted, rawTrailers, trailers, rawHeaders, headers, complete, httpVersion, httpVersionMinor, httpVersionMajor, connection, socket, _maxListeners, _eventsCount, _events, readable, _readableState, body, ...qux } = req
// console.log(qux)