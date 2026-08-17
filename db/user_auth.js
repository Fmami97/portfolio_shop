
const pool = require("./pool");


//IMPORTANT: all requests below are designed to be used alongside an authentication method to prevent security issues.


//USER_AUTH TABLE



//returns all authentication methods savec for that specific user
exports.getUserAuthList = async (user_id) => {
    const results = await pool.query('SELECT id,provider,provider_id,password_hash FROM user_auth WHERE user_id = $1', [user_id]);
    return results.rows;
}

exports.getUserAuthByProvider = async (user_id, provider) => {
    const results = await pool.query('SELECT id,provider,provider_id,password_hash FROM user_auth WHERE user_id = $1 AND provider=$2', [user_id, provider]);
    return result.rows[0]
}

exports.updateUserAuthPassword = async (user_id, password_hash, user_auth_id) => {
    //will only work on 'local' providers
    const result = await pool.query('UPDATE user_auth SET password_hash= $1 WHERE provider = $2 AND id = $3 AND user_id = $4 RETURNING *',
        [password_hash, 'local', user_auth_id, user_id],
    );
    return result.rows[0];
}


//inserts a new authentication entry for oauth2 methods
//IMPORTANT: this method is called from the usersRouter.js file.
exports.createUserAuthByProvider = async (user_id, provider, provider_id) => {

    const result = await pool.query('INSERT INTO user_auth(user_id,provider,provider_id) VALUES ($1,$2,$3) RETURNING *',
        [
            user_id,
            provider,
            provider_id
        ]
    );
    return result.rows[0];
}

//inserts a new authentication entry with the traditional username and password method
//IMPORTANT: this method is called from the usersRouter.js file.
exports.createUserAuthByLocal = async (user_id, password_hash) => {

    const result = await pool.query('INSERT INTO user_auth(user_id,provider,password_hash) VALUES ($1,$2,$3) RETURNING *',
        [
            user_id,
            'local',
            password_hash
        ]
    );
    return result.rows[0];
}

//deletes a specific auth provider of a user from the database
//all providers are deleted at the same time if user is deleted (cascade)
exports.deleteUserAuth = async (id, user_id) => {
    const result = await pool.query('DELETE FROM user_auth WHERE id = $1 AND user_id=$2',
        [
            id,
            user_id
        ]
    );
    return result.rowCount > 0;
}