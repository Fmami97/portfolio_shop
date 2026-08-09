const express = require("express");

const router = express.Router();

const db = require("../db/db");
const { passwordHash, comparePasswords } = require("../utils");


router.get("/", async (req, res) => {
    try {
        const result = await db.getUsers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong, please try again later." })
    }
})

module.exports = router;