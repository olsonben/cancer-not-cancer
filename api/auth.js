const env = require('./.env')
const envLocal = require('./.env.local')
const mysql = require('mysql')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const InternalOAuthError = require('passport-oauth2').InternalOAuthError

const pool = mysql.createConnection({
    host: 'localhost',
    user: envLocal.db.user,
    password: envLocal.db.password,
    database: envLocal.db.database
}) 
pool.connect()

passport.use(new GoogleStrategy({
        clientID: envLocal.google.clientID,
        clientSecret: envLocal.google.clientSecret,
        callbackURL: env.url.base + "/auth/google/callback",
        passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
        let query = `SELECT * FROM users WHERE username = "${profile.email}";`
        
        pool.query(query, (err, rows, fields) => {
            if (err) console.log(err)
            if (rows.length != 1 || !rows[0].is_enabled) {
                profile.allowed = false
                return done(null, profile)
            }
            
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

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})