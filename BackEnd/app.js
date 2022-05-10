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
const multer = require('multer')

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
const upload = multer({
  dest: "uploads"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});


app.post('/upload', upload.single("file" /* name attribute of <file> element in your form */), (req, res) => {
    console.log("Got past the great upload");
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./uploads/image.png");

    if (path.extname(req.file.originalname).toLowerCase() === ".png") { // check for filetype
        fs.rename(tempPath, targetPath, err => { // rename the file to image.png
            if (err) res.status(500).send("Oops! Something went wrong!");

            res.send("File uploaded!");
        });
    } else {
        fs.unlink(tempPath, err => {
            if (err) return res.status(500).send("Oops! Something went wrong!");
            res.status(403).send("Only .png files are allowed!");
        });
    }
  }
);

/*
app.use('/a',express.static('/b'));
Above line would serve all files/folders inside of the 'b' directory
And make them accessible through http://localhost:3000/a.
*/
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.post('/profile-upload-single', upload.single('profile-file'), function (req, res, next) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    console.log(JSON.stringify(req.file))
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    response += `<img src="${req.file.path}" /><br>`
    return res.send(response)
})

app.post('/profile-upload-multiple', upload.array('profile-files', 12), function (req, res, next) {
    // req.files is array of `profile-files` files
    // req.body will contain the text fields, if there were any
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    for(var i=0;i<req.files.length;i++){
        response += `<img src="${req.files[i].path}" /><br>`
    }
    
    return res.send(response)
})


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