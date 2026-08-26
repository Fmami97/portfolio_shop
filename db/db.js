
const users = require("./users");
const userAuth = require("./user_auth");
const products = require("./products");
const orders = require("./orders");
const order_items = require("./order_items");
const carts = require("./carts");
const cart_items = require("./cart_items");
const sales = require("./sales");

module.exports = {
    ...users,
    ...userAuth,
    ...products,
    ...carts,
    ...cart_items,
    ...orders,
    ...order_items,
    ...sales
}
