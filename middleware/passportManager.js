
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;


const { comparePasswords } = require("../utils");

const db = require('../db/db');

const API_HOST = process.env.API_HOST || "localhost";
const PORT = process.env.API_PORT || 8000;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;




exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (Number(req.user.id) === Number(req.user_id)) {
            return next();
        }
        return res.status(403).send("Forbidden: You can only view or modify your own data!");
    }
    res.status(401).send("User must be authenticated for this action")
}

exports.getUserInfo = async (provider, token) => {
    let result = null
    if (provider == "google") {
        result = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!result.ok) {
            throw new Error("Something went wrong when fetching google's userinfo\nthe provided token may be faulty");
        }
        return result.json();
    }
    else if (provider == "facebook") {
        result = await fetch('https://graph.facebook.com/me?fields=id', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!result.ok) {
            throw new Error("Something went wrong when fetching facebook's userinfo\nthe provided token may be faulty");
        }
        return result.json();
    }
    else {
        throw new Error("Invalid provider, please use google or facebook");
    }
}


/*
 * Passport Configurations
*/

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `http://${API_HOST}:${PORT}/v1/auth/google/callback`,
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        const userAuth = await db.getUserAuthByProviderId(profile.id || profile.sub, "google")

        if (!userAuth) {
            return done(null, { profile }, { needsRegistration: true, accessToken });
        }
        else {
            return done(null, { profile }, { needsRegistration: false });
        }
    }

));


//IMPORTANT not a real example, search here for proper guidance
//https://www.npmjs.com/package/passport-facebook
//more scopes: https://developers.facebook.com/docs/permissions
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: `http://${API_HOST}:${PORT}/v1/auth/facebook/callback`
},
    async function (request, accessToken, refreshToken, profile, done) {
        const userAuth = await db.getUserAuthByProviderId(profile.id, "facebook")

        if (!userAuth) {
            return done(null, { profile }, { needsRegistration: true, accessToken });
        }
        else {
            return done(null, { profile }, { needsRegistration: false });
        }
    }
));


//the traditionnal username and password authentication  method
passport.use(new LocalStrategy(
    async function (username, password, done) {
        const users = await db.getUsers();

        const existingUser = users.find((user) => user.username === username);

        if (existingUser) {
            const userAuth = await db.getUserAuthByProvider(existingUser.id, "local");
            if (userAuth.hash_password) {
                const passwordMatched = await comparePasswords(password, userAuth.hash_password)
                if (passwordMatched) {
                    return done(null, existingUser);
                }
                else {
                    return done(null, false);
                }
            }
        }
        return done(null, false);
    }
));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});





module.exports.passport = passport;