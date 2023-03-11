// Tag our process to easily identify later
import process from 'node:process'
process.title = process.title + ' app.js [CancerNotCancer API]'
console.log("PID: " + process.pid + " process title is " + process.title)

/**********************************************
 * IMPORTS
 **********************************************/
// Basic stuff for the server
import express from 'express' // We have an express server (https://expressjs.com/)

/// Features
import bodyParser from 'body-parser' // JSON parsing is NOT default with http; we have to make that possible (https://www.npmjs.com/package/body-parser)
import mysql from 'mysql' // We are using a database (https://expressjs.com/en/guide/database-integration.html#mysql)

import { uploadImages } from './lib/upload.js' // middleware to handle uploads
import { isLoggedIn, isValid, getIP } from './lib/functions.js'     // Helper functions
// These are all for authentication
import auth from './lib/auth.js' // This needs to be loaded for passport.authenticate

/**********************************************
 * SERVER SETUP
 **********************************************/
// Make the server
const app = express()

auth.setup(app) // Setup authentication routes for the app
const port = process.env.PORT || 5000;
const imageBaseURL = process.env.IMAGE_URL


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

// Server images if using local development
if (process.env.NODE_ENV != 'production') {
    console.log('Serving images locally from:')
    console.log(`  ${process.env.IMAGES_DIR}`)
    app.use('/images', express.static(process.env.IMAGES_DIR))
}


/**********************************************
 * Express REQUESTS
 **********************************************/

// TODO: remove when no longer needed.
app.get('/123', (req, res) => {
    res.send('This is a test!!!')
})

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
        let imagePath = rows[0].path
        if (imageBaseURL.slice(-1) == "/") {
            if (rows[0].path.charAt(0) == "/") {
                imagePath = imagePath.slice(1)
            }
        } else if (rows[0].path.charAt(0) != "/") {
            imagePath = "/" + imagePath
        }

        let url = imageBaseURL + imagePath
        res.send({
            id: rows[0].id, // imageID
            url: imageBaseURL + rows[0].path
        })
        console.log("Successful image get query")
    })
})

// Checker for if the user is authenticated (NOT middleware)
app.get('/isLoggedIn', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user)
    } else {
        // Send false/no user data
        res.status(200).send(false)
    }
})

/*****************
 * POST
 *****************/

// Insert the hotornots
app.post('/hotornot', isLoggedIn, isValid, (req, res) => {
    console.log("post /hotornot")
    // REMEMBER: the data in body is in JSON format

    // Check types
    let flag = false
    let message = []
    if (typeof req.body.id !== 'number') {
        flag = true
        message += "Image ID is not a number"
    } if (typeof req.body.rating !== 'number') {
        flag = true
        message += "Rating is not a number"
    } if (typeof req.body.comment !== 'string') {
        flag = true
        message += "Message is not a string"
    } if (flag) {
        res.status(415).send(message)
        return
    }

    // Check comment length: MariaDB has a max text length of 65,535 characters
    if (req.body.comment.length > 65535) {
        res.status(413).send(["Comment too long"])
        return
    }
    
    const query = `INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) 
        VALUES (${req.user.id}, ${req.body.id}, ${req.body.rating}, "${req.body.comment}", ${getIP(req)});
        UPDATE images 
        SET times_graded = times_graded + 1 
        WHERE id = ${req.body.id};`
    
    pool.query(query, (err, results, fields) => {
        if (err) console.log(err)
        console.log("Successful hotornot insert query");
        res.sendStatus(200)
    })
})

// Insert new user
app.post('/users', isLoggedIn, isValid, (req, res) => {
    console.log("Post /users");

    // Check permissions
    if (typeof req.body.fullname !== 'string' ||
            typeof req.body.email !== 'string' ||
            typeof req.body.password !== 'string') {
        res.sendStatus(415)
        return
    }

    // Check string lengths
    let flag = false
    let message = []
    console.log(req.body)
    if (req.body.fullname.length > 256) {
        flag = true
        message += "Name too long"
    } if (req.body.email.length > 320) {
        flag = true
        message += "Email too long"
    } if (req.body.password.length > 50) {
        flag = true
        message += "Password too long"
    } if (flag) {
        res.status(413).send(message)
    }

    const query = `INSERT INTO users (fullname, username, password, is_enabled, is_pathologist, is_uploader, is_admin) VALUES 
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


async function dbConfirm(file, req) {
    const query = `INSERT INTO images (path, hash, from_ip, user_id) VALUES ("${file.filename}", ${req.body.hash || 'NULL'}, ${getIP(req)}, ${req.user.id});` // insert image

    return new Promise((resolve, reject) => {
        pool.query(query, (err, rows, fields) => {
            if (err) {
                // No duplicate images
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log('File already exists:', file.filename)
                    resolve(false)
                } else {
                    console.error(err)
                    reject(err)
                }
            } else {
                console.log(`Successful image insert query: ${file.filename}`)
                resolve(true)
            }
        })
    })
}

function dbApprove(files) {
    // TODO:
    // For each file if file.success is true update db entry and make image live
}

app.post('/images', isLoggedIn, isValid, uploadImages(dbConfirm), (req, res) => {
    dbApprove(req.files)
    res.status(200).send(req.files)
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