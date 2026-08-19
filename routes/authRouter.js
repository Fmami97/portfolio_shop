const db = require('../db/db');
const { passport } = require('../middleware/passportManager')


const express = require('express');

const router = express.Router();


//backend route: localhost:8000/v1/login
//frontend route: localhost:8000/login
router.post("/login", async (req, res) => {
    passport.authenticate('local', { failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/home');
        }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/home');
});


router.get("/google", passport.authenticate("google", {
    scope: ['profile', 'email']
}))

router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['profile', 'email']
    }));

//IMPORTANT: the failureRedirect actually redirects the user to the frontend's login endpoint not this one.
router.get("/google/callback", (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err || !user) {
            return res.redirect('/login?error=oauth');
        }
        if (info.needsRegistration) {
            try {
                //bypass the registration step if another account exists with this email
                const email = user.profile.email.toLowerCase();
                const existingAuths = await db.getUserAuthListByEmail(email);
                if (existingAuths.length > 0) {
                    const success = await db.createUserAuthByProvider(user.profile.id || user.profile.sub, "google")
                    if (!success) {
                        return res.redirect(`/login?error=link_failed`);
                    }
                    return res.redirect(`/home`);
                }
                res.redirect(`/sign?token=${info.accessToken}&profile=${encodeURIComponent(JSON.stringify(user.profile))}`);
            } catch (error) {
                console.error(error.message || String(error))
                return res.redirect(`/login?error=link_failed`);
            }
        }
        else {
            res.redirect(`/home`);
        }
    })(req, res, next);
});

router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', async (err, user, info) => {
        if (err || !user) {
            return res.redirect('/login?error=oauth');
        }
        if (info.needsRegistration) {
            try {
                //bypass the registration step if another account exists with this email
                const email = user.profile.email.toLowerCase();
                const existingAuths = await db.getUserAuthListByEmail(email);
                if (existingAuths.length > 0) {
                    const success = await db.createUserAuthByProvider(user.profile.id, "facebook")
                    if (!success) {
                        return res.redirect(`/login?error=link_failed`);
                    }
                    return res.redirect(`/home`);
                }
                res.redirect(`/sign?token=${info.accessToken}&profile=${encodeURIComponent(JSON.stringify(user.profile))}`);
            } catch (error) {
                console.error(error.message || String(error))
                return res.redirect(`/login?error=link_failed`);
            }
        }
        else {
            res.redirect(`/home`);
        }
    })(req, res, next);
});

module.exports = router;