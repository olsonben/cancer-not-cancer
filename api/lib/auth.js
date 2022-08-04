/**
 * This is the authentication logic to make Google OAuth2 work
 * Use this simply by loading with
 * ```
 * require('./auth')
 * ```
 * 
 * https://youtu.be/Q0a0594tOrc
 */

import env from '../.env.js'                    // Public environment variables
import envLocal from '../.env.local.js'         // Private "
import dbConnect from './database.js'           // Database to set permissions on user
import { bounce } from './functions.js'         // Functions
const pool = dbConnect(false)

import passport from 'passport'                 // Authentication procedure (https://www.passportjs.org/)
import session from 'express-session'           // Session gives us cookies (https://www.npmjs.com/package/express-session)
import cookieParser from 'cookie-parser'        // We need to track things about the session (https://www.npmjs.com/package/cookie-parser)
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'

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

function setup(app) {
    /*****************
     * USER AUTHENTICATION
     *****************/
    
    // This was done with this video: https://youtu.be/Q0a0594tOrc
    app.use(
        cookieParser(),                                     // Use cookies to track the session         :: req.session
        session({
            secret: envLocal.session.secret,                // Encrypted session
            resave: true,                                   // Using default is deprecated :: This is the default value
            saveUninitialized: true   
        }),
        passport.initialize(),                              // Google OAuth2 is a passport protocol
        passport.session()                                  // Need to track the user as a session      :: req.user
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
}

export default { passport, setup }