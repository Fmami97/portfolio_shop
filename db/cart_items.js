const pool = require("./pool");


//used to display all items in the cart
exports.getCartItems = async (user_id) => {
    const result = await pool.query('SELECT user_id, product_id ,products.name, products.description ,products.price,quantity, (products.price * quantity) as total_price  FROM cart_items LEFT JOIN products ON products.id = product_id  WHERE user_id = $1',
        [user_id]);
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

//a more dynamic version of the function above that allows multiple carts to be updated at the same time.
exports.updateCartItems = async (user_id, cart_items) => {

    if (cart_items.length === 0) {
        throw new Error("Error: the cart needs to have at least 1 item to proceed")
    }

    let query = 'INSERT INTO cart_items(user_id,product_id,quantity) VALUES ($1,$2,$3)'
    let params = [user_id, cart_items[0].product_id, cart_items[0].quantity];
    for (let i = 1; i < cart_items.length; i++) {
        query += `,($${i * 3 + 1} ,$${i * 3 + 2}, $${i * 3 + 3})`;
        params.push(user_id, cart_items[i].product_id, cart_items[i].quantity)
    }

    const result = await pool.query(query + ' ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity RETURNING *',
        params
    );
    return result.rows;
}

exports.deleteCartItem = async (user_id, product_id) => {
    const result = await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [user_id, product_id]
    );
    return result.rowCount > 0
}

//a more dynamic version of the function above, allowing multiple deletes at the same time
exports.deleteCartItems = async (user_id, product_ids) => {

    //example: product_ids = [12,29,46];
    const result = await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = ANY($2)',
        [user_id, product_ids]
    );
    return result.rowCount == product_ids.length;
}