/**
 * This is the authentication logic to make Google OAuth2 work
 * Use this simply by loading with
 * ```
 * require('./auth')
 * ```
 * 
 * https://youtu.be/Q0a0594tOrc
 */

import env from '../.env.js'
import envLocal from '../.env.local.js'
import mysql from 'mysql'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'

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
        const query = `SELECT id, is_enabled FROM users WHERE username = "${profile.email}";`
        
        pool.query(query, (err, rows, fields) => {
            if (err) console.log(err)
            // User must be registered and enabled to be allowed in
            if (rows.length != 1) {
                return done(null, false, { message: 'User not in database.' })
            } else if (!rows[0].is_enabled) {
                return done(null, false, { message: 'User not enabled.' })
            }
            
            profile.id = rows[0].id     // Only store id number in session
            return done(null, profile)
        })
    }
));

/**
 * Since Passport works as middleware, this is used to reduce information the user has access to/could possibly edit
 */

// Things actually saved in the session: req.session.passport.user = {id: '..'}
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// User object attaches to req as req.user (doesn't leave the server)
passport.deserializeUser((id, done) => {
    const query = `SELECT * FROM users WHERE id = "${id}";`
    pool.query(query, (err, rows, fields) => {
        // Store permissions to req.user
        done(null, {
            id: rows[0].id,
            permissions: {
                enabled: rows[0].is_enabled,
                uploader: rows[0].is_uploader,
                pathologist: rows[0].is_pathologist,
                admin: rows[0].is_admin,
            }
        })
    })
})

export default passport