/**
 * This is the authentication logic to make Google OAuth2 work
 * Use this simply by loading with
 * ```
 * require('./auth')
 * ```
 * 
 * https://youtu.be/Q0a0594tOrc
 */

import dbConnect from './database.js'           // Database to set permissions on user
const pool = dbConnect(false)

// Manage Cross Origin Resource Sharing
import cors from 'cors'
// Authentication procedure (https://www.passportjs.org/)
import passport from 'passport'
// Session gives us cookies (https://www.npmjs.com/package/express-session)
import session from 'express-session'
// Server-side session store. Without this sessions are stored in ram, which is leaky and not production.
// ref: https://github.com/expressjs/session
import expressMySQLSession from 'express-mysql-session'
const MySQLStore = expressMySQLSession(session)

const sessionStoreOption = {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
}

const sessionStore = new MySQLStore(sessionStoreOption)
// to cleanly close `sessionStore.close();`

import { Strategy as GoogleStrategy } from 'passport-google-oauth2'

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,                     // Authentication requirements by Google
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/google/callback",    // Handler for coming back after authentication
        passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
        const query = `SELECT id, is_enabled FROM users WHERE username = "${profile.email}";`
        
        pool.query(query, (err, rows, fields) => {
            if (err) {
                return done(err)
            }

            // User must be registered and enabled to be allowed in
            if (rows.length != 1) {
                // user not in database
                console.log(`Failed login: ${profile.email} not a user.`)
                return done(null, false, { message: 'Not a user.' })
            } else if (!rows[0].is_enabled) {
                // user not enabled
                console.log(`Failed login: ${profile.email} not enabled.`)
                return done(null, false, { message: 'Account disabled.' })
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
    // We need to clear the frontend for cors
    app.use(cors({
        origin: [process.env.FRONTEND_URL],
        credentials: true
    }))
    
    /*****************
     * USER AUTHENTICATION
     *****************/
    
    // This was done with this video: https://youtu.be/Q0a0594tOrc
    // Use cookies securely: https://expressjs.com/en/advanced/best-practice-security.html#use-cookies-securely
    // sameSite and cookie secure flag info: https://www.npmjs.com/package/express-session#cookiesamesite

    const sessionConfig = {
        secret: process.env.SESSION_SECRET, // Encrypted session
        store: sessionStore,
        name: 'sessionId',
        resave: false,
        saveUninitialized: false,    // https://github.com/expressjs/session#saveuninitialized
        cookie: {
            httpOnly: true, // helps prevent cross-site scripting
            secure: false,
            maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
            sameSite: 'strict'
        }
    }

    if (process.env.NODE_ENV == 'production') {
        // app.set('trust proxy', 1) // trust first proxy (NGINX)
        sessionConfig.cookie.secure = true // https needed
    }

    app.use(
        session(sessionConfig),
        passport.initialize(),  // Google OAuth2 is a passport protocol
        passport.session()  // Need to track the user as a session :: req.user
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
        res.redirect(process.env.FRONTEND_URL)
    })
    
    // Failed authorization
    app.get('/auth/failure', (req, res) => {
        // TODO: Inform the user that login failed. Currently req.session.messages doesn't seem to work with google oauth.
        // Failures loop back to login link to try again.
        res.redirect(process.env.FRONTEND_URL + '/login')
    })
    
    // Log out the user
    app.post('/auth/logout', (req, res) => {
        // Logout the user: passport(req.logout) handles session.destory so no need to call it.
        req.logout((err) => {
            if (err) {
                console.log(err)
            } else {
                // we need to resolve the request so the client can continue
                res.sendStatus(204) // No-Content Success
            }
        })
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