const pool = require("./pool");



exports.calculateOrderTotalPrice = async (order_id) => {
    const result = await pool.query('SELECT SUM(quantity * price) AS total_price FROM order_items WHERE order_id = $1', [order_id]);
    return result.rows[0];
}

//used for display in the desired order details
exports.getOrderItems = async (order_id) => {
    const result = await pool.query('SELECT products.name, products.description ,order_items.price,order_items.quantity, (order_items.price*order_items.quantity) as "total_price"   FROM order_items JOIN PRODUCTS ON products.id = product_id  WHERE order_id = $1',
        [order_id]);
    return result.rows;
}

//an order_item is a copy of the product bought at a selected date, it needs to copy all
//entries within to prevent issues later in case product gets updated or deleted.
//TODO: work with the order_items table to fetch all entries and quantity of the product desired
exports.createOrderItem = async (order_id, name, quantity, price, description) => {
    //version without price
    //VALUES ($1,$2,$3,(SELECT price FROM products WHERE id = $2)) RETURNING *',
    const result = await pool.query('INSERT INTO order_items(order_id,name,quantity,price,description) VALUES ($1,$2,$3,$4,$5) RETURNING *'
    [order_id, name, quantity, price, description],
    );
    return result.rows[0];
}
