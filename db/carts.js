const pool = require("./pool");


//there's no get all carts routes, since each cart is assigned to a user and shouldn't be shared


//this method is used to make sure a cart exists before proceeding with other requests
exports.getCartByUserId = async (user_id) => {
    const results = await pool.query("SELECT * FROM carts WHERE user_id = $1",
        [user_id]);
    return results.rows[0];
}

//this method is used to make sure a cart exists before proceeding
exports.createCartByUserId = async (user_id) => {
    const results = await pool.query("INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [user_id]);
    return results.rows[0];
}

//deleting a cart will cascade delete all cart_items
exports.deleteCart = async (user_id) => {
    const results = await pool.query("DELETE FROM carts WHERE user_id = $1",
        [user_id]);
    return results.rowCount > 0;
}