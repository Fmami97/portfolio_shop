const express = require("express");


const db = require("../db/db");


const cartItemsRouter = require('./cartItemsRouter');
const { validate } = require("./routerUtils");

const { body } = require("express-validator");

const router = express.Router({ mergeParams: true });


//making sure the quantity is a positive number and higher than zero
const sanitizeDeliveryAddress = validate([
    body('delivery_address').trim().notEmpty().withMessage('delivery address cannot be empty').escape()
]);

//middleware that fetches or creates a new cart for the user, then sends it 
router.use("/", async (req, res, next) => {
    try {
        let result = await db.getCartByUserId(req.user_id);
        //if the cart doesn't exist yet, creates it instead;
        if (result.rowCount == 0) {
            result = await db.createCartByUserId(req.user_id);
        }
        if (result.rowCount == 0) {
            throw new Error("Couldn't create the cart with the provided user's id, \nPlease try again later.")
        }
        req.cart = result.rows[0];
        next();
    } catch (error) {
        res.status(500).send(error.message || String(error))
    }
});

router.get("/", async (req, res, next) => {
    res.status(200).json(req.cart);
});


router.use("/items", cartItemsRouter);



router.post("/checkout", sanitizeDeliveryAddress, async (req, res) => {
    try {
        const delivery_address = req.body.delivery_address;

        const cart_items = await db.getCartItems(req.user_id);
        const orderCreated = await db.createOrder(req.user_id);

        if (!orderCreated || orderCreated.rowCount == 0) {
            throw new Error("Error, couldn't create a new Order for checkout");
        }

        const order_items = []
        for (const item of cart_items) {
            const itemCreated = await createOrderItem(orderCreated.order_id, item.name, item.quantity, item.price, item.description)
            if (!itemCreated || itemCreated.rowCount == 0) {
                throw new Error("Error, couldn't insert an order item for checkout");
            }
            order_items.push(itemCreated);
        }

        //calculateTotalOrder directly returns the total_price value instead of a row (return result.rows[0].total_price)
        const total_price = await db.calculateTotalOrder(orderCreated.order_id);
        const updatedOrder = await db.updateOrderTotalPrice(orderCreated.order_id, total_price);

        if (!updatedOrder || updatedOrder.rowCount == 0) {
            throw new Error("Error, couldn't update total_price entry for the order");
        }

        const cart_deleted = await db.deleteCart(req.user_id);
        if (!cart_deleted) {
            throw new Error("Error, couldn't delete the cart after completing the checkout");
        }

        res.status(201).json({ "order": updatedOrder, order_items })
    } catch (error) {
        res.status(500).send(error.message || String(error));
    }
});


//in case the user wants to delete their cart
router.delete("/", async (req, res) => {
    try {
        const result = await db.deleteCart(req.cart.user_id, req.user_id);
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message || String(error))
    }
})

module.exports = router;