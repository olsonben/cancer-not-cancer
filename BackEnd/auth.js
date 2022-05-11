const env = require('./.env')
const mysql = require('mysql')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const pool = mysql.createConnection({
    host: 'localhost',
    user: env.db.user,
    password: env.db.password,
    database: env.db.database
}) 
pool.connect()

passport.use(new GoogleStrategy({
        clientID:     env.google.clientID,
        clientSecret: env.google.clientSecret,
        callbackURL: env.url.base + "/auth/google/callback",
        passReqToCallback   : true
    },
    (request, accessToken, refreshToken, profile, done) => {
        let query = `SELECT * FROM users WHERE username = "${profile.email}";`
        
        pool.query(query, (err, rows, fields) => {
            if (err) console.log(err)
            if (rows.length != 1 || !rows[0].is_enabled) return done(err, null)

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