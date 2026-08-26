const express = require("express");


const db = require("../db/db");

const cartItemsRouter = require('./cartItemsRouter');
const { validate } = require("./routerUtils");

const { body } = require("express-validator");

const router = express.Router({ mergeParams: true });

const { formatError } = require("../utils");


//making sure the quantity is a positive number and higher than zero
const sanitizeDeliveryAddress = validate([
    body('delivery_address').trim().notEmpty().withMessage('delivery address cannot be empty')
]);

//middleware that fetches or creates a new cart for the user, then sends it 
router.use("/", async (req, res, next) => {
    try {
        let result = await db.getCartByUserId(req.user_id);
        //if the cart doesn't exist yet, creates it instead;
        if (!result) {
            result = await db.createCartByUserId(req.user_id);
        }
        if (!result) {
            throw new Error("Couldn't create the cart with the provided user's id, \nPlease try again later.")
        }
        req.cart = result;
        next();
    } catch (error) {
        res.status(500).send(formatError(error))
    }
});

router.get("/", async (req, res, next) => {
    res.status(200).json(req.cart);
});


router.use("/items", cartItemsRouter);



//by the way, snake_case is used to represent database columns (such as user_id) and table_names (such as cart_item)
//camelCase is used to represent variables
router.post("/checkout", sanitizeDeliveryAddress, async (req, res) => {
    try {
        const delivery_address = req.body.delivery_address;

        const cart_items = await db.getCartItems(req.user_id);
        const orderCreated = await db.createOrder(req.user_id, delivery_address);

        if (!orderCreated || orderCreated.rowCount == 0) {
            throw new Error("Error, couldn't create a new Order for checkout");
        }

        const sales_items = await db.createSales(cart_items);
        if (!sales_items || sales_items.rowCount == 0) {
            throw new Error("Error, couldn't create the sales based on the cart items");
        }
        const order_items = await db.createOrderItems(orderCreated.id, cart_items);

        //calculateTotalOrder directly returns the total_price value instead of a row
        const total_price = await db.calculateOrderTotalPrice(orderCreated.id);
        const updatedOrder = await db.updateOrderTotalPrice(orderCreated.id, total_price);

        if (!updatedOrder || updatedOrder.rowCount == 0) {
            throw new Error("Error, couldn't update total_price entry for the order");
        }

        const cart_deleted = await db.deleteCart(req.user_id);
        if (!cart_deleted) {
            throw new Error("Error, couldn't delete the cart after completing the checkout");
        }

        res.status(201).json({ "order": updatedOrder, order_items })
    } catch (error) {
        res.status(500).send(formatError(error));
    }
});


//in case the user wants to delete their cart without doing checkout.
router.delete("/", async (req, res) => {
    try {
        const result = await db.deleteCart(req.user_id);
        res.status(204).send();
    } catch (error) {
        res.status(500).send(formatError(error))
    }
})

module.exports = router;