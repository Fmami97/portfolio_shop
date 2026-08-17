const express = require("express");

const router = express.Router();

const { validate } = require("./routerUtils");
const { body } = require('express-validator');

const db = require("../db/db");

const { ensureAuthenticated } = require("../middleware/passportManager");

const { comparePasswords, passwordHash } = require("../utils");

const userAuthRouter = require('./userAuthRouter');



//TODO: both must be sanitized properly
const sanitizeNewUser = validate([
    body('fullname').optional().trim(),
    body('username').trim().escape(),
    body('password').optional({ nullable: true }).trim().isStrongPassword({ minLength: 10, minUppercase: 1, minSymbols: 1 })
]);


router.get("/", async (req, res) => {
    try {
        const result = await db.getUsers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong, please try again later." })
    }
})


router.param('id', async (req, res, next, id) => {
    const user = await db.getUserInfoById(id);
    if (!user) {
        return res.status(404).send({ error: 'user not found' });
    }
    req.user_id = id;
    req.user = user; // Attach to request
    next();
});


router.use("/:id/auth", ensureAuthenticated, userAuthRouter);


router.get("/:id", async (req, res) => {
    try {
        const result = await db.getUserInfoById();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong, please try again later." })
    }
});

router.delete('/:id', async (req, res) => {
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


router.put('/:id', sanitizeNewUser, async (req, res) => {

    // try {
    //     const updatedProduct = await db.updateProduct(req.user_id, req.body, req.product);
    //     if (!updatedProduct) {
    //         throw new Error("Wrong input, query failed");
    //     }
    //     else {
    //         res.status(200).json(updatedProduct);
    //     }
    // } catch (error) {
    //     console.log(error);
    //     res.status(400).send(error.message || || String(error));

    // }
});


// when creating an user, this endpoint expects either a password or a proper provider and provider_id
// to create user's authentication method at the same time as their profile.
router.post('/', sanitizeNewUser, async (req, res) => {
    try {
        let provider = Object.hasOwn(req.body, "provider") ? req.body.provider : "local";
        let password = Object.hasOwn(req.body, "password") ? req.body.password : null;
        let provider_id = Object.hasOwn(newProduct, "provider_id") ? req.body.provider_id : null;


        //password OR provider_id must not be null to proceed, regardless of sanitization
        if (provider === "local" && password === null) {
            throw new Error("Cannot create user, there's no password provided");
        }
        else if (provider !== "local" && provider_id === null) {
            throw new Error("Cannot create user, the provider_id wasn't set properly");
        }

        const password_hash = passwordHash(password)

        const newUser = await db.createUser(req.body.username, req.body.fullname);
        if (!newUser) {
            throw new Error("Couldn't create user, check for proper input or try again later");
        }
        else {
            let authUser = null;
            if (provider === "local") {
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