const pg = require("pg");

const { Pool } = pg

const pool = new Pool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.API_HOST,
    port: Number(process.env.DB_PORT),
});

module.exports = pool;