
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const https = require("https");



const { comparePasswords } = require("../utils");

const db = require('../db/db');

const API_HOST = process.env.API_HOST || "localhost";
const PORT = process.env.API_PORT || 8000;

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



//TODO: finish this method
exports.revokeToken = async (accessToken, provider) => {
    if (provider == "google") {

        let postData = "token=" + accessToken;
        let postOptions = {
            host: 'oauth2.googleapis.com',
            port: '443',
            path: '/revoke',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        // Set up the request
        const postReq = https.request(postOptions, function (res) {
            res.setEncoding('utf8');
            res.on('data', d => {
                console.log('Response: ' + d);
            });
        });

        postReq.on('error', error => {
            console.log(error)
        });
        // Post the request with data
        postReq.write(postData);
        postReq.end();
    }

}

//tokens should contain at least one object of format: {accessToken,provider}
exports.revokeTokens = async (...tokens) => {
    if (tokens.length == 0) {
        throw new Error("No token were provided");
    }



    for (let token of tokens) {
        let tokenRevoked = this.revokeTokens(token.accessToken, token.provider);
        if (!tokenRevoked) {
            throw new Error("Failed to revoke one of the tokens provided");
        }
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
passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
},
    async function (login, password, done) {

        const users = await db.getUsers();
        const existingUser = users.find((user) => user.username === login || user.email === login);

        if (existingUser) {
            const userAuth = await db.getUserAuthByProvider(existingUser.id, "local");
            if (userAuth.password_hash) {
                const passwordMatched = await comparePasswords(password, userAuth.password_hash);
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