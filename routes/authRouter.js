const passport = require('../middleware/passportManager')


const express = require('express');

const router = express.Router();

router.post("/login", async (req, res) => {
    passport.authenticate('local', { failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/');
        }
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/home');
});


app.get("/auth/google", passport.authenticate("google", {
    scope: ['profile']
}))

router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['profile']
    }));

//IMPORTANT: the failureRedirect actually redirects the user to the frontend's login endpoint not this one.
router.get("/google/callback", passport.authenticate('google', {
    failureRedirect: '/login',
    failureMessage: true,
    successRedirect: '/home',
})
)

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
        failureMessage: true,
        successRedirect: '/home',

    }));

module.exports = router;