const mariadb = require('mariadb');
require('dotenv').config();

module.exports = async () => {
    const pool = mariadb.createPool({
        host: 'localhost',
        idleTimeout: 900000, // timeout set to 15 minutes? set to 0 for no timeout
        database: 'PluralGame', // desktop
        //database: 'pluralgame', // server
        user: process.env.MDB_USER,
        password: process.env.MDB_PASS,
    });

    let conn;

    try {
        conn = await pool.getConnection();
        console.log('Connection successful!');
    } catch (e) {
        console.log(e)
        console.log('Connection error!');
    }

    return [pool, conn];
};