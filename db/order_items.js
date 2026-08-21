const pool = require("./pool");


exports.calculateOrderTotalPrice = async (order_id) => {
    const result = await pool.query('SELECT SUM(quantity * price) AS total_price FROM order_items WHERE order_id = $1', [order_id]);
    return result.rows[0].total_price;
}

//used for display in the desired order details
exports.getOrderItems = async (order_id) => {
    const result = await pool.query('SELECT name, description ,price,quantity, (price*quantity) as "total_price" FROM order_items WHERE order_id = $1',
        [order_id]);
    return result.rows;
}



//since creating order_items is a single action done at checkout, no need for single endpoints
exports.createOrderItems = async (order_id, cart_items) => {

    //we need to keep a copy of the data inside product in case it changes in the future.

    if (cart_items.length === 0) {
        throw new Error("Error: the cart needs to have at least 1 item to proceed")
    }

    let query = 'INSERT INTO order_items(order_id,name,quantity,price,description) VALUES ($1,$2,$3,$4,$5)'
    let params = [order_id, cart_items[0].name, cart_items[0].quantity, cart_items[0].price, cart_items[0].description];
    for (let i = 1; i < cart_items.length; i++) {
        query += `,($${i * 5 + 1} ,$${i * 5 + 2}, $${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5})`;

        params.push(order_id, cart_items[i].name, cart_items[i].quantity, cart_items[i].price, cart_items[i].description)
    }

    const result = await pool.query(query + ' RETURNING *',
        params
    );
    return result.rows;
}
