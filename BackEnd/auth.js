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
        let query = `SELECT id, is_pathologist, enabled FROM users WHERE username = "${profile.email}";`
        
        pool.query(query, (err, rows, fields) => {
            if (err) console.log(err);
            if (rows.length != 1) return done(err, null);
            
            profile.database = {
                id: rows[0].id,
                is_pathologist: rows[0].is_pathologist,
                enabled: rows[0].enabled,
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