const env = require('./.env')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
        clientID:     env.google.clientID,
        clientSecret: env.google.clientSecret,
        callbackURL: "https://api.milmed.ai/auth/google/callback",
        passReqToCallback   : true
    },
    (request, accessToken, refreshToken, profile, done) => {
        // If they have logged in before, find them in the DB, if they haven't, create a new user
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})