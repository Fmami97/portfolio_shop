const pool = require("./pool");




//used for display in the desired order details
exports.getOrdersByUserId = async (user_id) => {
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1)',
        [user_id]);
    return result.rows;
}


exports.createOrder = async (user_id, delivery_address) => {

    const result = await pool.query('INSERT INTO orders(user_id,delivery_address) VALUES ($1,$2) RETURNING *'
    [user_id, delivery_address],
    );
    return result.rows[0];
}


//IMPORTANT: this method should be done after inserting all order_items and
//using the method calculateOrderTotalPrice
exports.updateOrderTotalPrice = async (order_id, total_price) => {
    const result = await pool.query('UPDATE orders SET total_price = $1 WHERE order_id = $2 RETURNING *'
    [total_price, order_id],
    );
    return result.rows[0];
}

exports.updateOrderStatus = async (order_id, status) => {
    const result = await pool.query('UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *'
    [status, order_id],
    );
    return result.rows[0];
}
