const express = require("express");


const db = require("../db/db");

const { validate } = require("./routerUtils");
const { body } = require("express-validator");

const router = express.Router({ mergeParams: true });
const { formatError } = require("../utils");


const sanitizeNewStatus = validate([
    body('status').isString().trim().notEmpty().withMessage("invalid status input")
]);

router.get("/", async (req, res) => {
    try {
        const result = await db.getOrdersByUserId(req.user_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(formatError(error));
    }
});

router.param('order_id', async (req, res, next, order_id) => {

    const order = await db.getOrderByIds(req.user_id, order_id);

    if (order == null || order.length == 0) {
        return res.status(404).send({ error: 'order not found' });
    }
    req.order_id = order_id;

    req.order = order; // Attach to request
    next();
});


router.get("/:order_id", async (req, res, next) => {
    try {
        //since I don't need any other routes in order_items, I merged the results in a single response.
        const order_items = await db.getOrderItems(req.order_id);
        res.status(200).json({ order: req.order, order_items });
    } catch (error) {
        res.status(500).send(formatError(error));
    }

});

router.put("/:order_id", sanitizeNewStatus, async (req, res) => {
    try {
        const validStatuses = ['PENDING', 'DELIVERY', 'COMPLETED'];
        const status = req.body.status.toUpperCase();

        console.log(req.order);

        if (!validStatuses.includes(status.toString())) {
            throw new Error(`Invalid status, use the correct syntax from one of the available statuses \n( \' ${validStatuses[0]}\',\' ${validStatuses[1]}\',\' ${validStatuses[2]}\')`)
        }

        const result = await db.updateOrderStatus(req.order_id, status);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).send(formatError(error));
    }
})


module.exports = router;




