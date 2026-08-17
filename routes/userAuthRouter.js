const express = require("express")
const router = express.Router({ mergeParams: true })


//IMPORTANT: userAuthRouter.js is a child of userRouter.js
//authentication must be handled in userRouter.js


//retrieves all auth methods available for the specific user
router.get("/", async (req, res) => {
    try {
        const result = await db.getUserAuthList(req.user_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong, please try again later." })
    }
})


router.param('provider', async (req, res, next, id) => {
    const userAuth = await db.getUserAuthByProvider(id);
    if (!userAuth) {
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

router.put("/:provider", async (req, res) => {
    try {
        const updatedProvider = await db.updateUserAuthPassword(req.user_id, req.body.password, req.userAuth.id);
        if (!updatedProvider) {
            throw new Error("Wrong input, could not update the password");
        }
        else {
            res.status(200).send("password updated successfully!");
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || String(error));

    }
})


//getUserAuthByProvider is called in the param middleware
//then we use it to delete it
router.delete("/:provider", async (req, res) => {
    try {
        const result = await db.deleteUserAuth(req.userAuth.id, req.user_id);
        res.status(204).send();
    } catch (error) {
        res.status(500).send({ error: "Something went wrong, please try again later." })
    }
})


//createUserAuth route is pointless since the userAuth must be created from the usersRouter.js file.


module.exports = router;