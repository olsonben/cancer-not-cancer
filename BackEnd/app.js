/**********************************************
 * IMPORTS
 **********************************************/
// Basic stuff for the server
const express = require('express')
const path = require('path')
const env = require('./.env') // js will still include this even though it doesn't specify file ending 

// Features
const bodyParser = require('body-parser')
const mysql = require('mysql')

require('./auth')                           // This needs to be loaded for passport.authenticate
const passport = require('passport')        // Authentication procedure
const session = require('express-session')  // Session gives us cookies
const cookieParser = require('cookie-parser')

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

// This is for connecting to the MariaDB db
const pool = mysql.createConnection({
    host: 'localhost',
    user: env.db.user,
    password: env.db.password,
    database: env.db.database
}) 
pool.connect()

// For file uploads with multer
const multer = require('multer')

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads/')
        },

        filename: (req, file, cb) => {
            cb(null, file.originalname)
        }
    }),

    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop()
        if ([ 'png', 'jpg', 'jpeg' ].includes(ext)) {
            cb (null, true)
        } else {
            cb(null, false)
        }
    }
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.headers);
    console.log(req.file, req.body)
//     req.headers = {
//   host: '127.0.0.1:5000',
//   connection: 'close',
//   'content-length': '7718',
//   'cache-control': 'max-age=0',
//   'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
//   'sec-ch-ua-mobile': '?0',
//   'sec-ch-ua-platform': '"macOS"',
//   'upgrade-insecure-requests': '1',
//   origin: 'https://api.milmed.ai',
//   'content-type': 'multipart/form-data; boundary=----WebKitFormBoundarygzAJepAaVMCT8BsZ',
//   'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36',
//   accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//   'sec-fetch-site': 'same-origin',
//   'sec-fetch-mode': 'navigate',
//   'sec-fetch-user': '?1',
//   'sec-fetch-dest': 'document',
//   referer: 'https://api.milmed.ai/admin',
//   'accept-encoding': 'gzip, deflate, br',
//   'accept-language': 'en-US,en;q=0.9',
//   cookie: 'auth.strategy=google; auth.redirect=%2Fprotected; connect.sid=s%3Ax1qYljsFuoUChX2kK81PKYwpQDDT5Nlq.WZLp89eni3x29jS9LHjj29qjXw1Fy6B8rqh%2BNpwKR%2Fo'
// }
// req.file = {
//   fieldname: 'file',
//   originalname: 'book.png',
//   encoding: '7bit',
//   mimetype: 'image/png',
//   destination: './uploads/',
//   filename: 'a307efd2abf7bcac1992fd28d465ce46',
//   path: 'uploads/a307efd2abf7bcac1992fd28d465ce46',
//   size: 7537
// } [Object: null prototype]; req.body = {}
});

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

// Google OAuth 2.0 stuff
// This was done with this video: https://youtu.be/Q0a0594tOrc
app.use(
    cookieParser(),
    session({ secret: env.session.secret }),
    passport.initialize(),
    passport.session()
)

// Authorization options page
app.get('/auth', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>')
})

// Falied authorization
app.get('/auth/failure', (req, res) => {
    res.send("Something went wrong...")
})

// Authenticate the session with google
app.get('/auth/google',
    //                        Interested in: email and profile (name, id, language, profile pic)
    passport.authenticate('google', { scope: ['email', 'profile'] })
)
// Same for post
app.post('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

// You need to tell google where to go for successul and failed authorizations
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/failure',
        successRedirect: '/auth/success'
    })
)

// Handle successful authentications
app.get('/auth/success', (req, res) => {
    // Store the user id from the DB
    const origin = req.session.origin
    delete req.session.origin;
    // NOTE: After setting up index page on frontend, send to '/'
    res.redirect(origin || '/pathapp');
})

// Requirments for a user to log out
app.get('/logout', (req, res) => {
    req.logout()            // Log out the user
    req.session.destroy()   // kill their session
    res.send('Goodbye!')
})

/**********************************************
 * HELPER FUNCTIONS
 **********************************************/
function isLoggedIn(req, res, next) {
    // has user ? move on : unauthorized status
    if (req.user) {
        next()
    } else {
        req.session.origin = req.originalUrl
        res.redirect('/auth')
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
    if (req.route.methods.get) {
        if (req.route.path === '/nextImage') {
            // Anyone can get images
            next()
        }
    } else if (req.route.methods.post) {
        // checking enabled is redundant but safe
        if (req.route.path === '/hotornot') {
            // Only pathologists can hotornot
            req.user.database.permissions.pathologist && req.user.database.permissions.enabled ? next() : res.sendStatus(401)
        } else if (req.route.path === '/images') {
            // Anyone can add images
            req.user.database.permissions.uploader && req.user.database.permissions.enabled ? next() : res.sendStatus(401)
        } else if (req.route.path === '/users') {
            // Only admins can add users
            req.user.database.permissions.admin && req.user.database.permissions.enabled ? next() : res.sendStatus(401)
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
    query = `SELECT id, path FROM images ORDER BY RAND() LIMIT 1;`
    
    pool.query(query, (err, rows, fields) => {
        if (err) throw err
        res.send({
            id: rows[0].id, // imageID
            url: imageBaseURL + rows[0].path
        })
        console.log("Successful image get query");
    })
})

/**********************************************
 * POST
 **********************************************/

app.post('/hotornot', isLoggedIn, isValid, (req, res) => {
    console.log("post /hotornot")
    
    // REMEMBER: the data in body is in JSON format
    
    // Insert the hotornots
    query = 'INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) VALUES '
    query += `(${req.user.database.id}, ${req.body.id}, ${req.body.rating}, "${req.body.comment}", ${getIP(req)});`
    
    pool.query(query, (err, rows, fields) => {
        if (err) throw err
        console.log("Successful hotornot insert query");
        res.sendStatus(200)
    })
})

app.post('/users', isLoggedIn, isValid, (req, res) => {
    console.log("post /users");

    // this should test if person adding new users has permission
    if (false) {
        // Insert new user
        query = `INSERT INTO users (fullname, username, password, is_pathologist) VALUES ("${req.body.fullname}", "${req.body.username}", "${req.body.password}", ${req.body.is_pathologist ? 1 : 0});` // insert user
        pool.query(query, (err, rows, fields) => {
            if (err) throw err
            console.log("Successful user insert query");
            res.sendStatus(200)
        })
    }
})

app.post('/images', (req, res) => {
    console.log("post /images");

    jimp.read()

    // if (false) {
    //     // Insert new image
    //     query = `INSERT INTO images (path, hash, from_ip, user_id) VALUES ("${req.body.path}", ${req.body.hash}, ${getIP(req)}, ${req.user.database.id}));` // insert image
    //     pool.query(query, (err, rows, fields) => {
    //         if (err) throw err
    //         console.log("Successful image insert query");
    //         res.sendStatus(200)
    //     })
    // }
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

// User this to reduce the request for logging
// const { route, user, _sessionManager, isUnauthenticated, isAuthenticated, logout, logOut, login, logIn, _passport, session, sessionID, sessionStore, _parsedOriginalUrl, signedCookies, cookies, secret, res, query, params, _parsedUrl, originalUrl, baseUrl, next, _dumped, _consuming, client, statusMessage, statusCode, method, url, upgrade, aborted, rawTrailers, trailers, rawHeaders, headers, complete, httpVersion, httpVersionMinor, httpVersionMajor, connection, socket, _maxListeners, _eventsCount, _events, readable, _readableState, body, ...qux } = req
// console.log(qux)