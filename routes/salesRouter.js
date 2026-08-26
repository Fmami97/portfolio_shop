const express = require("express");

const router = express.Router();

const db = require("../db/db");

const { formatError } = require("../utils");

router.get('/', async (req, res) => {
    try {
        const sales = await db.getBestSales();
        res.status(200).send(sales);

    } catch (error) {
        res.status(500).send(formatError(error));
    }
});

module.exports = router;