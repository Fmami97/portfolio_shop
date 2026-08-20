const express = require("express");


const { validate } = require("./routerUtils");
const { body } = require('express-validator');

const db = require("../db/db");

const router = express.Router({ mergeParams: true });

//making sure the quantity is a positive number and higher than zero
const sanitizeNewQuantity = validate([
    body('quantity').isInt({ min: 1 }).withMessage("Invalid quantity").toInt(),
]);


//retrieves all cart items from the cart 
router.get("/", async (req, res) => {
    try {
        const result = await db.getCartItems(req.cart_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message || String(error))
    }
})


router.param('product_id', async (req, res, next, product_id) => {

    const cartItem = await db.getCartItemByIds(req.user_id, product_id);

    if (cartItem == null) {
        return res.status(404).send({ error: 'cart item not found' });
    }
    req.product_id = product_id;
    req.cartItem = cartItem; // Attach to request
    next();
});


//getCartItemByIds
router.get("/:product_id", async (req, res) => {
    res.status(200).json(req.cartItem);
});


router.post("/", sanitizeNewQuantity, async (req, res) => {
    try {
        const result = await db.createCartItem(req.user_id, req.product_id, req.body.quantity);
        res.status(201).json(result);
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || String(error));
    }
})

router.put("/", sanitizeNewQuantity, async (req, res) => {
    try {
        const result = await db.updateCartItem(req.user_id, req.product_id, req.body.quantity);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || String(error));
    }
})

router.delete("/", async (req, res) => {
    try {

        const cartItemDeleted = await db.deleteCartItem(req.user_id, req.product_id);
        if (!cartItemDeleted) {
            throw new Error("Error, couldn't delete the cart item, please check inputs or try again later");
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message || String(error))
    }
})


module.exports = router