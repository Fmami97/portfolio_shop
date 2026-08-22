const express = require("express");


const { validate } = require("./routerUtils");
const { body } = require('express-validator');

const db = require("../db/db");

const { formatError } = require("../utils");
const router = express.Router({ mergeParams: true });

//making sure the quantity is a positive number and higher than zero
const sanitizeNewQuantity = validate([
    body('quantity').isInt({ min: 1 }).withMessage("Invalid quantity").toInt(),
]);

const sanitizeNewQuantities = validate([
    body('cart_items.*.product_id').isInt({ min: 1 }).withMessage("product doesn't exist").toInt(),
    body('cart_items.*.quantity').isInt({ min: 1 }).withMessage("Invalid quantity").toInt()
]);



//retrieves all cart items from the cart 
router.get("/", async (req, res) => {
    try {
        const result = await db.getCartItems(req.user_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(formatError(error))
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
        const result = await db.createCartItem(req.user_id, req.body.product_id, req.body.quantity);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).send(formatError(error));
    }
})

router.put("/:product_id", sanitizeNewQuantity, async (req, res) => {
    try {
        const result = await db.updateCartItem(req.user_id, req.product_id, req.body.quantity);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).send(formatError(error));
    }
})

router.put("/", sanitizeNewQuantities, async (req, res) => {
    try {
        const result = await db.updateCartItems(req.user_id, req.body.cart_items);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).send("one of the products provided doesn't exist");
    }
})

router.delete("/:product_id", async (req, res) => {
    try {

        const cartItemDeleted = await db.deleteCartItem(req.user_id, req.product_id);
        if (!cartItemDeleted) {
            throw new Error("Error, couldn't delete the cart item, please check inputs or try again later");
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).send(formatError(error))
    }
})

router.delete("/", async (req, res) => {
    try {
        const itemsDeleted = await db.deleteCartItems(req.cart.user_id, req.body.product_ids);

        if (itemsDeleted) {
            res.status(204).send();
        }
        else {
            res.status(404).send("one or multiple products were not found in the cart")
        }
    } catch (error) {
        res.status(500).send(formatError(error))
    }
})

module.exports = router