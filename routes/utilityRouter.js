const db = require('../db/db');
const { passport } = require('../middleware/passportManager')
const { ensureAuthenticated } = require("../middleware/passportManager");


const express = require('express');

const router = express.Router();


//backend route: localhost:8000/v1/login
//frontend route: localhost:8000/login
router.post("/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
            return res.redirect('/login?error=incorrect');
        }
        return logAndRedirectUser(req, res, user);
    })(req, res, next);
});

function logAndRedirectUser(req, res, user) {
    req.login(user, (err) => {
        if (err) {
            return res.redirect('/login');
        }
        return res.redirect('/home');
    });
}

router.get('/logout',ensureAuthenticated, (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/home');
    });
});



router.get("/google", passport.authenticate("google", {
    scope: ['profile', 'email']
}))

router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['profile', 'email']
    }));


//since data is the same on oauth callbacks, this method is used on both
//checks if the user needs to be registered before proceeding with the login
async function oauthHandler(req, res, user, info, provider) {
    try {
        if (!info.needsRegistration) {
            const fetchedUser = await db.getUserByEmail(user.profile.email);
            return logAndRedirectUser(req, res, fetchedUser);
        }
        //bypass the registration step if another account exists with this email
        const email = user.profile.email.toLowerCase();
        const existingAuths = await db.getUserAuthListByEmail(email);
        if (existingAuths.length > 0) {
            const success = await db.createUserAuthByProvider(existingAuths[0].user_id || user.profile.sub, provider)
            if (!success) {
                return res.redirect(`/login?error=link_failed`);
            }
            const fetchedUser = await db.getUserByEmail(email);
            return logAndRedirectUser(req, res, fetchedUser);
        }
        res.redirect(`/sign?token=${info.accessToken}&profile=${encodeURIComponent(JSON.stringify(user.profile))}`);
    } catch (error) {
        console.error(error.message || String(error))
        return res.redirect(`/login?error=link_failed`);
    }
}

//IMPORTANT: the failureRedirect actually redirects the user to the frontend's login endpoint not this one.
router.get("/google/callback", (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err || !user) {
            return res.redirect('/login?error=oauth');
        }
        return await oauthHandler(req, res, user, info, "google");
    })(req, res, next);
});

router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', async (err, user, info) => {
        if (err || !user) {
            return res.redirect('/login?error=oauth');
        }
        return await oauthHandler(req, res, user, info, "facebook");
    })(req, res, next);
});

module.exports = router;