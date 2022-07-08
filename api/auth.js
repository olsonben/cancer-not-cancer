/**
 * This is the authentication logic to make Google OAuth2 work
 * Use this simply by loading with
 * ```
 * require('./auth')
 * ```
 */

const env = require('./.env')
const envLocal = require('./.env.local')
const mysql = require('mysql')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy

// We use the database to set permissions on the user
const pool = mysql.createConnection({
    host: 'localhost',
    user: envLocal.db.user,
    password: envLocal.db.password,
    database: envLocal.db.database
}) 
pool.connect()

passport.use(new GoogleStrategy({
        clientID: envLocal.google.clientID,                     // Authentication requirements by Google
        clientSecret: envLocal.google.clientSecret,
        callbackURL: env.url.base + "/auth/google/callback",    // Handler for coming back after authentication
        passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
        let query = `SELECT * FROM users WHERE username = "${profile.email}";`
        
        pool.query(query, (err, rows, fields) => {
            if (err) console.log(err)
            // User must be registered and enabled to be allowed in
            if (rows.length != 1 || !rows[0].is_enabled) {
                profile.allowed = false // We have to return the profile for the success route to trigger; make a note that they are not allowed
                // TODO: find if I can handle this through the failure route
                return done(null, profile)
            }
            
            // Load the profile with permissions
            profile.allowed = true
            profile.database = {
                id: rows[0].id,
                permissions: {
                    enabled: rows[0].is_enabled,
                    uploader: rows[0].is_uploader,
                    pathologist: rows[0].is_pathologist,
                    admin: rows[0].is_admin,
                }
            }
            return done(null, profile)
        })

    }
));

/**
 * Since Passport works as middleware, this is used to reduce information the user has access to/could possibly edit
 * TODO: shift user permissions handling here
 */

// Things actually saved in the session: req.session.passport.user = {id: '..'}
passport.serializeUser((user, done) => {
    done(null, user)
})

// User object attaches to req as req.user (doesn't leave the server)
passport.deserializeUser((user, done) => {
    done(null, user)
})