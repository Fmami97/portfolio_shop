const pool = require("./pool");


//destined to be used alongside passport authentication
exports.getUserAuthByProviderId = async (provider, provider_id) => {
    const results = await pool.query('SELECT * FROM user_auth WHERE provider = $1 AND provider_id = $2', [provider]);
    return results.rows;
}


exports.getProductById = async (id) => {

    const results = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return results.rows[0];

}

exports.updateProduct = async (id, newProduct, oldProduct) => {

    let name = Object.hasOwn(newProduct, "name") ? newProduct.name : oldProduct.name;
    let price = Object.hasOwn(newProduct, "price") ? newProduct.price : oldProduct.price;
    let description = oldProduct.description;
    console.log(price);
    //nullable values are falsy by default, if we want to erase
    //the data, we must make sure it exists inside
    if (Object.hasOwn(newProduct, 'description')) {
        description = newProduct.description;
    }

    const result = await pool.query('UPDATE products SET name= $1 ,price= $2 ,description=$3 WHERE id = $4 RETURNING *',
        [
            name,
            price,
            description,
            id
        ]
    );
    return result.rows[0];
}


exports.createProduct = async (id, newProduct) => {

    const result = await pool.query('INSERT INTO products(name,price,description) VALUES ($1,$2,$3) RETURNING *',
        [
            newProduct.name,
            newProduct.price,
            Object.hasOwn(newProduct, 'description') ? newProduct.description : null
        ]
    );
    return result.rows[0];
}

exports.deleteProduct = async (id) => {
    const result = await pool.query('DELETE FROM products WHERE id = $1',
        [
            id
        ]
    );
    return result.rowCount > 0;
}
