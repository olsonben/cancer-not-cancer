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
        callbackURL: "https://api.milmed.ai/auth/google/callback",
        passReqToCallback   : true
    },
    (request, accessToken, refreshToken, profile, done) => {
        // If they have logged in before, find them in the DB, if they haven't, create a new user
        // Anything involved with tracking the info on the user should go here

        // NOTE: permissions is a Buffer object
        let query = `SELECT id, permissions FROM users WHERE username = "${profile.email}";`
        
        pool.query(query, (err, rows, fields) => {
            if (err) console.log(err)
            if (rows.length != 1) return done(err, null)
            let permissions = [...rows[0].permissions] // Each element is an 8-bit unsigned int (0 --> 255)
            if (~permissions[0]&1) return done(err, null)

            profile.database = {
                id: rows[0].id,
                permissions: permissions[0] // NOTE: this MUST expand with increasing permissions
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