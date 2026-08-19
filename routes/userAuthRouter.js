const express = require("express")
const router = express.Router({ mergeParams: true })

const { body } = require('express-validator');
const { validate } = require("./routerUtils");

const db = require("../db/db");
const { passwordHash } = require("../utils");


//IMPORTANT: userAuthRouter.js is a child of userRouter.js
//authentication must be handled in userRouter.js


const sanitizePassword = validate([
    body('password').trim().isStrongPassword({ minLength: 10, minUppercase: 1, minLowercase: 1, minSymbols: 1 }).withMessage('Invalid password, make sure the passwords contains 10 characters, with at least 1 symbol and 1 lowercase and uppercase letter')
]);


//retrieves all auth methods available for the specific user
router.get("/", async (req, res) => {
    try {
        const result = await db.getUserAuthList(req.user_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message || String(error))
    }
})


router.param('provider', async (req, res, next, provider) => {

    const userAuth = await db.getUserAuthByProvider(req.user_id, provider);
    console.log(userAuth)

    if (userAuth == null) {
        return res.status(404).send({ error: 'user not found' });
    }
    req.userAuth = userAuth; // Attach to request
    next();
});


//getUserAuthByProvider is called in the param middleware
router.get("/:provider", async (req, res) => {
    try {
        res.status(200).json(req.userAuth);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong, please try again later." })
    }
})



//creates or updates the password of the user for the local auth method.
router.post("/", sanitizePassword, async (req, res) => {
    try {
        console.log(req.user_id);
        const existingAuth = await db.getUserAuthByProvider(req.user_id, "local");

        const newPassword = await passwordHash(req.body.password)
        let provider = null;

        if (!existingAuth) {
            provider = await db.createUserAuthByLocal(req.user_id, newPassword);

            if (provider) {
                res.status(200).send("password created successfully!");
                return
            }
        }
        else {
            provider = await db.updateUserAuthPassword(req.user_id, newPassword, existingAuth.id);
            if (provider) {
                res.status(200).send("password updated successfully!");
                return
            }
        }
        throw new Error("Wrong input, could not update the password");
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || String(error));
    }
})


//getUserAuthByProvider is called in the param middleware
//then we use it to delete it
router.delete("/:provider", async (req, res) => {
    try {
        //IMPORTANT: deny the deletion if that is the last authentication method available for that user

        const authList = await db.getUserAuthList(req.user_id);
        if (authList.length === 1) {
            return res.status(403).send("Cannot proceed with the deletion, this is the last available authentication method.");
        }

        const result = await db.deleteUserAuth(req.userAuth.id, req.user_id);
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message || String(error))
    }
})


//createUserAuth route is pointless since the userAuth must be created from the usersRouter.js file.


module.exports = router;