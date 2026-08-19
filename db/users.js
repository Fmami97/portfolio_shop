
const pool = require("./pool");


exports.getUsers = async () => {
    const results = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return results.rows
}

exports.getUserById = async (id) => {
    const results = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return results.rows[0];
}

exports.getUserLocalAuthByUsername = async (username) => {
    const results = await pool.query('SELECT  FROM users WHERE username = $1 AND ', [username]);
    return results.rows[0];
}

exports.createUser = async (username, fullname, email) => {
    const result = await pool.query('INSERT INTO users (username,fullname,email) VALUES($1,$2,$3) RETURNING *', [username, fullname, email]);
    return result.rows[0];
}

//cannot update the email entry
exports.updateUser = async (username, fullname, userToUpdate) => {

    let newUsername = username != null ? username : userToUpdate.username;
    let newFullname = fullname != null ? fullname : userToUpdate.fullname;

    const result = await pool.query('UPDATE users SET username=$1, fullname=$2 WHERE id=$3 RETURNING *', [newUsername, newFullname, userToUpdate.id]);
    return result.rows[0];
}

exports.deleteUser = async (id) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
}
