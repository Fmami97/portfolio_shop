const pool = require("./pool");


//used to display all items in the cart
exports.getCartItems = async (user_id) => {
    const result = await pool.query('SELECT user_id, product_id ,products.name, products.description ,products.price,quantity, (products.price * quantity) as total_price  FROM cart_items LEFT JOIN products ON products.id = product_id  WHERE user_id = $1',
        [order_id]);
    return result.rows;
}

//used to fetch a single item in the cart (however, it might not need all the data)
exports.getCartItemByIds = async (user_id, product_id) => {
    const results = await pool.query('SELECT user_id, product_id ,products.name, products.description ,products.price,quantity, (products.price * quantity) as total_price  FROM cart_items LEFT JOIN products ON products.id = product_id  WHERE user_id = $1 AND product_id = $2',
        [user_id, product_id]);
    return results.rows[0];
}


exports.createCartItem = async (user_id, product_id, quantity) => {
    const result = await pool.query('INSERT INTO cart_items(user_id,product_id,quantity) VALUES ($1,$2,$3) RETURNING *',
        [user_id, product_id, quantity]
    );
    return result.rows[0];
}

exports.updateCartItem = async (user_id, product_id, quantity) => {
    const result = await pool.query('UPDATE cart_items SET quantity=$1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, user_id, product_id]
    );
    return result.rows[0];
}

exports.deleteCartItem = async (user_id, product_id) => {
    const result = await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [user_id, product_id]
    );
    return result.rowCount > 0
}
