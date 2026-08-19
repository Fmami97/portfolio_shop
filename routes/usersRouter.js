const express = require("express");

const router = express.Router();

const { validate } = require("./routerUtils");
const { body } = require('express-validator');

const db = require("../db/db");

const { ensureAuthenticated, getUserInfo } = require("../middleware/passportManager");

const { comparePasswords, passwordHash } = require("../utils");

const userAuthRouter = require('./userAuthRouter');



//IMPORTANT: in the frontend, you cannot send an empty string 
//in the optional entries, they must be absent
//something like: formData = {username}
// if (password.trim().length > 0) formData["password"]= password.trim();


const sanitizeNewUser = validate([
    body('fullname').optional().trim().notEmpty().withMessage('Fullname cannot be empty').escape(),
    body('username').trim().notEmpty().withMessage('Username cannot be empty').escape(),
    body('email').trim().isEmail().withMessage('Invalid email input').escape(),
    body('password').optional({ nullable: true }).trim().isStrongPassword({ minLength: 10, minUppercase: 1, minLowercase: 1, minSymbols: 1 }).withMessage('Invalid password, make sure the passwords contains at least 10 characters, with at least 1 symbol and 1 lowercase and uppercase letter')
]);


const sanitizeUpdateUser = validate([
    body('fullname').optional().trim().notEmpty().withMessage('Fullname cannot be empty').escape(),
    body('username').optional().trim().notEmpty().withMessage('Username cannot be empty').escape()
])

router.get("/", async (req, res) => {
    try {
        const result = await db.getUsers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong, please try again later." })
    }
})


router.param('id', async (req, res, next, id) => {
    const user = await db.getUserById(id);
    if (!user) {
        return res.status(404).send({ error: 'user not found' });
    }
    req.user_id = id;
    req.requestedUser = user; // Attach to request
    next();
});


router.use("/:id/auth", ensureAuthenticated, userAuthRouter);


router.get("/:id", async (req, res) => {
    res.status(200).json(req.requestedUser);
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const success = await db.deleteUser(req.user_id)
        if (!success) {
            throw new Error("User not found");
        } else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(404).send(error.message || String(error));
    }
});


// for a password change, it must be done in the /users/:id/auth route
router.put('/:id', ensureAuthenticated, sanitizeUpdateUser, async (req, res) => {
    try {
        const updatedUser = await db.updateUser(req.body.username, req.body.fullname, req.requestedUser);
        if (!updatedUser) {
            throw new Error("Couldn't update user, check for proper input or try again later");
        }
        res.status(200).json(updatedUser).send();
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || String(error));

    }
});


// when creating an user, this endpoint expects either a password or a proper provider and provider_id
// to create user's authentication method at the same time as their profile.
router.post('/', sanitizeNewUser, async (req, res) => {
    try {
        let password = Object.hasOwn(req.body, "password") ? req.body.password : null;
        let token = Object.hasOwn(req.body, "token") ? req.body.token : null
        let provider = Object.hasOwn(req.body, "provider") ? req.body.provider : "local";
        let userinfo = null

        if (token) {
            userinfo = await db.getUserInfo(provider, token);
        }

        const provider_id = userinfo != null ? userinfo.id || userinfo.sub : null;

        //password OR provider_id must not be null to proceed, regardless of sanitization
        if (provider !== "local" && provider_id === null) {
            throw new Error(`Cannot create user with ${provider} auth, the provider_id wasn't set properly`);
        }
        else if (provider === "local" && password === null) {
            throw new Error("Cannot create user with a local auth, there's no password provided");
        }

        const newUser = await db.createUser(req.body.username, req.body.fullname, req.body.email.toLowerCase());
        if (!newUser) {
            throw new Error("Couldn't create user, check for proper input or try again later");
        }
        else {
            let authUser = null;
            if (provider === "local") {
                const password_hash = await passwordHash(password);
                authUser = await db.createUserAuthByLocal(newUser.id, password_hash)
            }
            else {
                authUser = await db.createUserAuthByProvider(newUser.id, provider, provider_id);
            }
            if (!authUser) {
                throw new Error("User authentication method couldn't be propely set. Check for proper input or try again later.");
            }
            res.status(201).json(newUser)
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || String(error));

    }
});

module.exports = router;