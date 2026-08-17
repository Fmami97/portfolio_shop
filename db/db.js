
const users = require("./users");
const userAuth = require("./user_auth");
const products = require("./products");

module.exports = {
    ...users,
    ...userAuth,
    ...products
}
