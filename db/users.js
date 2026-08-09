
const pool = require("./pool");

exports.getUsers = async () => {
    const results = await pool.query('SELECT * FROM users');
    return results.rows
}

