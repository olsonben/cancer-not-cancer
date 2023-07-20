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

import { uploadImages, removeFile, removeEmptyImageFolders } from './lib/upload.js' // middleware to handle uploads
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


/******************
 * DATABASE Methods
 ******************/
import {
    getNextImage,
    addRating,
    createUser,
    addImage,
    getData,
    getDataPerUsers,
    getDataPerImages,
    getTasks,
    getUsers
 } from './lib/database.js'

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

/*****************
 * GET
 *****************/
app.get('/nextImage', isLoggedIn, isValid, async (req, res, next) => {
    console.log("Get /nextImage");
    
    try {
        const img = await getNextImage()
        // TODO: Use URLs and Path Join instead of this logic
        let imagePath = img.path
        if (imageBaseURL.slice(-1) == "/") {
            if (img.path.charAt(0) == "/") {
                imagePath = imagePath.slice(1)
            }
        } else if (img.path.charAt(0) != "/") {
            imagePath = "/" + imagePath
        }

        let url = imageBaseURL + imagePath
        res.send({
            id: img.id, // imageID
            url: imageBaseURL + img.path
        })
    } catch (err) {
        next(err)
    }
    
    
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

app.get('/getUsers', isLoggedIn, isValid, async (req, res) => {
    const adminUserId = req.user.id
    try {
        const data = await getUsers(adminUserId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
})

// For data view
// TODO: Add some better data checking to make sure the user owns the data they
//       are looking at.
app.get('/getData', isLoggedIn, isValid, async (req, res) => {
    const taskId = req.query.task_id
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }

    try {
        const data = await getData(investigatorId, taskId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
})

app.get('/allTasks', isLoggedIn, isValid, async (req, res) => {
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }
    try {
        const data = await getTasks(investigatorId)
        res.send(data)
    } catch (err) {
        res.status(500).send({})
    }
})

app.get('/getDataPerUsers', isLoggedIn, isValid, async (req, res) => {
    const taskId = req.query.task_id
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }
    try {
        const data = await getDataPerUsers(investigatorId, taskId)
        res.send(data)
    } catch (err) {
        console.error(err)
        res.status(500).send({})
    }
})

app.get('/getDataPerImages', isLoggedIn, isValid, async (req, res) => {
    const taskId = req.query.task_id
    let investigatorId = req.user.id
    if (req.query.user_id && req.user.permissions.admin) {
        investigatorId = req.query.user_id
    }
    try {
        const data = await getDataPerImages(investigatorId, taskId)
        res.send(data)
    } catch (err) {
        console.error(err)
        res.status(500).send({})
    }
})

/*****************
 * POST
 *****************/

// Insert the hotornots
app.post('/hotornot', isLoggedIn, isValid, async (req, res, next) => {
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
    
    try {
        const insertSuccess = await addRating(
            req.user.id,
            req.body.id,
            req.body.rating,
            req.body.comment,
            getIP(req))

        if (insertSuccess) {
            res.sendStatus(200)
        }
    } catch (err) {
        next(err)
    }
})

// Insert new user
app.post('/users', isLoggedIn, isValid, async (req, res, next) => {
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

    try {
        const addUserSuccess = await createUser(
            req.body.fullname,
            req.body.email,
            req.body.password,
            req.body.permissions.enabled,
            req.body.permissions.pathologist,
            req.body.permissions.uploader,
            req.body.permissions.admin
        )

        if (addUserSuccess) {
            res.status(200).send(req.body)
        } else {
            // No duplicate users
            res.status(409).send({
                message: "Email already exists in database.",
                user: req.body
            })
        }
    } catch (err) {
        next(err)
    }
})


async function saveUploadsToDb(req, res, next) {
    const ip = getIP(req)
    for (const file of req.files) {
        if (file.success) {
            try {
                const insertImageSuccess = await addImage(
                    // TODO: move this concatenation to upload.js
                    file.relPath, // safe: created by the server
                    file.hash || null,
                    ip,
                    req.user.id
                )

                if (!insertImageSuccess) {
                    console.log('File already exists:', file.sanitizedName)
                    file.success = false
                    file.message = 'File already exists.'
                }
            } catch(err) {
                // database error
                console.error(err)
                file.success = false
                file.message = 'Upload Error. Please try again later.'
            }
        }
    }
    next()
}

async function removeFailedImageSaves(req, res, next) {
    for (const file of req.files) {
        if (!file.success) {
            await removeFile(file.savePath)
        }
    }
    removeEmptyImageFolders()
    next()
}

const uploadImageChain = [uploadImages, saveUploadsToDb, removeFailedImageSaves]

// TODO: update the image pipeline to use unified error handler via `next(err)`
app.post('/images', isLoggedIn, isValid, uploadImageChain, (req, res, next) => {
    if (req.files.length === 0) {
        res.status(200).send('No files uploaded.')
    } else {
        const allowedKeys = ["filename", "mimeType", "id", "relPath", "success", "message"]
        const resultData = req.files.map((file) => {
            const filteredFile = Object.keys(file)
            .filter(key => allowedKeys.includes(key))
            .reduce((obj, key) => {
                obj[key] = file[key]
                return obj
            }, {})
            return filteredFile
        })
        
        res.status(200).send(resultData)
    }
})


// Unified error handler
app.use((err, req, res, next) => {
    console.log("Sending status(500). Route error caught...")
    console.error('\x1b[31m', err.stack, '\x1b[0m')
    res.status(500).send('Something broke!')
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