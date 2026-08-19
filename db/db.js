
const users = require("./users");
const userAuth = require("./user_auth");
const products = require("./products");
const orders = require("./orders");
const order_items = require("./order_items");

module.exports = {
    ...users,
    ...userAuth,
    ...products,
    ...orders,
    ...order_items
}
