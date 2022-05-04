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

// This is vital to parsing the requests
app.use(bodyParser.json());       // to support JSON-encoded bodies

// This is for connecting to the MariaDB db
const pool = mysql.createConnection({
    host: 'localhost',
    user: env.db.user,
    password: env.db.password,
    database: env.db.database
}) 
pool.connect()

// Google OAuth 2.0 stuff
// This was done with this video: https://youtu.be/Q0a0594tOrc
app.use(
    cookieParser(),
    session({ secret: env.google.sessionSecret }),
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

// You need to tell google where to go for successul and failed authorizations
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/failure',
        successRedirect: '/bouncer'
    })
)

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
    req.session.origin = req.originalUrl
    req.user ? next() : res.redirect('/auth')
}

function getIP(req) {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    ip = '"' + ip.substring(ip.lastIndexOf(':')+1) + '"'
    return ip
}

// NOTE: TEMP: This is more a framework than hard and fast for validity tests
function isValid(req, method, source) {
    // Handle credentials
    if (req.body.credentials != "I am valid") return false
    // Each method and source has specific requirements to be valid
    if (method === 'post') {
        if (source === 'archive') {
            // Only pathologists can archive
            let query = `SELECT is_pathologist FROM users WHERE username = ${req.body.user}`
            pool.query(query, (err, rows, fields) => {
                if (err) throw err
                return rows[0].is_pathologist // remember: truthiness
            })
        } else if (source === 'images') {
            // Anyone can add images
            return true
        } else if (source === 'users') {
            // Only admins can add users
            if (req.body.admin_credentials == 'I am an admin') {
                return true
            }
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
app.get('/nextImage', isLoggedIn, (req, res) => {
    console.log("get /images"); // tracking location
    
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

// This bounces back to the origin
app.get('/bouncer', (req, res) => {
    if (req.session.origin) {
        const origin = req.session.origin
        delete req.session.origin;
        res.redirect(origin || '/');
    } else {
        res.status(400).send({
            message: 'Session origin not defined.'
        })
    }
})

/**********************************************
 * POST
 **********************************************/

app.post('/archive', isLoggedIn, (req, res) => {
    console.log("post /archive")
    
    // REMEMBER: the data in body is in JSON format
    
    // This should check is the person is allowed to add iamges
    if (isValid(req, 'post', 'archive') || true) {
        // Insert the hotornots
        query = 'INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) VALUES '
        // TODO: handle user_id
        query += `((SELECT id FROM users WHERE username = "${req.body.user}"), ${req.body.id}, ${req.body.rating}, "${req.body.comment}", ${getIP(req)});`
        
        pool.query(query, (err, rows, fields) => {
            if (err) throw err
            console.log("Successful archive insert query");
            res.sendStatus(200)
        })
    }
})

app.post('/users', isLoggedIn, (req, res) => {
    console.log("post /users");

    /**
     * req.body = {
     *     credentials: <idk>
     *     fullname: "Maria Doe",
     *     username: "mar",
     *     password: "i_like2DB",
     *     is_pathologies: true
     * }
     */

    // this should test if person adding new users has permission
    if (false && isValid(req, 'post', 'users')) {
        // Insert new user
        query = `INSERT INTO users (fullname, username, password, is_pathologist) VALUES ("${req.body.fullname}", "${req.body.username}", "${req.body.password}", ${req.body.is_pathologist ? 1 : 0});` // insert user
        pool.query(query, (err, rows, fields) => {
            if (err) throw err
            console.log("Successful user insert query");
            res.sendStatus(200)
        })
    }
})

app.post('/images', isLoggedIn, (req, res) => {
    console.log("post /images");

    /**
     * req.body = {
     *     credentials: <idk>
     *     path: "images/leaf-path.jpeg", // should be a static path
     *     hash: NULL,
     *     user: "mar"
     * }
     */

    // this should test if person adding new users has permission
    if (false && isValid(req, 'post', 'images')) {
        // Insert new image
        query = `INSERT INTO images (path, hash, from_ip, user_id) VALUES ("${req.body.path}", ${req.body.hash}, ${getIP(req)}, (SELECT id FROM users WHERE username = "${req.body.user}"));` // insert image
        pool.query(query, (err, rows, fields) => {
            if (err) throw err
            console.log("Successful image insert query");
            res.sendStatus(200)
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