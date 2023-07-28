/**
 * This is the authentication logic to make Google OAuth2 work
 * Use this simply by loading with
 * ```
 * require('./auth')
 * ```
 * 
 * https://youtu.be/Q0a0594tOrc
 */

import { getUserByUsername, getUserById } from '../dbOperations/database.js'
import * as path from 'path'

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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
}

const sessionStore = new MySQLStore(sessionStoreOption)
// to cleanly close `sessionStore.close();`

import { Strategy as GoogleStrategy } from 'passport-google-oauth2'

// Using the URL class to manage urls. If the api is living at a certain path,
// then using path.join inside a new URL should resolve the location desired.
// ex. staging may leave at milmed.ai/staging/, /staging/ needs to be retained.
const backendURL = new URL(process.env.BACKEND_URL)
const authCallbackURL = new URL(path.join(backendURL.pathname, "/auth/google/callback"), backendURL)

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,                     // Authentication requirements by Google
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: authCallbackURL.href,    // Handler for coming back after authentication
        passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            const user = await getUserByUsername(profile.email)
            if (!user) {
                console.log(`Failed login: ${profile.email} not a user.`)
                return done(null, false, { message: 'Not a user.' })
            } else if (!user.is_enabled) {
                console.log(`Failed login: ${profile.email} not enabled.`)
                return done(null, false, { message: 'Account disabled.' })
            } else {
                // Only store id number in session
                profile.id = user.id
                return done(null, profile)
            }

        } catch (err) {
            return done(err)
        }
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
passport.deserializeUser(async (id, done) => {
    const user = await getUserById(id)
    done(null, {
        id: user.id,
        permissions: {
            enabled: !!Number(user.is_enabled), // !!Number() returns boolean for 1 & 0
            uploader: !!Number(user.is_uploader),
            pathologist: !!Number(user.is_pathologist),
            admin: !!Number(user.is_admin),
        }
    })
})

function setup(app) {
    const frontendURL = new URL(process.env.FRONTEND_URL)

    // We need to clear the frontend for cors
    if (process.env.NODE_ENV !== 'production') {
        console.log('Dev Mode: CORS running in node.js')
        app.use(cors({
            // Regex can be used to work as a wild card for subdomains.
            // For now using matching string(s).
            // docs: https://expressjs.com/en/resources/middleware/cors.html
            origin: [frontendURL.origin],
            // need for authenticating
            credentials: true
        }))
    }
    
    
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
        app.set('trust proxy', 1) // trust first proxy (NGINX) ie. http -> https
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
    
    // Handle successful authentications
    app.get('/auth/success', (req, res) => {
        // redirect successful logins
        const redirectLink = new URL(frontendURL.href)
        // add the authentication referral path if it existss
        redirectLink.pathname = path.join(redirectLink.pathname, req.query.ref_path || '/')

        res.redirect(redirectLink.href)
    })
    
    // Failed authorization
    app.get('/auth/failure', (req, res) => {
        // TODO: Inform the user that login failed. Currently req.session.messages doesn't seem to work with google oauth.
        // Failures LOOP back to login page to try again.
        res.redirect(path.join(backendURL.pathname, '/auth/google'))
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
    app.get('/auth/google', (req, res, next) => {
        passport.authenticate('google', {
            scope: ['email'],
            prompt: "select_account",
            state:  req.query.ref_path || '/' // pass referral to auth callback
        })(req, res, next)
    })
    
    // You need to tell google where to go for successful and failed authorizations
    app.get('/auth/google/callback', (req, res, next) => {
            const query = `?ref_path=${req.query.state}`
            passport.authenticate('google', {
                failureRedirect: path.join(backendURL.pathname, '/auth/failure'), failureMessage: true,
                successRedirect: `${path.join(backendURL.pathname, '/auth/success')}${query}`
            })(req,res,next)
        }
    )
}

export default { passport, setup }
