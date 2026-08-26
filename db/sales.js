const pool = require("./pool");


//retrieves the top 3 most sold items in the shop
exports.getBestSales = async () => {
    const result = await pool.query('SELECT sales.product_id, products.name, products.price, products.description, SUM(sales.quantity) AS total_sold FROM sales LEFT JOIN products ON sales.product_id = products.id GROUP BY sales.product_id, products.name, products.price, products.description ORDER BY total_sold DESC LIMIT 3;');
    return result.rows;
}


//only gets used when a new checkout has been made and follows the same idea as order_items.js
exports.createSales = async (cart_items) => {

    //we need to keep a copy of the data inside product in case it changes in the future.

    if (cart_items.length === 0) {
        throw new Error("Error: the sale cannot be created without an item in the cart")
    }

    let query = 'INSERT INTO sales(product_id,quantity) VALUES ($1,$2)'
    let params = [cart_items[0].product_id, cart_items[0].quantity];
    for (let i = 1; i < cart_items.length; i++) {
        query += `,($${i * 2 + 1} ,$${i * 2 + 2})`;

        params.push(cart_items[i].product_id, cart_items[i].quantity);
    }
    const result = await pool.query(query + ' RETURNING *',
        params
    );
    return result.rows;
}