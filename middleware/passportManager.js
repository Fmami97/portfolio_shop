
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;


const db = require('../db/db');

exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("User must be authenticated for this action")
}



const API_HOST = process.env.API_HOST || "localhost";
const PORT = process.env.API_PORT || 8000;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;



/*
 * Passport Configurations
*/

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `http://${API_HOST}:${PORT}/auth/google/callback`,
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        console.log("PROFILE:", profile)
        console.log("TOKEN :", accessToken);
        return done(null, profile);
    }

));


//IMPORTANT not a real example, search here for proper guidance
//https://www.npmjs.com/package/passport-facebook
//more scopes: https://developers.facebook.com/docs/permissions
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: `http://${API_HOST}:${PORT}/auth/facebook/callback`
},
    function (accessToken, refreshToken, profile, done) {
        console.log("PROFILE:", profile);


        done(null, profile);
    }
));


//the traditionnal username and password authentication  method
passport.use(new LocalStrategy(
    async function (username, password, done) {
        const users = await db.getUsers

    }
));
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});



module.exports.passport;